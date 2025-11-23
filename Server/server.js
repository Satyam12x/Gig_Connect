require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { check, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const { Server } = require("socket.io");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cookieParser = require("cookie-parser");
const cluster = require("cluster");
const os = require("os");
const helmet = require("helmet");
const compression = require("compression");
const winston = require("winston");

// 1. LOGGER SETUP (T Version 1)
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "gig-connect-backend" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// 2. LOAD BALANCER (CLUSTER)
const enableCluster = process.env.ENABLE_CLUSTER === "true";
const numCPUs = os.cpus().length;

if (enableCluster && cluster.isPrimary) {
  logger.info(`Primary process ${process.pid} is running`);
  logger.info(`Forking ${numCPUs} workers for load balancing...`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // 3. WORKER PROCESS (THE ACTUAL APP)
  const app = express();
  const server = http.createServer(app);
  const PORT = process.env.PORT || 5000;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // SECURITY & PERFORMANCE MIDDLEWARE
  app.use(helmet());
  app.use(compression());

  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    })
  );
  app.use(express.json());

  //  AUTH MIDDLEWARES
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fallback-super-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // RATE LIMITERS
  const limiterConfig = (windowMs, max, msg) =>
    rateLimit({
      windowMs,
      max,
      message: msg,
      keyGenerator: (req) => req.userId || req.ip,
      standardHeaders: true,
      legacyHeaders: false,
    });

  const applyLimiter = limiterConfig(
    15 * 60 * 1000,
    10,
    "Too many requests, please try again later."
  );
  const messageLimiter = limiterConfig(
    60 * 1000,
    5,
    "Too many messages sent, please wait a minute."
  );
  const attachmentLimiter = limiterConfig(
    15 * 60 * 1000,
    5,
    "Too many attachment uploads, please try again later."
  );

  //  MONGODB SCHEMAS
  const userSchema = new mongoose.Schema(
    {
      _id: { type: String, required: true },
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true },
      college: { type: String },
      bio: { type: String, default: "" },
      profilePicture: { type: String, default: "" },
      role: {
        type: String,
        enum: ["Seller", "Buyer", "Both"],
        default: "Both",
      },
      isVerified: { type: Boolean, default: false },
      skills: [{ name: String, endorsements: { type: Number, default: 0 } }],
      certifications: [{ name: String, issuer: String }],
      orderHistory: [
        { title: String, status: String, earnings: Number, date: Date },
      ],
      gigsCompleted: { type: Number, default: 0 },
      totalGigs: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      credits: { type: Number, default: 0, min: 0 },
      socialLinks: {
        linkedin: String,
        github: String,
        instagram: String,
      },
      emailOtp: String,
      emailOtpExpire: Date,
      ratings: [
        {
          value: { type: Number, required: true, min: 1, max: 5 },
          ticketId: { type: String, ref: "Ticket", required: true },
          giverId: { type: String, ref: "User", required: true },
          givenAt: { type: Date, default: Date.now },
        },
      ],
      onboarded: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    } catch (err) {
      logger.error("Password hashing error:", err);
      next(err);
    }
  });

  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  const User = mongoose.model("User", userSchema);

  const pendingUserSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    fullName: String,
    email: String,
    password: String,
    college: String,
    role: String,
    bio: String,
    socialLinks: {
      linkedin: String,
      github: String,
      instagram: String,
    },
    isVerified: Boolean,
    otp: String,
    otpExpire: Date,
  });

  const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

  const reviewSchema = new mongoose.Schema({
    userId: { type: String, ref: "User", required: true },
    reviewerName: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: Date, default: Date.now },
  });

  const Review = mongoose.model("Review", reviewSchema);

  const gigSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    sellerName: { type: String, required: true, trim: true },
    sellerId: { type: String, ref: "User", required: true },
    thumbnail: { type: String, default: "" },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    createdAt: { type: Date, default: Date.now },
  });

  const applicationSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    gigId: { type: String, ref: "Gig", required: true },
    applicantId: { type: String, ref: "User", required: true },
    applicantName: { type: String, required: true, trim: true },
    coverLetter: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  });

  const ticketSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    gigId: { type: String, ref: "Gig", required: true },
    sellerId: { type: String, ref: "User", required: true },
    buyerId: { type: String, ref: "User", required: true },
    status: {
      type: String,
      enum: ["open", "negotiating", "accepted", "paid", "completed", "closed"],
      default: "open",
    },
    agreedPrice: { type: Number, min: 0 },
    messages: [
      {
        _id: {
          type: String,
          default: () => crypto.randomBytes(16).toString("hex"),
        },
        senderId: { type: String, ref: "User", required: true },
        senderName: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        attachment: { type: String, default: "" },
        read: { type: Boolean, default: false },
      },
    ],
    timeline: [
      {
        _id: {
          type: String,
          default: () => crypto.randomBytes(16).toString("hex"),
        },
        action: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  });

  // Indexes for performance
  applicationSchema.index({ gigId: 1, applicantId: 1 });
  ticketSchema.index({ gigId: 1, sellerId: 1, buyerId: 1 });
  ticketSchema.index({ "messages.timestamp": -1 });
  ticketSchema.index({ "timeline.timestamp": -1 });

  const Gig = mongoose.model("Gig", gigSchema);
  const Application = mongoose.model("Application", applicationSchema);
  const Ticket = mongoose.model("Ticket", ticketSchema);

  //  PASSPORT CONFIG
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ _id: id }).lean();
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:5000/api/auth/google/callback",
        scope: ["profile", "email"],
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const fullName = profile.displayName?.trim() || email.split("@")[0];
          const photo = profile.photos?.[0]?.value || "";

          if (!email) return done(new Error("No email from Google"));

          const isSignup = req.query.state === "signup";
          let user = await User.findOne({ email }).lean();

          if (isSignup) {
            if (user) {
              return done(null, false, { message: "account_exists" });
            }
            const userId = crypto.randomBytes(16).toString("hex");
            const dummyPassword = await bcrypt.hash(
              crypto.randomBytes(20).toString("hex"),
              10
            );
            user = {
              _id: userId,
              fullName,
              email,
              password: dummyPassword,
              role: "Both",
              isVerified: true,
              profilePicture: photo,
              onboarded: false,
              skills: [],
              certifications: [],
              orderHistory: [],
              gigsCompleted: 0,
              totalGigs: 0,
              completionRate: 0,
              credits: 0,
              ratings: [],
            };
            await User.create(user);
            logger.info(`New Google user created: ${userId}`);
            return done(null, user);
          } else {
            if (!user) {
              return done(null, false, { message: "no_account" });
            }
            if (!user.onboarded) {
              return done(null, false, { message: "not_onboarded" });
            }
            logger.info(`Existing user logged in: ${user._id}`);
            return done(null, user);
          }
        } catch (err) {
          logger.error("Google OAuth error:", err);
          return done(err);
        }
      }
    )
  );

  //  DATABASE CONNECT
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => logger.info(`[Worker ${process.pid}] MongoDB connected`))
    .catch((err) => logger.error("MongoDB connection error:", err));

  //  HELPERS (Multer, Cloudinary, Email)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    logger.info("Cloudinary configured successfully");
  } catch (err) {
    logger.error("Cloudinary configuration error:", err);
  }

  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|pdf/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(
        file.originalname.split(".").pop().toLowerCase()
      );
      if (mimetype && extname) return cb(null, true);
      cb(new Error("File must be an image (jpg, jpeg, png) or PDF"));
    },
  });

  //  CUSTOM MIDDLEWARE
  const authMiddleware = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      logger.error("No Authorization header provided");
      return res.status(401).json({ error: "No token, authorization denied" });
    }
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      logger.error("No token found after parsing");
      return res.status(401).json({ error: "No token, authorization denied" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user =
        (await User.findOne({ _id: decoded.id }).select(
          "-password -emailOtp -emailOtpExpire"
        )) || (await PendingUser.findOne({ _id: decoded.id }));
      if (!user) {
        logger.error(`User not found for ID: ${decoded.id}`);
        return res.status(401).json({ error: "Token is not valid" });
      }
      req.user = user;
      req.userId = decoded.id;
      next();
    } catch (err) {
      logger.error("Token verification error:", err.message);
      res.status(401).json({ error: "Token is not valid" });
    }
  };

  const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: `Only ${roles.join(" or ")} roles are allowed` });
    }
    next();
  };

  const checkGigOwner = async (req, res, next) => {
    try {
      const gig = await Gig.findOne({ _id: req.params.id }).lean();
      if (!gig) return res.status(404).json({ error: "Gig not found" });
      if (gig.sellerId !== req.userId) {
        return res
          .status(403)
          .json({ error: "Only the gig owner can perform this action" });
      }
      req.gig = gig;
      next();
    } catch (err) {
      logger.error("Gig owner check error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  };

  const checkTicketParticipant = async (req, res, next) => {
    try {
      const ticket = await Ticket.findOne({ _id: req.params.id }).lean();
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });
      if (![ticket.sellerId, ticket.buyerId].includes(req.userId)) {
        return res
          .status(403)
          .json({ error: "Only ticket participants can perform this action" });
      }
      req.ticket = ticket;
      next();
    } catch (err) {
      logger.error("Ticket participant check error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  };

  // Validation middleware arrays
  const validateMessage = [
    check("content")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Message must be between 1 and 1000 characters"),
  ];
  const validatePrice = [
    check("agreedPrice")
      .isFloat({ min: 0.01 })
      .withMessage("Agreed price must be a positive number"),
  ];
  const validateRating = [
    check("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be a number between 1 and 5"),
  ];

  // 4. ROUTES

  // User Signup
  app.post(
    "/api/auth/signup",
    [
      check("fullName").trim().notEmpty().withMessage("Full name is required"),
      check("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Valid email is required"),
      check("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
      check("role")
        .optional()
        .isIn(["Seller", "Buyer", "Both"])
        .withMessage("Invalid role"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fullName, email, password, college, role, bio, socialLinks } =
        req.body;
      try {
        let user = await User.findOne({ email }).lean();
        if (user)
          return res.status(400).json({ error: "Email already in use" });

        const userId = crypto.randomBytes(16).toString("hex");
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const userData = {
          _id: userId,
          fullName,
          email,
          password,
          college,
          role: role || "Both",
          bio: bio || "",
          socialLinks: socialLinks || {},
          isVerified: false,
          otp,
          otpExpire: Date.now() + 10 * 60 * 1000,
        };

        await PendingUser.create(userData);
        logger.info(`Pending user added: ${userId}`);

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Verify your Gig Connect account",
          html: `<p>Your OTP is <strong>${otp}</strong>. Enter it to verify your account. It expires in 10 minutes.</p>`,
        };
        await transporter.sendMail(mailOptions);
        res.json({
          success: true,
          token,
          message: "Signup successful. Check your email for OTP.",
        });
      } catch (err) {
        logger.error("Signup error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Verify OTP
  app.post(
    "/api/auth/verify-otp",
    authMiddleware,
    [
      check("otp")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { otp } = req.body;
      try {
        const pendingUser = await PendingUser.findOne({
          _id: req.userId,
        }).lean();
        if (!pendingUser)
          return res.status(400).json({ error: "User not found" });
        if (pendingUser.otp !== otp || pendingUser.otpExpire < Date.now()) {
          return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const user = new User({
          _id: pendingUser._id,
          fullName: pendingUser.fullName,
          email: pendingUser.email,
          password: pendingUser.password,
          college: pendingUser.college,
          role: pendingUser.role,
          bio: pendingUser.bio,
          socialLinks: pendingUser.socialLinks,
          isVerified: true,
          onboarded: false,
          skills: [],
          certifications: [],
          orderHistory: [],
          gigsCompleted: 0,
          totalGigs: 0,
          completionRate: 0,
          credits: 0,
          ratings: [],
        });
        await user.save();
        await PendingUser.deleteOne({ _id: req.userId });
        logger.info(`User verified and moved to User collection: ${user._id}`);

        res.json({
          success: true,
          message: "OTP verified. Please set your profile picture or skip.",
        });
      } catch (err) {
        logger.error("OTP verification error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Skip Profile Setup
  app.post("/api/users/skip-profile", authMiddleware, async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.userId }).lean();
      if (!user) return res.status(400).json({ error: "User not found" });
      if (!user.isVerified) {
        return res
          .status(400)
          .json({ error: "Please verify your email first" });
      }

      res.json({ success: true, message: "Profile setup complete" });
    } catch (err) {
      logger.error("Skip profile error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Upload Profile Picture
  app.post(
    "/api/users/upload-profile",
    authMiddleware,
    upload.single("image"),
    async (req, res) => {
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (!user.isVerified) {
          return res
            .status(400)
            .json({ error: "Please verify your email first" });
        }
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const stream = cloudinary.uploader.upload_stream(
          { folder: "gigconnect/profiles", resource_type: "image" },
          async (error, result) => {
            if (error) {
              logger.error("Cloudinary upload error:", error);
              return res.status(500).json({
                error: "Failed to upload image to Cloudinary",
                details: error.message,
              });
            }

            try {
              user.profilePicture = result.secure_url;
              await user.save();
              logger.info(
                `Profile picture updated for ${user._id}. URL: ${result.secure_url}`
              );
              res.json({ success: true, profilePicture: result.secure_url });
            } catch (err) {
              logger.error("Database update error:", err);
              res.status(500).json({
                error: "Failed to update user profile",
                details: err.message,
              });
            }
          }
        );

        Readable.from(req.file.buffer).pipe(stream);
      } catch (err) {
        logger.error("Profile picture upload error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Update Profile Picture (PUT variant)
  app.put(
    "/api/users/profile-picture",
    authMiddleware,
    upload.single("profilePicture"),
    async (req, res) => {
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) {
          logger.error(`User not found for ID: ${req.userId}`);
          return res.status(400).json({ error: "User not found" });
        }
        if (!req.file) {
          logger.error("No file provided in profile picture update");
          return res.status(400).json({ error: "No file uploaded" });
        }

        const stream = cloudinary.uploader.upload_stream(
          { folder: "gigconnect/profiles", resource_type: "image" },
          async (error, result) => {
            if (error) {
              logger.error("Cloudinary upload error:", error);
              return res.status(500).json({
                error: "Failed to upload image to Cloudinary",
                details: error.message,
              });
            }

            try {
              user.profilePicture = result.secure_url;
              await user.save();
              logger.info(
                `Profile picture updated for user: ${user._id}. URL: ${result.secure_url}`
              );
              res.json({ success: true, profilePicture: result.secure_url });
            } catch (err) {
              logger.error("Database update error:", err);
              res.status(500).json({
                error: "Failed to update profile picture in database",
                details: err.message,
              });
            }
          }
        );

        Readable.from(req.file.buffer).pipe(stream);
      } catch (err) {
        logger.error("Profile picture update error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Update Profile
  app.put(
    "/api/users/profile",
    authMiddleware,
    [
      check("fullName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Full name cannot be empty"),
      check("bio")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Bio must be 500 characters or less"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fullName, college, bio, socialLinks } = req.body;
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (fullName) user.fullName = fullName;
        if (college) user.college = college;
        if (bio) user.bio = bio;
        if (socialLinks) user.socialLinks = socialLinks;
        await user.save();
        res.json({ success: true, message: "Profile updated" });
      } catch (err) {
        logger.error("Profile update error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Request Email OTP
  app.post(
    "/api/users/request-email-otp",
    authMiddleware,
    [
      check("newEmail")
        .isEmail()
        .normalizeEmail()
        .withMessage("Valid email is required"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { newEmail } = req.body;
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (await User.findOne({ email: newEmail })) {
          return res.status(400).json({ error: "Email already in use" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailOtp = otp;
        user.emailOtpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: newEmail,
          subject: "Verify your new email for Gig Connect",
          html: `<p>Your OTP is <strong>${otp}</strong>. Enter it to verify your new email. It expires in 10 minutes.</p>`,
        };
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent to new email" });
      } catch (err) {
        logger.error("Email OTP request error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Verify Email OTP
  app.post(
    "/api/users/verify-email-otp",
    authMiddleware,
    [
      check("newEmail")
        .isEmail()
        .normalizeEmail()
        .withMessage("Valid email is required"),
      check("otp")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { newEmail, otp } = req.body;
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (user.emailOtp !== otp || user.emailOtpExpire < Date.now()) {
          return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        user.email = newEmail;
        user.emailOtp = undefined;
        user.emailOtpExpire = undefined;
        await user.save();

        res.json({ success: true, message: "Email updated successfully" });
      } catch (err) {
        logger.error("Email OTP verification error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Update Password
  app.put(
    "/api/users/password",
    authMiddleware,
    [
      check("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
      check("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch)
          return res
            .status(400)
            .json({ error: "Current password is incorrect" });

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: "Password updated" });
      } catch (err) {
        logger.error("Password update error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Auth Check
  app.get("/api/auth/check", async (req, res) => {
    try {
      const authHeader = req.header("Authorization");
      if (!authHeader) return res.json({ authenticated: false });

      const token = authHeader.replace("Bearer ", "");
      if (!token) return res.json({ authenticated: false });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded.id })
        .select("-password -emailOtp -emailOtpExpire")
        .lean();

      if (!user) return res.json({ authenticated: false });

      res.json({
        authenticated: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          onboarded: user.onboarded ?? false,
        },
      });
    } catch (err) {
      logger.error("Auth check error:", err.message);
      res.json({ authenticated: false });
    }
  });

  // Add Skill
  app.post(
    "/api/users/skills",
    authMiddleware,
    [check("skill").trim().notEmpty().withMessage("Skill name is required")],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { skill } = req.body;
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (
          user.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())
        ) {
          return res.status(400).json({ error: "Skill already exists" });
        }
        user.skills.push({ name: skill, endorsements: 0 });
        await user.save();
        res.json({ success: true, message: "Skill added" });
      } catch (err) {
        logger.error("Skill add error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Delete Skill
  app.delete(
    "/api/users/skills/:skillName",
    authMiddleware,
    async (req, res) => {
      const { skillName } = req.params;
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(400).json({ error: "User not found" });
        user.skills = user.skills.filter((s) => s.name !== skillName);
        await user.save();
        res.json({ success: true, message: "Skill removed" });
      } catch (err) {
        logger.error("Skill delete error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Endorse Skill
  app.post(
    "/api/users/endorse",
    authMiddleware,
    [
      check("userId").notEmpty().withMessage("User ID is required"),
      check("skill").trim().notEmpty().withMessage("Skill name is required"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, skill } = req.body;
      try {
        const user = await User.findOne({ _id: userId });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (user._id === req.userId) {
          return res
            .status(400)
            .json({ error: "Cannot endorse your own skill" });
        }
        user.skills = user.skills.map((s) =>
          s.name === skill
            ? { ...s, endorsements: (s.endorsements || 0) + 1 }
            : s
        );
        await user.save();
        res.json({ success: true, message: "Skill endorsed" });
      } catch (err) {
        logger.error("Skill endorsement error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Add Certification
  app.post(
    "/api/users/certifications",
    authMiddleware,
    [
      check("name")
        .trim()
        .notEmpty()
        .withMessage("Certification name is required"),
      check("issuer").trim().notEmpty().withMessage("Issuer is required"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, issuer } = req.body;
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (user.certifications?.length >= 2) {
          return res
            .status(400)
            .json({ error: "Maximum 2 certifications allowed" });
        }
        if (user.certifications?.some((c) => c.name === name)) {
          return res
            .status(400)
            .json({ error: "Certification already exists" });
        }
        user.certifications = user.certifications || [];
        user.certifications.push({ name, issuer });
        await user.save();
        res.json({ success: true, message: "Certification added" });
      } catch (err) {
        logger.error("Certification add error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Delete Certification
  app.delete(
    "/api/users/certifications/:certName",
    authMiddleware,
    async (req, res) => {
      const { certName } = req.params;
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(400).json({ error: "User not found" });
        user.certifications = user.certifications.filter(
          (c) => c.name !== certName
        );
        await user.save();
        res.json({ success: true, message: "Certification removed" });
      } catch (err) {
        logger.error("Certification delete error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Get User Profile with stats
  app.get("/api/users/profile", authMiddleware, async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user._id })
        .select("-password -emailOtp -emailOtpExpire")
        .lean();

      if (!user) return res.status(400).json({ error: "User not found" });

      const ratings = user.ratings || [];
      const averageRating =
        ratings.length > 0
          ? (
              ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
            ).toFixed(1)
          : 0;

      const totalEarnings =
        user.orderHistory
          ?.filter((o) => o.status === "completed")
          .reduce((sum, o) => sum + (o.earnings || 0), 0) || 0;

      let badge = "New";
      if (user.gigsCompleted >= 10) badge = "Pro";
      else if (user.gigsCompleted >= 5) badge = "Rising Star";
      else if (user.gigsCompleted >= 1) badge = "Active";

      res.json({
        ...user,
        name: user.fullName,
        rating: parseFloat(averageRating),
        completedGigs: user.gigsCompleted || 0,
        earnings: totalEarnings,
        badge,
        reviews: ratings.length,
      });
    } catch (err) {
      logger.error("Profile fetch error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Get Public User Profile
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select(
          "fullName college bio profilePicture role skills certifications socialLinks gigsCompleted totalGigs completionRate credits ratings orderHistory"
        )
        .lean();

      if (!user) return res.status(404).json({ error: "User not found" });

      const ratings = user.ratings || [];
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
          : 0;

      let badge = "New";
      if (user.gigsCompleted >= 10) badge = "Pro";
      else if (user.gigsCompleted >= 5) badge = "Rising Star";
      else if (user.gigsCompleted >= 1) badge = "Active";

      res.json({
        ...user,
        rating: parseFloat(averageRating.toFixed(1)),
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingsCount: ratings.length,
        badge,
        gigsCompleted: user.gigsCompleted || 0,
        totalGigs: user.totalGigs || 0,
        completionRate: user.completionRate || 0,
      });
    } catch (err) {
      logger.error("Public profile error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/gigs/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (
        !mongoose.Types.ObjectId.isValid(userId) &&
        !/^[0-9a-fA-F]{32}$/.test(userId)
      ) {
        // Basic check if it's not a valid mongo ID or custom hex ID
        // Allowing pass-through if unsure, logic handled by find
      }

      const gigs = await Gig.find({ sellerId: userId }) // Fixed query: sellerId not seller
        .sort({ createdAt: -1 })
        .lean();

      res.json(gigs);
    } catch (err) {
      logger.error("Error fetching user gigs:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Login
  app.post(
    "/api/auth/login",
    [
      check("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Valid email is required"),
      check("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      try {
        const user = await User.findOne({ email });
        if (!user)
          return res.status(400).json({ error: "Invalid email or password" });

        const isMatch = await user.matchPassword(password);
        if (!isMatch)
          return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );
        res.json({
          success: true,
          token,
          user: { id: user._id, fullName: user.fullName, role: user.role },
        });
      } catch (err) {
        logger.error("Login error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Get Reviews
  app.get("/api/reviews", authMiddleware, async (req, res) => {
    try {
      const reviews = await Review.find({ userId: req.userId })
        .sort({ date: -1 })
        .lean();
      res.json(reviews);
    } catch (err) {
      logger.error("Reviews fetch error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Create Review
  app.post(
    "/api/reviews",
    authMiddleware,
    [
      check("userId").notEmpty().withMessage("User ID is required"),
      check("text")
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage("Review text must be between 10 and 500 characters"),
      check("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, text, rating } = req.body;
      try {
        const user = await User.findOne({ _id: userId }).lean();
        if (!user) return res.status(400).json({ error: "User not found" });
        if (user._id === req.userId) {
          return res.status(400).json({ error: "Cannot review yourself" });
        }
        const review = new Review({
          userId,
          reviewerName: req.user.fullName,
          text,
          rating,
        });
        await review.save();
        res.json({ success: true, message: "Review created" });
      } catch (err) {
        logger.error("Review creation error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Create Gig
  app.post(
    "/api/gigs",
    authMiddleware,
    checkRole(["Seller", "Both"]),
    upload.single("thumbnail"),
    [
      check("title")
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),
      check("description")
        .trim()
        .isLength({ min: 20, max: 1000 })
        .withMessage("Description must be between 20 and 1000 characters"),
      check("category").trim().notEmpty().withMessage("Category is required"),
      check("price")
        .isFloat({ min: 0.01 })
        .withMessage("Price must be a positive number"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, category, price } = req.body;
      try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (!user.isVerified)
          return res.status(400).json({ error: "User not verified" });

        let thumbnailUrl = "";
        if (req.file) {
          const fileStream = Readable.from(req.file.buffer);
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "gig_thumbnails" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            fileStream.pipe(uploadStream);
          });
          thumbnailUrl = uploadResult.secure_url;
        }

        const gigId = crypto.randomBytes(16).toString("hex");
        const gig = await Gig.create({
          _id: gigId,
          title,
          sellerName: user.fullName,
          sellerId: user._id,
          thumbnail: thumbnailUrl,
          description,
          category,
          price: parseFloat(price),
          status: "open",
        });

        user.totalGigs = (user.totalGigs || 0) + 1;
        await user.save();

        logger.info(`Gig created: ${gigId} by ${user._id}`);
        res.status(201).json({ success: true, gig });
      } catch (err) {
        logger.error("Create gig error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Get All Gigs
  app.get("/api/gigs", async (req, res) => {
    try {
      const { category, search, page = 1, limit = 10 } = req.query;
      const query = { status: "open" };
      if (category) query.category = { $regex: `^${category}$`, $options: "i" };
      if (search) query.title = { $regex: search, $options: "i" };

      const gigs = await Gig.find(query)
        .select(
          "title sellerName sellerId thumbnail description category price rating status createdAt"
        )
        .populate({
          path: "sellerId",
          select: "ratings",
        })
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean();

      const gigsWithReviews = gigs.map((gig) => {
        const ratings = gig.sellerId?.ratings || [];
        return {
          ...gig,
          reviews: ratings.length,
          sellerId: gig.sellerId?._id || gig.sellerId,
        };
      });

      const total = await Gig.countDocuments(query);

      res.json({
        success: true,
        gigs: gigsWithReviews,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)) || 1,
      });
    } catch (err) {
      logger.error("Get gigs error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Get Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await Gig.distinct("category");
      res.json({ success: true, categories });
    } catch (err) {
      logger.error("Get categories error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Debug Gigs
  app.get("/api/debug/gigs", async (req, res) => {
    try {
      const gigs = await Gig.find({}).lean();
      const total = await Gig.countDocuments({});
      res.json({
        success: true,
        gigs,
        total,
        message: "All gigs in the database, including closed ones",
      });
    } catch (err) {
      logger.error("Debug gigs error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Get Recent Gigs
  app.get("/api/gigs/recent", async (req, res) => {
    try {
      const gigs = await Gig.find({ status: "open" })
        .select(
          "title sellerName sellerId thumbnail description category price rating status createdAt"
        )
        .populate({
          path: "sellerId",
          select: "ratings",
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const gigsWithReviews = gigs.map((gig) => {
        const ratings = gig.sellerId?.ratings || [];
        return {
          ...gig,
          reviews: ratings.length,
          sellerId: gig.sellerId?._id || gig.sellerId,
        };
      });

      res.json(gigsWithReviews);
    } catch (err) {
      logger.error("Recent gigs fetch error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Get Gig by ID
  app.get("/api/gigs/:id", async (req, res) => {
    try {
      const gig = await Gig.findOne({ _id: req.params.id }).lean();
      if (!gig) {
        logger.error(`Gig not found for ID: ${req.params.id}`);
        return res.status(404).json({ error: "Gig not found" });
      }
      res.json(gig);
    } catch (err) {
      logger.error("Get gig by ID error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Update Gig
  app.put(
    "/api/gigs/:id",
    authMiddleware,
    checkRole(["Seller", "Both"]),
    checkGigOwner,
    upload.single("thumbnail"),
    [
      check("title")
        .optional()
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),
      check("description")
        .optional()
        .trim()
        .isLength({ min: 20, max: 1000 })
        .withMessage("Description must be between 20 and 1000 characters"),
      check("category")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category cannot be empty"),
      check("price")
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage("Price must be a positive number"),
      check("status")
        .optional()
        .isIn(["open", "closed"])
        .withMessage("Invalid status. Must be 'open' or 'closed'"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, category, price, status } = req.body;
      try {
        const gig = await Gig.findOne({ _id: req.params.id });
        if (!gig) return res.status(404).json({ error: "Gig not found" });

        if (req.file) {
          const fileStream = Readable.from(req.file.buffer);
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "gig_thumbnails" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            fileStream.pipe(uploadStream);
          });
          gig.thumbnail = uploadResult.secure_url;
        }

        if (title) gig.title = title;
        if (description) gig.description = description;
        if (category) gig.category = category;
        if (price) gig.price = parseFloat(price);
        if (status) gig.status = status;

        await gig.save();
        logger.info(`Gig updated: ${gig._id}`);
        res.json({ success: true, gig });
      } catch (err) {
        logger.error("Update gig error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Delete Gig
  app.delete(
    "/api/gigs/:id",
    authMiddleware,
    checkRole(["Seller", "Both"]),
    checkGigOwner,
    async (req, res) => {
      try {
        const gig = await Gig.findOne({ _id: req.params.id });
        if (!gig) return res.status(404).json({ error: "Gig not found" });

        const applications = await Application.find({
          gigId: req.params.id,
          status: "pending",
        });
        for (const app of applications) {
          app.status = "rejected";
          await app.save();
          const applicant = await User.findOne({ _id: app.applicantId }).lean();
          if (applicant) {
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: applicant.email,
              subject: `Application Update for Gig "${gig.title}"`,
              html: `<p>Dear ${applicant.fullName},</p><p>The gig "${gig.title}" has been deleted, and your application has been rejected.</p><p>Explore other gigs on Gig Connect.</p>`,
            };
            await transporter.sendMail(mailOptions).catch((err) => {
              logger.error("Failed to send rejection email:", err);
            });
          }
        }

        await Gig.deleteOne({ _id: req.params.id });

        const user = await User.findOne({ _id: req.userId });
        if (user) {
          user.totalGigs = Math.max(0, (user.totalGigs || 0) - 1);
          await user.save();
        }

        logger.info(`Gig deleted: ${req.params.id}`);
        res.json({ success: true, message: "Gig deleted" });
      } catch (err) {
        logger.error("Delete gig error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Get Gigs by Seller
  app.get("/api/users/:id/gigs", async (req, res) => {
    try {
      const gigs = await Gig.find({ sellerId: req.params.id })
        .select(
          "title thumbnail description category price rating status createdAt"
        )
        .sort({ createdAt: -1 })
        .lean();
      res.json(gigs);
    } catch (err) {
      logger.error("Get seller gigs error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Submit Application and Create Ticket
  app.post(
    "/api/gigs/:id/apply",
    authMiddleware,
    applyLimiter,
    [
      check("coverLetter")
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage("Cover letter must be between 10 and 1000 characters"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const isValidId = /^[0-9a-fA-F]{32}$/.test(req.params.id);
        if (!isValidId) {
          logger.error(`Invalid gig ID format: ${req.params.id}`);
          return res.status(400).json({ error: "Invalid gig ID format" });
        }

        const gig = await Gig.findOne({ _id: req.params.id }).lean();
        if (!gig) {
          return res.status(404).json({ error: "Gig not found" });
        }

        if (gig.status === "closed") {
          return res
            .status(400)
            .json({ error: "This gig is closed for applications" });
        }

        if (gig.sellerId === req.userId) {
          return res
            .status(400)
            .json({ error: "You cannot apply to your own gig" });
        }

        const existingApplication = await Application.findOne({
          gigId: req.params.id,
          applicantId: req.userId,
        }).lean();
        if (existingApplication) {
          return res.status(400).json({
            error: `You have already applied to this gig (Status: ${existingApplication.status})`,
          });
        }

        const user = await User.findOne({ _id: req.userId }).lean();
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }
        if (!user.isVerified) {
          return res.status(400).json({
            error: "Please verify your email before applying for gigs",
          });
        }

        const applicationId = crypto.randomBytes(16).toString("hex");
        const application = new Application({
          _id: applicationId,
          gigId: req.params.id,
          applicantId: req.userId,
          applicantName: req.user.fullName,
          coverLetter: req.body.coverLetter || "",
          status: "pending",
        });
        await application.save();

        const ticketId = crypto.randomBytes(16).toString("hex");
        const ticket = new Ticket({
          _id: ticketId,
          gigId: req.params.id,
          sellerId: gig.sellerId,
          buyerId: req.userId,
          status: "open",
          messages: [
            {
              _id: crypto.randomBytes(16).toString("hex"),
              senderId: req.userId,
              senderName: req.user.fullName,
              content: sanitizeHtml(
                `I have applied to your gig "${gig.title}". Let's discuss the details!`
              ),
              timestamp: new Date(),
              read: false,
            },
          ],
          timeline: [
            {
              _id: crypto.randomBytes(16).toString("hex"),
              action: `Ticket created by ${req.user.fullName}`,
              timestamp: new Date(),
            },
          ],
        });
        await ticket.save();

        const seller = await User.findOne({ _id: gig.sellerId }).lean();
        if (seller) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: seller.email,
            subject: `New Application for "${gig.title}"`,
            html: `<p>Dear ${seller.fullName},</p><p>${
              req.user.fullName
            } has applied to your gig "${
              gig.title
            }" with the following cover letter:</p><p>"${
              req.body.coverLetter || "No cover letter provided"
            }"</p><p>View the application and discuss at: /tickets/${ticketId}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            logger.error("Failed to send application email:", {
              error: err.message,
            });
          });
        }

        logger.info(`Application and ticket created: ${applicationId}`);
        res.status(201).json({ success: true, application, ticketId });
      } catch (err) {
        logger.error("Application submission error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Get Applications for a Gig
  app.get(
    "/api/gigs/:id/applications",
    authMiddleware,
    checkGigOwner,
    async (req, res) => {
      try {
        const applications = await Application.find({ gigId: req.params.id })
          .populate("applicantId", "fullName email profilePicture")
          .sort({ createdAt: -1 })
          .lean();
        res.json(applications);
      } catch (err) {
        logger.error("Get applications error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Get User's Applications
  app.get("/api/users/:id/applications", async (req, res) => {
    try {
      const authHeader = req.header("Authorization");
      if (!authHeader) return res.json([]);

      const token = authHeader.replace("Bearer ", "");
      if (!token) return res.json([]);

      let userId;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        logger.error("Token verification error:", err.message);
        return res.json([]);
      }

      if (userId !== req.params.id) {
        return res
          .status(403)
          .json({ error: "You can only view your own applications" });
      }

      const applications = await Application.find({
        applicantId: req.params.id,
      })
        .populate("gigId", "title category price status")
        .sort({ createdAt: -1 })
        .lean();
      res.json(applications);
    } catch (err) {
      logger.error("Get user applications error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Accept/Reject Application
  app.patch(
    "/api/gigs/:id/applications/:applicationId",
    authMiddleware,
    checkGigOwner,
    [
      check("status")
        .isIn(["accepted", "rejected"])
        .withMessage("Invalid status. Must be 'accepted' or 'rejected'"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status } = req.body;
      try {
        const application = await Application.findOne({
          _id: req.params.applicationId,
        });
        if (!application)
          return res.status(404).json({ error: "Application not found" });
        if (application.gigId.toString() !== req.params.id) {
          return res
            .status(400)
            .json({ error: "Application does not belong to this gig" });
        }
        if (application.status !== "pending") {
          return res
            .status(400)
            .json({ error: `Application is already ${application.status}` });
        }

        const gig = await Gig.findOne({ _id: req.params.id }).lean();
        if (!gig) return res.status(404).json({ error: "Gig not found" });

        application.status = status;
        await application.save();

        const ticket = await Ticket.findOne({
          gigId: req.params.id,
          buyerId: application.applicantId,
        });
        if (ticket) {
          ticket.status = status === "accepted" ? "accepted" : ticket.status;
          ticket.timeline.push({
            _id: crypto.randomBytes(16).toString("hex"),
            action: `Application ${status} by ${req.user.fullName}`,
            timestamp: new Date(),
          });
          await ticket.save();
        }

        const seller = await User.findOne({ _id: gig.sellerId }).lean();
        const buyer = await User.findOne({
          _id: application.applicantId,
        }).lean();
        if (seller && buyer) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: buyer.email,
            subject: `Your Application for "${gig.title}" Was ${
              status.charAt(0).toUpperCase() + status.slice(1)
            }`,
            html: `<p>Dear ${buyer.fullName},</p><p>Your application for "${
              gig.title
            }" has been ${status} by ${seller.fullName}.</p>${
              status === "accepted"
                ? `<p>Continue negotiation in your ticket: /tickets/${ticket._id}</p>`
                : "<p>Explore other gigs on Gig Connect.</p>"
            }`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            logger.error("Failed to send application status email:", err);
          });
        }

        logger.info(`Application status updated: ${req.params.applicationId}`);
        res.json({ success: true, application });
      } catch (err) {
        logger.error("Application status update error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Get User's Tickets
  app.get("/api/users/:id/tickets", async (req, res) => {
    try {
      const authHeader = req.header("Authorization");
      if (!authHeader) return res.json([]);

      const token = authHeader.replace("Bearer ", "");
      if (!token) return res.json([]);

      let userId;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        logger.error("Token verification error:", err.message);
        return res.json([]);
      }

      if (userId !== req.params.id) {
        return res
          .status(403)
          .json({ error: "You can only view your own tickets" });
      }

      const tickets = await Ticket.find({
        $or: [{ sellerId: userId }, { buyerId: userId }],
      })
        .populate("gigId", "title")
        .populate("sellerId", "fullName email profilePicture")
        .populate("buyerId", "fullName email profilePicture")
        .sort({ createdAt: -1 })
        .lean();
      res.json(tickets);
    } catch (err) {
      logger.error("Get user tickets error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  // Get Ticket by ID
  app.get(
    "/api/tickets/:id",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id })
          .populate("gigId", "title price")
          .populate("sellerId", "fullName email profilePicture")
          .populate("buyerId", "fullName email profilePicture")
          .lean();
        if (!ticket) {
          logger.error(`Ticket not found for ID: ${req.params.id}`);
          return res.status(404).json({ error: "Ticket not found" });
        }
        res.json(ticket);
      } catch (err) {
        logger.error("Get ticket error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Send Message in Ticket
  app.post(
    "/api/tickets/:id/messages",
    authMiddleware,
    checkTicketParticipant,
    messageLimiter,
    validateMessage,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content } = req.body;
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status === "closed") {
          return res.status(400).json({ error: "Ticket is closed" });
        }

        ticket.messages.push({
          _id: crypto.randomBytes(16).toString("hex"),
          senderId: req.userId,
          senderName: req.user.fullName,
          content: sanitizeHtml(content),
          timestamp: new Date(),
          read: false,
        });
        if (ticket.status === "open") {
          ticket.status = "negotiating";
          ticket.timeline.push({
            _id: crypto.randomBytes(16).toString("hex"),
            action: `Ticket moved to negotiating by ${req.user.fullName}`,
            timestamp: new Date(),
          });
        }
        ticket.timeline.push({
          _id: crypto.randomBytes(16).toString("hex"),
          action: `Message sent by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        const recipientId =
          ticket.sellerId === req.userId ? ticket.buyerId : ticket.sellerId;
        const recipient = await User.findOne({ _id: recipientId }).lean();
        if (recipient) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient.email,
            subject: `New Message in Ticket for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${recipient.fullName},</p><p>You have a new message from ${req.user.fullName} in ticket for "${ticket.gigId.title}":</p><p>"${content}"</p><p>View the ticket at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            logger.error("Failed to send message notification email:", err);
          });
        }

        ticketIo.to(req.params.id).emit("newMessage", ticket);
        res.json({ success: true, ticket });
      } catch (err) {
        logger.error("Send message error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Send Message with Attachment
  app.post(
    "/api/tickets/:id/messages/attachment",
    authMiddleware,
    checkTicketParticipant,
    attachmentLimiter,
    upload.single("attachment"),
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status === "closed") {
          return res.status(400).json({ error: "Ticket is closed" });
        }

        const content = req.body.content ? sanitizeHtml(req.body.content) : "";
        let attachmentUrl = "";
        if (req.file) {
          const fileStream = Readable.from(req.file.buffer);
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "gigconnect/attachments", resource_type: "auto" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            fileStream.pipe(uploadStream);
          });
          attachmentUrl = uploadResult.secure_url;
        }

        if (!content && !attachmentUrl) {
          return res
            .status(400)
            .json({ error: "Message content or attachment is required" });
        }

        ticket.messages.push({
          _id: crypto.randomBytes(16).toString("hex"),
          senderId: req.userId,
          senderName: req.user.fullName,
          content,
          attachment: attachmentUrl,
          timestamp: new Date(),
          read: false,
        });
        if (ticket.status === "open") {
          ticket.status = "negotiating";
          ticket.timeline.push({
            _id: crypto.randomBytes(16).toString("hex"),
            action: `Ticket moved to negotiating by ${req.user.fullName}`,
            timestamp: new Date(),
          });
        }
        ticket.timeline.push({
          _id: crypto.randomBytes(16).toString("hex"),
          action: `Message with ${
            attachmentUrl ? "attachment" : "text"
          } sent by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        const recipientId =
          ticket.sellerId === req.userId ? ticket.buyerId : ticket.sellerId;
        const recipient = await User.findOne({ _id: recipientId }).lean();
        if (recipient) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient.email,
            subject: `New Message in Ticket for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${
              recipient.fullName
            },</p><p>You have a new message from ${
              req.user.fullName
            } in ticket for "${ticket.gigId.title}":</p><p>"${
              content || "Attachment only"
            }"</p>${
              attachmentUrl
                ? `<p><a href="${attachmentUrl}">View Attachment</a></p>`
                : ""
            }<p>View the ticket at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            logger.error("Failed to send message notification email:", err);
          });
        }

        ticketIo.to(req.params.id).emit("newMessage", ticket);
        res.json({ success: true, ticket });
      } catch (err) {
        logger.error("Send message with attachment error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Update Ticket Price
  app.patch(
    "/api/tickets/:id/price",
    authMiddleware,
    checkTicketParticipant,
    validatePrice,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { agreedPrice } = req.body;
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status === "closed") {
          return res.status(400).json({ error: "Ticket is closed" });
        }

        ticket.agreedPrice = parseFloat(agreedPrice);
        ticket.status = "negotiating";
        ticket.messages.push({
          _id: crypto.randomBytes(16).toString("hex"),
          senderId: req.userId,
          senderName: req.user.fullName,
          content: `Price of ₹${agreedPrice.toLocaleString("en-IN")} proposed`,
          timestamp: new Date(),
          read: false,
        });
        ticket.timeline.push({
          _id: crypto.randomBytes(16).toString("hex"),
          action: `Price of ₹${agreedPrice.toLocaleString(
            "en-IN"
          )} proposed by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        const otherUserId =
          ticket.sellerId === req.userId ? ticket.buyerId : ticket.sellerId;
        const otherUser = await User.findOne({ _id: otherUserId }).lean();
        if (otherUser) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: otherUser.email,
            subject: `Price Proposed for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${
              otherUser.fullName
            },</p><p>A price of ₹${agreedPrice.toLocaleString(
              "en-IN"
            )} has been proposed for the gig "${
              ticket.gigId.title
            }".</p><p>Accept or negotiate at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            logger.error("Failed to send price proposal email:", err);
          });
        }

        ticketIo.to(req.params.id).emit("newMessage", ticket);
        res.json({ success: true, ticket });
      } catch (err) {
        logger.error("Update ticket price error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Accept Ticket Price
  // Accept Ticket Price
  app.patch(
    "/api/tickets/:id/accept-price",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status !== "negotiating") {
          return res.status(400).json({
            error: "Ticket must be in negotiating status to accept price",
          });
        }
        if (!ticket.agreedPrice) {
          return res.status(400).json({ error: "No agreed price set" });
        }

        // Find who proposed the last price by checking messages
        const priceMessages = ticket.messages.filter(
          (m) =>
            m.content.includes("Price of ₹") && m.content.includes("proposed")
        );

        if (priceMessages.length === 0) {
          return res.status(400).json({ error: "No price proposal found" });
        }

        const lastPriceMessage = priceMessages[priceMessages.length - 1];

        // Check if user is trying to accept their own price
        if (lastPriceMessage.senderId === req.userId) {
          return res.status(400).json({
            error:
              "You cannot accept your own price proposal. Wait for the other party to respond.",
          });
        }

        ticket.status = "accepted";
        ticket.timeline.push({
          _id: crypto.randomBytes(16).toString("hex"),
          action: `Price of ₹${ticket.agreedPrice.toLocaleString(
            "en-IN"
          )} accepted by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        ticket.messages.push({
          _id: crypto.randomBytes(16).toString("hex"),
          senderId: req.userId,
          senderName: req.user.fullName,
          content: `Price of ₹${ticket.agreedPrice.toLocaleString(
            "en-IN"
          )} accepted`,
          timestamp: new Date(),
          read: false,
        });
        await ticket.save();

        const otherUserId =
          ticket.sellerId === req.userId ? ticket.buyerId : ticket.sellerId;
        const otherUser = await User.findOne({ _id: otherUserId }).lean();

        if (otherUser) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: otherUser.email,
            subject: `Price Accepted for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${
              otherUser.fullName
            },</p><p>The price of ₹${ticket.agreedPrice.toLocaleString(
              "en-IN"
            )} for "${ticket.gigId.title}" has been accepted by ${
              req.user.fullName
            }.</p><p>Proceed with the work at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            logger.error("Failed to send price acceptance email:", err);
          });
        }

        ticketIo.to(req.params.id).emit("newMessage", ticket);
        res.json({ success: true, ticket });
      } catch (err) {
        logger.error("Accept ticket price error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Mark Ticket as Paid
  app.patch(
    "/api/tickets/:id/paid",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status !== "accepted") {
          return res
            .status(400)
            .json({ error: "Ticket must be accepted to mark as paid" });
        }
        if (req.userId !== ticket.buyerId) {
          return res
            .status(403)
            .json({ error: "Only the buyer can mark the ticket as paid" });
        }

        ticket.status = "paid";
        ticket.timeline.push({
          _id: crypto.randomBytes(16).toString("hex"),
          action: `Ticket marked as paid by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        ticket.messages.push({
          _id: crypto.randomBytes(16).toString("hex"),
          senderId: req.userId,
          senderName: req.user.fullName,
          content: `Payment of ₹${ticket.agreedPrice.toLocaleString(
            "en-IN"
          )} confirmed`,
          timestamp: new Date(),
          read: false,
        });
        await ticket.save();

        const seller = await User.findOne({ _id: ticket.sellerId }).lean();
        if (seller) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: seller.email,
            subject: `Payment Confirmed for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${
              seller.fullName
            },</p><p>Payment of ₹${ticket.agreedPrice.toLocaleString(
              "en-IN"
            )} for "${ticket.gigId.title}" has been confirmed by ${
              req.user.fullName
            }.</p><p>Proceed with delivery at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            logger.error("Failed to send payment confirmation email:", err);
          });
        }

        ticketIo.to(req.params.id).emit("newMessage", ticket);
        res.json({ success: true, ticket });
      } catch (err) {
        logger.error("Mark ticket paid error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Mark Ticket as Completed
  app.patch(
    "/api/tickets/:id/complete",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status !== "paid") {
          return res
            .status(400)
            .json({ error: "Ticket must be paid to mark as completed" });
        }
        if (req.userId !== ticket.sellerId) {
          return res.status(403).json({
            error: "Only the seller can mark the ticket as completed",
          });
        }

        ticket.status = "completed";
        ticket.timeline.push({
          _id: crypto.randomBytes(16).toString("hex"),
          action: `Ticket marked as completed by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        ticket.messages.push({
          _id: crypto.randomBytes(16).toString("hex"),
          senderId: req.userId,
          senderName: req.user.fullName,
          content: `Work for "${ticket.gigId.title}" has been completed`,
          timestamp: new Date(),
          read: false,
        });
        await ticket.save();

        const buyer = await User.findOne({ _id: ticket.buyerId }).lean();
        if (buyer) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: buyer.email,
            subject: `Work Completed for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${buyer.fullName},</p><p>The work for "${ticket.gigId.title}" has been marked as completed by ${req.user.fullName}.</p><p>Review the work and provide feedback at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            logger.error("Failed to send completion email:", err);
          });
        }

        const seller = await User.findOne({ _id: ticket.sellerId });
        if (seller) {
          seller.gigsCompleted = (seller.gigsCompleted || 0) + 1;
          seller.completionRate = Math.round(
            (seller.gigsCompleted / (seller.totalGigs || 1)) * 100
          );
          seller.credits = (seller.credits || 0) + ticket.agreedPrice;
          seller.orderHistory.push({
            title: ticket.gigId.title,
            status: "completed",
            earnings: ticket.agreedPrice,
            date: new Date(),
          });
          await seller.save();
        }

        ticketIo.to(req.params.id).emit("newMessage", ticket);
        res.json({ success: true, ticket });
      } catch (err) {
        logger.error("Mark ticket completed error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Close Ticket
  app.patch(
    "/api/tickets/:id/close",
    authMiddleware,
    checkTicketParticipant,
    validateRating,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rating } = req.body;
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status !== "completed") {
          return res
            .status(400)
            .json({ error: "Ticket must be completed to close" });
        }

        ticket.status = "closed";
        ticket.timeline.push({
          _id: crypto.randomBytes(16).toString("hex"),
          action: `Ticket closed by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        ticket.messages.push({
          _id: crypto.randomBytes(16).toString("hex"),
          senderId: req.userId,
          senderName: req.user.fullName,
          content: `Ticket for "${ticket.gigId.title}" closed`,
          timestamp: new Date(),
          read: false,
        });

        if (rating && req.userId === ticket.buyerId) {
          const seller = await User.findOne({ _id: ticket.sellerId });
          if (seller) {
            seller.ratings.push({
              value: parseInt(rating),
              ticketId: ticket._id,
              giverId: req.userId,
              givenAt: new Date(),
            });
            await seller.save();

            const gig = await Gig.findOne({ _id: ticket.gigId });
            if (gig) {
              const ratings = await User.findOne({
                _id: ticket.sellerId,
              }).select("ratings");
              gig.rating =
                ratings.ratings.length > 0
                  ? (
                      ratings.ratings.reduce((sum, r) => sum + r.value, 0) /
                      ratings.ratings.length
                    ).toFixed(1)
                  : 0;
              await gig.save();
            }
          }
        }

        await ticket.save();

        const otherUserId =
          ticket.sellerId === req.userId ? ticket.buyerId : ticket.sellerId;
        const otherUser = await User.findOne({ _id: otherUserId }).lean();
        if (otherUser) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: otherUser.email,
            subject: `Ticket Closed for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${otherUser.fullName},</p><p>The ticket for "${
              ticket.gigId.title
            }" has been closed by ${req.user.fullName}.</p>${
              rating && req.userId === ticket.buyerId
                ? `<p>You received a rating of ${rating}/5.</p>`
                : ""
            }<p>View details at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            logger.error("Failed to send ticket closure email:", err);
          });
        }

        ticketIo.to(req.params.id).emit("newMessage", ticket);
        res.json({ success: true, ticket });
      } catch (err) {
        logger.error("Close ticket error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Search Messages in Ticket
  app.get(
    "/api/tickets/:id/messages/search",
    authMiddleware,
    checkTicketParticipant,
    [
      check("query")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("Search query cannot be empty"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { query } = req.query;
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id }).lean();
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        let messages = ticket.messages || [];
        if (query) {
          const regex = new RegExp(query, "i");
          messages = messages.filter(
            (msg) => regex.test(msg.content) || regex.test(msg.senderName)
          );
        }

        res.json({ success: true, messages });
      } catch (err) {
        logger.error("Message search error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Mark Messages as Read
  app.patch(
    "/api/tickets/:id/messages/read",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        let updated = false;
        ticket.messages = ticket.messages.map((msg) => {
          if (msg.senderId !== req.userId && !msg.read) {
            msg.read = true;
            updated = true;
          }
          return msg;
        });

        if (updated) {
          ticket.timeline.push({
            _id: crypto.randomBytes(16).toString("hex"),
            action: `Messages marked as read by ${req.user.fullName}`,
            timestamp: new Date(),
          });
          await ticket.save();
          ticketIo.to(req.params.id).emit("messagesRead", {
            ticketId: req.params.id,
            userId: req.userId,
          });
        }

        res.json({ success: true, message: "Messages marked as read" });
      } catch (err) {
        logger.error("Mark messages read error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Gemini AI Chat Route
  app.post(
    "/api/ai/chat",
    authMiddleware,
    [
      check("message")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("Message must be between 1 and 1000 characters"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message } = req.body;
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(message);
        const response = await result.response.text();

        res.json({ success: true, response });
      } catch (err) {
        logger.error("AI chat error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  // Google Signup Route
  app.get("/api/auth/google/signup", (req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: "signup",
    })(req, res, next);
  });

  // Google Login Route
  app.get("/api/auth/google/login", (req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: "login",
    })(req, res, next);
  });

  // Google Callback
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth/google/failure",
      session: false,
    }),
    (req, res) => {
      if (!req.user) {
        logger.error("Google callback: No user found");
        const front = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${front}/login?error=auth_failed`);
      }

      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      const front = process.env.FRONTEND_URL || "http://localhost:5173";
      const onboarded = req.user.onboarded === true ? "true" : "false";
      const redirect = `${front}/auth/google/callback?token=${token}&userId=${req.user._id}&onboarded=${onboarded}`;

      logger.info(`Google callback - Redirecting user ${req.user._id}`);
      res.redirect(redirect);
    }
  );

  // Google Auth Failure Handler
  app.get("/auth/google/failure", (req, res) => {
    const message = req.session?.messages?.[0] || "auth_failed";
    const front = process.env.FRONTEND_URL || "http://localhost:5173";

    logger.warn(`Google auth failed: ${message}`);

    if (message === "account_exists") {
      res.redirect(`${front}/signup?error=account_exists`);
    } else if (message === "no_account") {
      res.redirect(`${front}/login?error=no_account`);
    } else if (message === "not_onboarded") {
      res.redirect(`${front}/login?error=not_onboarded`);
    } else {
      res.redirect(`${front}/login?error=auth_failed`);
    }
  });

  // Onboarding Route
  app.post(
    "/api/users/onboard",
    authMiddleware,
    upload.single("image"),
    async (req, res) => {
      try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (req.body.role) user.role = req.body.role;
        if (req.body.bio) user.bio = req.body.bio;
        if (req.body.college) user.college = req.body.college;

        if (req.file) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "gigconnect/profiles" },
              (err, r) => (err ? reject(err) : resolve(r))
            );
            Readable.from(req.file.buffer).pipe(stream);
          });
          user.profilePicture = result.secure_url;
        }

        if (req.body.skills) {
          const skills = JSON.parse(req.body.skills);
          for (const s of skills) {
            const lower = s.toLowerCase();
            if (!user.skills.some((x) => x.name.toLowerCase() === lower)) {
              user.skills.push({ name: s, endorsements: 0 });
            }
          }
        }

        if (req.body.socialLinks) {
          user.socialLinks = {
            ...user.socialLinks,
            ...JSON.parse(req.body.socialLinks),
          };
        }

        user.onboarded = true;
        await user.save();

        res.json({ success: true, message: "Onboarding complete" });
      } catch (err) {
        logger.error("Onboarding error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // Admin Cleanup Route
  app.delete("/api/admin/cleanup-pending", async (req, res) => {
    try {
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      const result = await User.deleteMany({
        onboarded: false,
        createdAt: { $lt: cutoffDate },
      });

      logger.info(`Cleaned up ${result.deletedCount} non-onboarded users`);
      res.json({
        success: true,
        deletedCount: result.deletedCount,
        message: `Removed ${result.deletedCount} incomplete registrations`,
      });
    } catch (err) {
      logger.error("Cleanup error:", err);
      res.status(500).json({ error: "Cleanup failed", details: err.message });
    }
  });

  // 5. SOCKET.IO

  // Global Chat IO
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
  });

  // Ticket Chat IO
  const ticketIo = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/ticket-socket",
  });

  // Socket Middleware for Auth
  const socketAuth = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      logger.error("Socket: No token provided");
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.user = decoded;
      next();
    } catch (err) {
      logger.error("Socket auth error:", err.message);
      next(new Error("Invalid token"));
    }
  };

  io.use(socketAuth);
  ticketIo.use(socketAuth);

  // Global Chat Logic
  io.on("connection", (socket) => {
    logger.info(`User connected to global chat: ${socket.userId}`);

    socket.on("joinGlobalChat", () => {
      socket.join("globalChat");
      logger.info(`User ${socket.userId} joined global chat`);
    });

    socket.on("sendGlobalMessage", async ({ content }, callback) => {
      try {
        if (!content || !content.trim()) {
          return callback({ error: "Message content is required" });
        }

        const user = await User.findOne({ _id: socket.userId }).lean();
        if (!user) {
          return callback({ error: "User not found" });
        }

        const message = {
          senderId: socket.userId,
          senderName: user.fullName,
          content: sanitizeHtml(content.trim()),
          timestamp: new Date(),
        };

        io.to("globalChat").emit("globalMessage", message);
        callback({ success: true });
      } catch (err) {
        logger.error("Global message error:", err);
        callback({ error: "Failed to send message", details: err.message });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`User disconnected from global chat: ${socket.userId}`);
    });
  });

  // Ticket Chat Logic
  ticketIo.on("connection", (socket) => {
    logger.info(`User connected to ticket chat: ${socket.userId}`);

    socket.on("joinTicket", (ticketId) => {
      if (!/^[0-9a-fA-F]{32}$/.test(ticketId)) {
        logger.error(`Invalid ticket ID format in socket: ${ticketId}`);
        return socket.emit("error", { message: "Invalid ticket ID format" });
      }
      socket.join(ticketId);
      logger.info(`User ${socket.userId} joined ticket room: ${ticketId}`);
    });

    socket.on("sendMessage", async ({ ticketId, content }, callback) => {
      try {
        if (!/^[0-9a-fA-F]{32}$/.test(ticketId)) {
          return callback({ error: "Invalid ticket ID format" });
        }
        if (!content || !content.trim()) {
          return callback({ error: "Message content is required" });
        }

        const ticket = await Ticket.findOne({ _id: ticketId });
        if (!ticket) {
          return callback({ error: "Ticket not found" });
        }
        if (ticket.status === "closed") {
          return callback({ error: "Ticket is closed" });
        }
        if (![ticket.sellerId, ticket.buyerId].includes(socket.userId)) {
          return callback({ error: "Unauthorized to send message" });
        }

        const user = await User.findOne({ _id: socket.userId });
        if (!user) {
          return callback({ error: "User not found" });
        }

        ticket.messages.push({
          _id: crypto.randomBytes(16).toString("hex"),
          senderId: socket.userId,
          senderName: user.fullName,
          content: sanitizeHtml(content.trim()),
          timestamp: new Date(),
          read: false,
        });
        ticket.timeline.push({
          _id: crypto.randomBytes(16).toString("hex"),
          action: `Message sent by ${user.fullName}`,
          timestamp: new Date(),
        });

        await ticket.save();
        ticketIo.to(ticketId).emit("newMessage", ticket);
        callback({ success: true });
      } catch (err) {
        logger.error("Socket message error:", err);
        callback({ error: "Failed to send message", details: err.message });
      }
    });

    socket.on("markMessagesRead", async (ticketId, callback) => {
      try {
        if (!/^[0-9a-fA-F]{32}$/.test(ticketId)) {
          if (callback && typeof callback === "function") {
            return callback({ error: "Invalid ticket ID format" });
          }
          return;
        }

        const ticket = await Ticket.findOne({ _id: ticketId });
        if (!ticket) {
          if (callback && typeof callback === "function") {
            return callback({ error: "Ticket not found" });
          }
          return;
        }
        if (![ticket.sellerId, ticket.buyerId].includes(socket.userId)) {
          if (callback && typeof callback === "function") {
            return callback({ error: "Unauthorized to mark messages read" });
          }
          return;
        }

        let updated = false;
        ticket.messages = ticket.messages.map((msg) => {
          if (msg.senderId !== socket.userId && !msg.read) {
            msg.read = true;
            updated = true;
          }
          return msg;
        });

        if (updated) {
          const user = await User.findOne({ _id: socket.userId }).lean();
          ticket.timeline.push({
            _id: crypto.randomBytes(16).toString("hex"),
            action: `Messages marked as read by ${user?.fullName || "User"}`,
            timestamp: new Date(),
          });
          await ticket.save();
          ticketIo.to(ticketId).emit("messagesRead", {
            ticketId,
            userId: socket.userId,
          });
        }

        if (callback && typeof callback === "function") {
          callback({ success: true });
        }
      } catch (err) {
        logger.error("Socket mark messages read error:", err);
        if (callback && typeof callback === "function") {
          callback({
            error: "Failed to mark messages as read",
            details: err.message,
          });
        }
      }
    });

    socket.on("disconnect", () => {
      logger.info(`User disconnected from ticket chat: ${socket.userId}`);
    });
  });

  //  AUTOMATED CLEANUP
  setInterval(async () => {
    try {
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await User.deleteMany({
        onboarded: false,
        createdAt: { $lt: cutoffDate },
      });
      if (result.deletedCount > 0) {
        logger.info(
          `Auto-cleanup: Removed ${result.deletedCount} non-onboarded users`
        );
      }
    } catch (err) {
      logger.error("Auto-cleanup error:", err);
    }
  }, 6 * 60 * 60 * 1000); // Every 6 hours

  logger.info("Auto-cleanup job scheduled (runs every 6 hours)");

  //  START SERVER
  server.listen(PORT, () => {
    logger.info(`[Worker ${process.pid}] Server running on port ${PORT}`);
  });
}
