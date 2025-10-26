// server.js
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
const {
  setupGlobalChatSocket,
  setupGlobalChatRoutes,
} = require("./chatRoutes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

// Rate limiter for applications
const applyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many requests, please try again later.",
  keyGenerator: (req) => req.userId || req.ip,
});

// MongoDB Schemas
const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    college: { type: String },
    bio: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    role: { type: String, enum: ["Seller", "Buyer", "Both"], default: "Both" },
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
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    console.error("Password hashing error:", err);
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
      action: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

applicationSchema.index({ gigId: 1, applicantId: 1 });
ticketSchema.index({ gigId: 1, sellerId: 1, buyerId: 1 });
ticketSchema.index({ "messages.timestamp": -1 });
ticketSchema.index({ "timeline.timestamp": -1 });

const Gig = mongoose.model("Gig", gigSchema);
const Application = mongoose.model("Application", applicationSchema);
const Ticket = mongoose.model("Ticket", ticketSchema);

// Now import ticketRoutes.js after schema definitions
const { setupTicketRoutes, setupTicketSocket } = require("./ticketRoutes");

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Cloudinary configuration
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured successfully");
} catch (err) {
  console.error("Cloudinary configuration error:", err);
}

// Multer configuration
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
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("File must be an image (jpg, jpeg, png) or PDF"));
  },
});

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.error("No Authorization header provided");
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    console.error("No token found after parsing");
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user =
      (await User.findOne({ _id: decoded.id }).select(
        "-password -emailOtp -emailOtpExpire"
      )) || (await PendingUser.findOne({ _id: decoded.id }));
    if (!user) {
      console.error("User not found for ID:", decoded.id);
      return res.status(401).json({ error: "Token is not valid" });
    }
    req.user = user;
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ error: "Token is not valid" });
  }
};

// Role-based middleware
const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ error: `Only ${roles.join(" or ")} roles are allowed` });
  }
  next();
};

// Gig owner middleware
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
    console.error("Gig owner check error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Validation middleware
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
      if (user) return res.status(400).json({ error: "Email already in use" });

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
      console.log("Pending user added:", userId);

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
      console.error("Signup error:", err);
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
      const pendingUser = await PendingUser.findOne({ _id: req.userId }).lean();
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
      console.log("User verified and moved to User collection:", user._id);

      res.json({
        success: true,
        message: "OTP verified. Please set your profile picture or skip.",
      });
    } catch (err) {
      console.error("OTP verification error:", err);
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
      return res.status(400).json({ error: "Please verify your email first" });
    }

    res.json({ success: true, message: "Profile setup complete" });
  } catch (err) {
    console.error("Skip profile error:", err);
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
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({
              error: "Failed to upload image to Cloudinary",
              details: error.message,
            });
          }

          try {
            user.profilePicture = result.secure_url;
            await user.save();
            console.log(
              "Profile picture updated:",
              user._id,
              "URL:",
              result.secure_url
            );
            res.json({ success: true, profilePicture: result.secure_url });
          } catch (err) {
            console.error("Database update error:", err);
            res.status(500).json({
              error: "Failed to update user profile",
              details: err.message,
            });
          }
        }
      );

      Readable.from(req.file.buffer).pipe(stream);
    } catch (err) {
      console.error("Profile picture upload error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Update Profile Picture
app.put(
  "/api/users/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.userId });
      if (!user) {
        console.error("User not found for ID:", req.userId);
        return res.status(400).json({ error: "User not found" });
      }
      if (!req.file) {
        console.error("No file provided in profile picture update");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const stream = cloudinary.uploader.upload_stream(
        { folder: "gigconnect/profiles", resource_type: "image" },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({
              error: "Failed to upload image to Cloudinary",
              details: error.message,
            });
          }

          try {
            user.profilePicture = result.secure_url;
            await user.save();
            console.log(
              "Profile picture updated for user:",
              user._id,
              "URL:",
              result.secure_url
            );
            res.json({ success: true, profilePicture: result.secure_url });
          } catch (err) {
            console.error("Database update error:", err);
            res.status(500).json({
              error: "Failed to update profile picture in database",
              details: err.message,
            });
          }
        }
      );

      Readable.from(req.file.buffer).pipe(stream);
    } catch (err) {
      console.error("Profile picture update error:", err);
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
      console.error("Profile update error:", err);
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
      console.error("Email OTP request error:", err);
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
      console.error("Email OTP verification error:", err);
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
        return res.status(400).json({ error: "Current password is incorrect" });

      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: "Password updated" });
    } catch (err) {
      console.error("Password update error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

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
      console.error("Skill add error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Delete Skill
app.delete("/api/users/skills/:skillName", authMiddleware, async (req, res) => {
  const { skillName } = req.params;
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) return res.status(400).json({ error: "User not found" });
    user.skills = user.skills.filter((s) => s.name !== skillName);
    await user.save();
    res.json({ success: true, message: "Skill removed" });
  } catch (err) {
    console.error("Skill delete error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

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
        return res.status(400).json({ error: "Cannot endorse your own skill" });
      }
      user.skills = user.skills.map((s) =>
        s.name === skill ? { ...s, endorsements: (s.endorsements || 0) + 1 } : s
      );
      await user.save();
      res.json({ success: true, message: "Skill endorsed" });
    } catch (err) {
      console.error("Skill endorsement error:", err);
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
        return res.status(400).json({ error: "Certification already exists" });
      }
      user.certifications = user.certifications || [];
      user.certifications.push({ name, issuer });
      await user.save();
      res.json({ success: true, message: "Certification added" });
    } catch (err) {
      console.error("Certification add error:", err);
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
      console.error("Certification delete error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Get User Profile
app.get("/api/users/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id })
      .select("-password -emailOtp -emailOtpExpire")
      .lean();
    if (!user) return res.status(400).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get Public User Profile
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
      .select(
        "fullName college bio profilePicture role skills certifications socialLinks gigsCompleted totalGigs completionRate credits ratings"
      )
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const ratings = user.ratings || [];
    const averageRating =
      ratings.length > 0
        ? (
            ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
          ).toFixed(1)
        : 0;

    console.log("Fetched public profile:", { userId: req.params.id });
    res.json({
      ...user,
      averageRating,
      ratingsCount: ratings.length,
      ratings: ratings.map((r) => ({
        value: r.value,
        ticketId: r.ticketId,
        giverId: r.giverId,
        givenAt: r.givenAt,
      })),
    });
  } catch (err) {
    console.error("Public profile fetch error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
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
      console.error("Login error:", err);
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
    console.error("Reviews fetch error:", err);
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
      console.error("Review creation error:", err);
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
      const gig = new Gig({
        _id: gigId,
        title,
        sellerName: user.fullName,
        sellerId: user._id,
        thumbnail: thumbnailUrl,
        description,
        category,
        price: parseFloat(price),
      });

      await gig.save();
      user.totalGigs = (user.totalGigs || 0) + 1;
      await user.save();

      console.log("Gig created:", { gigId, title, sellerId: user._id });
      res.json({ success: true, gig });
    } catch (err) {
      console.error("Gig creation error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

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
      .withMessage("Category is required"),
    check("price")
      .optional()
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
      const gig = await Gig.findOne({ _id: req.params.id });
      if (!gig) return res.status(404).json({ error: "Gig not found" });

      if (title) gig.title = title;
      if (description) gig.description = description;
      if (category) gig.category = category;
      if (price) gig.price = parseFloat(price);

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

      await gig.save();
      console.log("Gig updated:", { gigId: gig._id });
      res.json({ success: true, gig });
    } catch (err) {
      console.error("Gig update error:", err);
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
      await Gig.deleteOne({ _id: req.params.id });
      console.log("Gig deleted:", { gigId: req.params.id });
      res.json({ success: true, message: "Gig deleted" });
    } catch (err) {
      console.error("Gig deletion error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Get All Gigs
app.get("/api/gigs", async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    search,
    sortBy,
    page = 1,
    limit = 10,
  } = req.query;
  try {
    const query = { status: "open" };
    if (category) query.category = category;
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    if (sortBy === "priceAsc") sortOptions.price = 1;
    else if (sortBy === "priceDesc") sortOptions.price = -1;
    else if (sortBy === "ratingDesc") sortOptions.rating = -1;
    else sortOptions.createdAt = -1;

    const gigs = await Gig.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Gig.countDocuments(query);
    console.log("Gigs fetched:", { count: gigs.length, page, limit });
    res.json({ success: true, gigs, total, page, limit });
  } catch (err) {
    console.error("Get gigs error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get Gig by ID
app.get("/api/gigs/:id", async (req, res) => {
  try {
    const gig = await Gig.findOne({ _id: req.params.id })
      .populate("sellerId", "fullName profilePicture ratings completionRate")
      .lean();
    if (!gig) return res.status(404).json({ error: "Gig not found" });
    console.log("Gig fetched:", { gigId: req.params.id });
    res.json(gig);
  } catch (err) {
    console.error("Get gig error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get Seller Gigs
app.get("/api/users/:id/gigs", async (req, res) => {
  try {
    const gigs = await Gig.find({ sellerId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();
    console.log("Seller gigs fetched:", {
      sellerId: req.params.id,
      count: gigs.length,
    });
    res.json({ success: true, gigs });
  } catch (err) {
    console.error("Get seller gigs error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Apply for Gig
app.post(
  "/api/gigs/:id/apply",
  authMiddleware,
  checkRole(["Buyer", "Both"]),
  applyLimiter,
  [
    check("coverLetter")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Cover letter must be 1000 characters or less"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coverLetter } = req.body;
    try {
      const gig = await Gig.findOne({ _id: req.params.id }).lean();
      if (!gig) return res.status(404).json({ error: "Gig not found" });
      if (gig.status !== "open") {
        return res
          .status(400)
          .json({ error: "Gig is not open for applications" });
      }
      if (gig.sellerId === req.userId) {
        return res.status(400).json({ error: "Cannot apply to your own gig" });
      }

      const existingApplication = await Application.findOne({
        gigId: req.params.id,
        applicantId: req.userId,
      });
      if (existingApplication) {
        return res
          .status(400)
          .json({ error: "You have already applied to this gig" });
      }

      const applicationId = crypto.randomBytes(16).toString("hex");
      const application = new Application({
        _id: applicationId,
        gigId: req.params.id,
        applicantId: req.userId,
        applicantName: req.user.fullName,
        coverLetter: coverLetter || "",
      });

      await application.save();
      console.log("Application created:", {
        applicationId,
        gigId: req.params.id,
        applicantId: req.userId,
      });

      const seller = await User.findOne({ _id: gig.sellerId }).lean();
      if (seller) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: seller.email,
          subject: `New Application for Gig "${gig.title}"`,
          html: `<p>Dear ${seller.fullName},</p><p>${req.user.fullName} has applied to your gig "${gig.title}".</p><p>View the application at: /gigs/${gig._id}/applications</p>`,
        };
        await transporter.sendMail(mailOptions).catch((err) => {
          console.error("Failed to send application email:", err);
        });
      }

      res.json({ success: true, message: "Application submitted" });
    } catch (err) {
      console.error("Apply for gig error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Get Gig Applications
app.get(
  "/api/gigs/:id/applications",
  authMiddleware,
  checkGigOwner,
  async (req, res) => {
    try {
      const applications = await Application.find({ gigId: req.params.id })
        .populate("applicantId", "fullName profilePicture skills")
        .lean();
      console.log("Applications fetched:", {
        gigId: req.params.id,
        count: applications.length,
      });
      res.json({ success: true, applications });
    } catch (err) {
      console.error("Get applications error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Accept Application
app.patch(
  "/api/gigs/:id/accept-application/:applicationId",
  authMiddleware,
  checkGigOwner,
  async (req, res) => {
    try {
      const application = await Application.findOne({
        _id: req.params.applicationId,
        gigId: req.params.id,
      });
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (application.status !== "pending") {
        return res.status(400).json({ error: "Application already processed" });
      }

      application.status = "accepted";
      await application.save();

      const gig = await Gig.findOne({ _id: req.params.id });
      gig.status = "closed";
      await gig.save();

      const ticketId = crypto.randomBytes(16).toString("hex");
      const ticket = new Ticket({
        _id: ticketId,
        gigId: req.params.id,
        sellerId: req.gig.sellerId,
        buyerId: application.applicantId,
        messages: [],
        timeline: [
          {
            action: `Ticket created for ${gig.title} by ${req.user.fullName}`,
            timestamp: new Date(),
          },
        ],
      });
      await ticket.save();

      const applicant = await User.findOne({
        _id: application.applicantId,
      }).lean();
      if (applicant) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: applicant.email,
          subject: `Your Application for "${gig.title}" was Accepted`,
          html: `<p>Dear ${applicant.fullName},</p><p>Your application for "${gig.title}" has been accepted by ${req.user.fullName}.</p><p>Start communicating at: /tickets/${ticket._id}</p>`,
        };
        await transporter.sendMail(mailOptions).catch((err) => {
          console.error("Failed to send application acceptance email:", err);
        });
      }

      console.log("Application accepted and ticket created:", {
        applicationId: req.params.applicationId,
        ticketId,
      });
      res.json({ success: true, ticketId });
    } catch (err) {
      console.error("Accept application error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Reject Application
app.patch(
  "/api/gigs/:id/reject-application/:applicationId",
  authMiddleware,
  checkGigOwner,
  async (req, res) => {
    try {
      const application = await Application.findOne({
        _id: req.params.applicationId,
        gigId: req.params.id,
      });
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (application.status !== "pending") {
        return res.status(400).json({ error: "Application already processed" });
      }

      application.status = "rejected";
      await application.save();

      const gig = await Gig.findOne({ _id: req.params.id }).lean();
      const applicant = await User.findOne({
        _id: application.applicantId,
      }).lean();
      if (applicant && gig) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: applicant.email,
          subject: `Your Application for "${gig.title}" was Rejected`,
          html: `<p>Dear ${applicant.fullName},</p><p>Your application for "${gig.title}" was not accepted.</p><p>Explore other gigs at: /gigs</p>`,
        };
        await transporter.sendMail(mailOptions).catch((err) => {
          console.error("Failed to send application rejection email:", err);
        });
      }

      console.log("Application rejected:", {
        applicationId: req.params.applicationId,
      });
      res.json({ success: true, message: "Application rejected" });
    } catch (err) {
      console.error("Reject application error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Setup Socket.IO for tickets
const ticketIo = setupTicketSocket(server);

// Setup Socket.IO and routes for global chat
setupGlobalChatSocket(server);
setupGlobalChatRoutes(app, authMiddleware, applyLimiter, validateMessage);

// Setup ticket routes
setupTicketRoutes(app, authMiddleware, upload);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
