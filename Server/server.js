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

const app = express();
const PORT = process.env.PORT || 5000;
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

// Rate limiter for application and ticket submissions
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
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

applicationSchema.index({ gigId: 1 });
applicationSchema.index({ applicantId: 1 });
ticketSchema.index({ gigId: 1 });
ticketSchema.index({ sellerId: 1 });
ticketSchema.index({ buyerId: 1 });

const Gig = mongoose.model("Gig", gigSchema);
const Application = mongoose.model("Application", applicationSchema);
const Ticket = mongoose.model("Ticket", ticketSchema);

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
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      file.originalname.split(".").pop().toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("File must be an image (jpg, jpeg, png)"));
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
      (await User.findOne({ _id: decoded.id })) ||
      (await PendingUser.findOne({ _id: decoded.id }));
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
    const gig = await Gig.findOne({ _id: req.params.id });
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

// Ticket participant middleware
const checkTicketParticipant = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (![ticket.sellerId, ticket.buyerId].includes(req.userId)) {
      return res
        .status(403)
        .json({ error: "Only ticket participants can perform this action" });
    }
    req.ticket = ticket;
    next();
  } catch (err) {
    console.error("Ticket participant check error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Routes
// User Signup
app.post("/api/auth/signup", async (req, res) => {
  const { fullName, email, password, college, role, bio, socialLinks } =
    req.body;
  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: "Full name, email, and password are required" });
  }
  if (role && !["Seller", "Buyer", "Both"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  try {
    let user = await User.findOne({ email });
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
});

// Verify OTP
app.post("/api/auth/verify-otp", authMiddleware, async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ error: "OTP is required" });
  }
  try {
    const pendingUser = await PendingUser.findOne({ _id: req.userId });
    if (!pendingUser) return res.status(400).json({ error: "User not found" });
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
      ratings: [], // Initialize ratings array
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
});

// Skip Profile Setup
app.post("/api/users/skip-profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
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
app.put("/api/users/profile", authMiddleware, async (req, res) => {
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
});

// Request Email OTP
app.post("/api/users/request-email-otp", authMiddleware, async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) {
    return res.status(400).json({ error: "New email is required" });
  }
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
});

// Verify Email OTP
app.post("/api/users/verify-email-otp", authMiddleware, async (req, res) => {
  const { newEmail, otp } = req.body;
  if (!newEmail || !otp) {
    return res.status(400).json({ error: "New email and OTP are required" });
  }
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
});

// Update Password
app.put("/api/users/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current and new passwords are required" });
  }
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
});

// Add Skill
app.post("/api/users/skills", authMiddleware, async (req, res) => {
  const { skill } = req.body;
  if (!skill) {
    return res.status(400).json({ error: "Skill name is required" });
  }
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.skills.some((s) => s.name === skill)) {
      return res.status(400).json({ error: "Skill already exists" });
    }
    user.skills.push({ name: skill, endorsements: 0 });
    await user.save();
    res.json({ success: true, message: "Skill added" });
  } catch (err) {
    console.error("Skill add error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

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
app.post("/api/users/endorse", authMiddleware, async (req, res) => {
  const { userId, skill } = req.body;
  if (!userId || !skill) {
    return res
      .status(400)
      .json({ error: "User ID and skill name are required" });
  }
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
});

// Add Certification
app.post("/api/users/certifications", authMiddleware, async (req, res) => {
  const { name, issuer } = req.body;
  if (!name || !issuer) {
    return res
      .status(400)
      .json({ error: "Certification name and issuer are required" });
  }
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
});

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
    const user = await User.findOne({ _id: req.user._id }).select(
      "-password -emailOtp -emailOtpExpire"
    );
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
    const user = await User.findOne({ _id: req.params.id }).select(
      "fullName college bio profilePicture role skills certifications socialLinks gigsCompleted totalGigs completionRate credits ratings"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    // Calculate average rating
    const ratings = user.ratings || [];
    const averageRating =
      ratings.length > 0
        ? (
            ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
          ).toFixed(1)
        : 0;

    console.log("Fetched public profile:", { userId: req.params.id });
    res.json({
      ...user.toJSON(),
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
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
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
      { expiresIn: "24h" }
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
});

// Get Reviews
app.get("/api/reviews", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.userId }).sort({
      date: -1,
    });
    res.json(reviews);
  } catch (err) {
    console.error("Reviews fetch error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Create Review
app.post("/api/reviews", authMiddleware, async (req, res) => {
  const { userId, text, rating } = req.body;
  if (!userId || !text || !rating || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "User ID, text, and valid rating (1-5) are required" });
  }
  try {
    const user = await User.findOne({ _id: userId });
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
});

// Create Gig
app.post(
  "/api/gigs",
  authMiddleware,
  checkRole(["Seller", "Both"]),
  upload.single("thumbnail"),
  async (req, res) => {
    const { title, description, category, price } = req.body;
    if (!title || !description || !category || !price) {
      return res.status(400).json({
        error: "Title, description, category, and price are required",
      });
    }
    try {
      const user = await User.findOne({ _id: req.userId });
      if (!user) return res.status(400).json({ error: "User not found" });
      if (!user.isVerified)
        return res.status(400).json({ error: "User not verified" });

      if (title.length < 5 || title.length > 100) {
        return res
          .status(400)
          .json({ error: "Title must be between 5 and 100 characters" });
      }
      if (description.length < 20 || description.length > 1000) {
        return res.status(400).json({
          error: "Description must be between 20 and 1000 characters",
        });
      }
      if (isNaN(price) || price <= 0) {
        return res
          .status(400)
          .json({ error: "Price must be a positive number" });
      }

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

      console.log("Gig created:", { id: gig._id, title, sellerId: user._id });
      res.status(201).json({ success: true, gig });
    } catch (err) {
      console.error("Create gig error:", err);
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
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const total = await Gig.countDocuments(query);

    console.log("Fetching gigs:", {
      query,
      page,
      limit,
      total,
      gigsCount: gigs.length,
    });

    res.json({
      success: true,
      gigs: gigs || [],
      total: total || 0,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)) || 1,
    });
  } catch (err) {
    console.error("Get gigs error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get Categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Gig.distinct("category");
    console.log("Fetched categories:", categories);
    res.json({ success: true, categories });
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Debug Gigs
app.get("/api/debug/gigs", async (req, res) => {
  try {
    const gigs = await Gig.find({});
    const total = await Gig.countDocuments({});
    res.json({
      success: true,
      gigs,
      total,
      message: "All gigs in the database, including closed ones",
    });
  } catch (err) {
    console.error("Debug gigs error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get Recent Gigs
app.get("/api/gigs/recent", async (req, res) => {
  try {
    const gigs = await Gig.find({ status: "open" })
      .sort({ createdAt: -1 })
      .limit(10);
    console.log("Fetched recent gigs:", { count: gigs.length });
    res.json(gigs);
  } catch (err) {
    console.error("Recent gigs fetch error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get Gig by ID
app.get("/api/gigs/:id", async (req, res) => {
  try {
    const gig = await Gig.findOne({ _id: req.params.id });
    if (!gig) {
      console.error("Gig not found for ID:", req.params.id);
      return res.status(404).json({ error: "Gig not found" });
    }
    console.log("Fetched gig:", { id: gig._id, title: gig.title });
    res.json(gig);
  } catch (err) {
    console.error("Get gig by ID error:", err);
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
  async (req, res) => {
    const { title, description, category, price, status } = req.body;
    try {
      const gig = await Gig.findOne({ _id: req.params.id });
      if (!gig) return res.status(404).json({ error: "Gig not found" });

      if (title && (title.length < 5 || title.length > 100)) {
        return res
          .status(400)
          .json({ error: "Title must be between 5 and 100 characters" });
      }
      if (
        description &&
        (description.length < 20 || description.length > 1000)
      ) {
        return res.status(400).json({
          error: "Description must be between 20 and 1000 characters",
        });
      }
      if (price && (isNaN(price) || price <= 0)) {
        return res
          .status(400)
          .json({ error: "Price must be a positive number" });
      }
      if (status && !["open", "closed"].includes(status)) {
        return res
          .status(400)
          .json({ error: "Invalid status. Must be 'open' or 'closed'" });
      }

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
      console.log("Gig updated:", { id: gig._id, title: gig.title });
      res.json({ success: true, gig });
    } catch (err) {
      console.error("Update gig error:", err);
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

      // Reject all pending applications
      const applications = await Application.find({
        gigId: req.params.id,
        status: "pending",
      });
      for (const app of applications) {
        app.status = "rejected";
        await app.save();
        const applicant = await User.findOne({ _id: app.applicantId });
        if (applicant) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: applicant.email,
            subject: `Application Update for Gig "${gig.title}"`,
            html: `<p>Dear ${applicant.fullName},</p><p>The gig "${gig.title}" has been deleted, and your application has been rejected.</p><p>Explore other gigs on Gig Connect.</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            console.error("Failed to send rejection email:", err);
          });
        }
      }

      await Gig.deleteOne({ _id: req.params.id });

      const user = await User.findOne({ _id: req.userId });
      if (user) {
        user.totalGigs = Math.max(0, (user.totalGigs || 0) - 1);
        await user.save();
      }

      console.log("Gig deleted:", { id: req.params.id });
      res.json({ success: true, message: "Gig deleted" });
    } catch (err) {
      console.error("Delete gig error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Get Gigs by Seller
app.get("/api/users/:id/gigs", async (req, res) => {
  try {
    const gigs = await Gig.find({ sellerId: req.params.id }).sort({
      createdAt: -1,
    });
    console.log("Fetched seller gigs:", {
      sellerId: req.params.id,
      count: gigs.length,
    });
    res.json(gigs);
  } catch (err) {
    console.error("Get seller gigs error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Submit Application and Create Ticket
// Submit Application and Create Ticket
app.post(
  "/api/gigs/:id/apply",
  authMiddleware,
  applyLimiter,
  async (req, res) => {
    try {
      // Validate gig ID (32-character hexadecimal string)
      const isValidId = /^[0-9a-fA-F]{32}$/.test(req.params.id);
      if (!isValidId) {
        console.error("Invalid gig ID format:", {
          gigId: req.params.id,
          userId: req.userId,
        });
        return res.status(400).json({ error: "Invalid gig ID format" });
      }

      const gig = await Gig.findOne({ _id: req.params.id });
      if (!gig) {
        console.error("Gig not found:", {
          gigId: req.params.id,
          userId: req.userId,
        });
        return res.status(404).json({ error: "Gig not found" });
      }

      // Check if gig is closed
      if (gig.status === "closed") {
        console.error("Attempted to apply to closed gig:", {
          gigId: req.params.id,
          userId: req.userId,
          gigStatus: gig.status,
        });
        return res
          .status(400)
          .json({ error: "This gig is closed for applications" });
      }

      // Prevent self-application
      if (gig.sellerId === req.userId) {
        console.error("User attempted to apply to own gig:", {
          userId: req.userId,
          gigId: req.params.id,
          sellerId: gig.sellerId,
        });
        return res
          .status(400)
          .json({ error: "You cannot apply to your own gig" });
      }

      // Check for existing application
      const existingApplication = await Application.findOne({
        gigId: req.params.id,
        applicantId: req.userId,
      });
      if (existingApplication) {
        console.error("Duplicate application attempt:", {
          userId: req.userId,
          gigId: req.params.id,
          applicationId: existingApplication._id,
          applicationStatus: existingApplication.status,
        });
        return res.status(400).json({
          error: `You have already applied to this gig (Status: ${existingApplication.status})`,
        });
      }

      // Validate cover letter (if provided)
      const { coverLetter } = req.body;
      if (
        coverLetter &&
        (coverLetter.length < 10 || coverLetter.length > 1000)
      ) {
        console.error("Invalid cover letter length:", {
          userId: req.userId,
          gigId: req.params.id,
          coverLetterLength: coverLetter.length,
        });
        return res.status(400).json({
          error: "Cover letter must be between 10 and 1000 characters",
        });
      }

      // Check user verification
      const user = await User.findOne({ _id: req.userId });
      if (!user) {
        console.error("User not found:", {
          userId: req.userId,
          gigId: req.params.id,
        });
        return res.status(400).json({ error: "User not found" });
      }
      if (!user.isVerified) {
        console.error("Unverified user attempted to apply:", {
          userId: req.userId,
          gigId: req.params.id,
        });
        return res
          .status(400)
          .json({ error: "Please verify your email before applying for gigs" });
      }

      // Create application
      const applicationId = crypto.randomBytes(16).toString("hex");
      const application = new Application({
        _id: applicationId,
        gigId: req.params.id,
        applicantId: req.userId,
        applicantName: req.user.fullName,
        coverLetter: coverLetter || "",
        status: "pending",
      });
      await application.save();

      // Create ticket
      const ticketId = crypto.randomBytes(16).toString("hex");
      const ticket = new Ticket({
        _id: ticketId,
        gigId: req.params.id,
        sellerId: gig.sellerId,
        buyerId: req.userId,
        status: "open",
        messages: [
          {
            senderId: req.userId,
            senderName: req.user.fullName,
            content: `I have applied to your gig "${gig.title}". Let's discuss the details!`,
            timestamp: new Date(),
          },
        ],
      });
      await ticket.save();

      // Notify seller
      const seller = await User.findOne({ _id: gig.sellerId });
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
            coverLetter || "No cover letter provided"
          }"</p><p>View the application and discuss at: /tickets/${ticketId}</p>`,
        };
        await transporter.sendMail(mailOptions).catch((err) => {
          console.error("Failed to send application email:", {
            error: err.message,
            userId: req.userId,
            gigId: req.params.id,
          });
        });
      }

      console.log("Application and ticket created:", {
        applicationId,
        ticketId,
        gigId: req.params.id,
        applicantId: req.userId,
        coverLetter: coverLetter || "None",
      });
      res.status(201).json({ success: true, application, ticketId });
    } catch (err) {
      console.error("Application submission error:", {
        error: err.message,
        userId: req.userId,
        gigId: req.params.id,
      });
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
        .sort({ createdAt: -1 });
      console.log("Fetched applications for gig:", {
        gigId: req.params.id,
        count: applications.length,
        applicants: applications.map((app) => ({
          applicantId: app.applicantId._id,
          applicantName: app.applicantName,
          status: app.status,
          coverLetter: app.coverLetter || "None",
        })),
      });
      res.json(applications);
    } catch (err) {
      console.error("Get applications error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Get User's Applications
app.get("/api/users/:id/applications", async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      console.log("No token provided, returning empty applications");
      return res.json([]);
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.log("No token found after parsing, returning empty applications");
      return res.json([]);
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.json([]);
    }

    if (userId !== req.params.id) {
      console.error("Unauthorized access attempt:", {
        userId,
        requestedId: req.params.id,
      });
      return res
        .status(403)
        .json({ error: "You can only view your own applications" });
    }

    const applications = await Application.find({ applicantId: req.params.id })
      .populate("gigId", "title category price status")
      .sort({ createdAt: -1 });
    console.log("Fetched user applications:", {
      userId: req.params.id,
      count: applications.length,
      applications: applications.map((app) => ({
        gigId: app.gigId._id,
        title: app.gigId.title,
        status: app.status,
        coverLetter: app.coverLetter || "None",
      })),
    });
    res.json(applications);
  } catch (err) {
    console.error("Get user applications error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Accept/Reject Application
app.patch(
  "/api/gigs/:id/applications/:applicationId",
  authMiddleware,
  checkGigOwner,
  async (req, res) => {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Must be 'accepted' or 'rejected'" });
    }
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
        console.error("Attempt to update non-pending application:", {
          applicationId: req.params.applicationId,
          currentStatus: application.status,
        });
        return res.status(400).json({
          error: `Application is already ${application.status}`,
        });
      }

      const gig = await Gig.findOne({ _id: req.params.id });
      if (!gig) return res.status(404).json({ error: "Gig not found" });

      application.status = status;
      await application.save();

      if (status === "accepted") {
        const ticket = await Ticket.findOne({
          gigId: req.params.id,
          buyerId: application.applicantId,
        });
        if (ticket) {
          ticket.status = "accepted";
          await ticket.save();
          console.log("Ticket updated to accepted:", {
            ticketId: ticket._id,
            gigId: req.params.id,
            buyerId: application.applicantId,
          });
        } else {
          console.error("Ticket not found for accepted application:", {
            gigId: req.params.id,
            buyerId: application.applicantId,
          });
        }
      }

      const seller = await User.findOne({ _id: gig.sellerId });
      const buyer = await User.findOne({ _id: application.applicantId });
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
          console.error("Failed to send application status email:", err);
        });
      }

      console.log("Application status updated:", {
        applicationId: req.params.applicationId,
        status,
        gigId: req.params.id,
        applicantId: application.applicantId,
      });
      res.json({ success: true, application });
    } catch (err) {
      console.error("Application status update error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Get User's Tickets
app.get("/api/users/:id/tickets", async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      console.log("No token provided, returning empty tickets");
      return res.json([]);
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.log("No token found after parsing, returning empty tickets");
      return res.json([]);
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.json([]);
    }

    if (userId !== req.params.id) {
      console.error("Unauthorized ticket access attempt:", {
        userId,
        requestedId: req.params.id,
      });
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
      .sort({ createdAt: -1 });
    console.log("Fetched user tickets:", {
      userId,
      count: tickets.length,
    });
    res.json(tickets);
  } catch (err) {
    console.error("Get user tickets error:", err);
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
        .populate("buyerId", "fullName email profilePicture");
      if (!ticket) {
        console.error("Ticket not found for ID:", req.params.id);
        return res.status(404).json({ error: "Ticket not found" });
      }
      console.log("Fetched ticket:", { id: ticket._id, gigId: ticket.gigId });
      res.json(ticket);
    } catch (err) {
      console.error("Get ticket error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Send Message in Ticket
app.post(
  "/api/tickets/:id/messages",
  authMiddleware,
  checkTicketParticipant,
  applyLimiter,
  async (req, res) => {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }
    if (content.length < 1 || content.length > 1000) {
      return res
        .status(400)
        .json({ error: "Message must be between 1 and 1000 characters" });
    }
    try {
      const ticket = req.ticket;
      if (ticket.status === "closed") {
        return res.status(400).json({ error: "Ticket is closed" });
      }

      ticket.messages.push({
        senderId: req.userId,
        senderName: req.user.fullName,
        content,
        timestamp: new Date(),
      });
      if (ticket.status === "open") {
        ticket.status = "negotiating";
      }
      await ticket.save();

      const recipientId =
        ticket.sellerId === req.userId ? ticket.buyerId : ticket.sellerId;
      const recipient = await User.findOne({ _id: recipientId });
      if (recipient) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipient.email,
          subject: `New Message in Ticket for Gig "${ticket.gigId.title}"`,
          html: `<p>Dear ${recipient.fullName},</p><p>You have a new message from ${req.user.fullName} in ticket for "${ticket.gigId.title}":</p><p>"${content}"</p><p>View the ticket at: /tickets/${ticket._id}</p>`,
        };
        await transporter.sendMail(mailOptions).catch((err) => {
          console.error("Failed to send message notification email:", err);
        });
      }

      console.log("Message sent in ticket:", {
        ticketId: req.params.id,
        senderId: req.userId,
        contentLength: content.length,
      });
      res.json({ success: true, ticket });
    } catch (err) {
      console.error("Send message error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Update Ticket Price
app.patch(
  "/api/tickets/:id/price",
  authMiddleware,
  checkTicketParticipant,
  async (req, res) => {
    const { agreedPrice } = req.body;
    if (!agreedPrice || isNaN(agreedPrice) || agreedPrice <= 0) {
      return res
        .status(400)
        .json({ error: "Agreed price must be a positive number" });
    }
    try {
      const ticket = req.ticket;
      if (ticket.status === "closed") {
        return res.status(400).json({ error: "Ticket is closed" });
      }

      ticket.agreedPrice = parseFloat(agreedPrice);
      ticket.status = "negotiating";
      await ticket.save();

      const otherUserId =
        ticket.sellerId === req.userId ? ticket.buyerId : ticket.sellerId;
      const otherUser = await User.findOne({ _id: otherUserId });
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
          console.error("Failed to send price proposal email:", err);
        });
      }

      console.log("Ticket price proposed:", {
        ticketId: req.params.id,
        agreedPrice,
      });
      res.json({ success: true, ticket });
    } catch (err) {
      console.error("Update ticket price error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Accept Ticket Price
app.patch(
  "/api/tickets/:id/accept-price",
  authMiddleware,
  checkTicketParticipant,
  async (req, res) => {
    try {
      const ticket = req.ticket;
      if (ticket.status !== "negotiating") {
        return res.status(400).json({
          error: "Ticket must be in negotiating status to accept price",
        });
      }
      if (req.userId !== ticket.buyerId) {
        return res
          .status(403)
          .json({ error: "Only the buyer can accept the price" });
      }
      if (!ticket.agreedPrice) {
        return res.status(400).json({ error: "No agreed price set" });
      }

      ticket.status = "accepted";
      await ticket.save();

      const seller = await User.findOne({ _id: ticket.sellerId });
      if (seller) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: seller.email,
          subject: `Price Accepted for Gig "${ticket.gigId.title}"`,
          html: `<p>Dear ${seller.fullName},</p><p>${
            req.user.fullName
          } has accepted the price of ₹${ticket.agreedPrice.toLocaleString(
            "en-IN"
          )} for "${
            ticket.gigId.title
          }".</p><p>Please wait for payment confirmation at: /tickets/${
            ticket._id
          }</p>`,
        };
        await transporter.sendMail(mailOptions).catch((err) => {
          console.error("Failed to send price acceptance email:", err);
        });
      }

      console.log("Ticket price accepted:", {
        ticketId: req.params.id,
        agreedPrice: ticket.agreedPrice,
      });
      res.json({ success: true, ticket });
    } catch (err) {
      console.error("Accept ticket price error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Confirm Payment
app.patch(
  "/api/tickets/:id/pay",
  authMiddleware,
  checkTicketParticipant,
  async (req, res) => {
    try {
      const ticket = req.ticket;
      if (ticket.status !== "accepted") {
        return res.status(400).json({
          error: "Ticket must be in accepted status to confirm payment",
        });
      }
      if (req.userId !== ticket.buyerId) {
        return res
          .status(403)
          .json({ error: "Only the buyer can confirm payment" });
      }

      ticket.status = "paid";
      await ticket.save();

      // Close applications for the associated gig
      const gig = await Gig.findOne({ _id: ticket.gigId });
      if (gig) {
        gig.status = "closed";
        await gig.save();
        console.log("Gig applications closed:", {
          gigId: gig._id,
          title: gig.title,
        });

        // Reject all pending applications except the accepted one
        const applications = await Application.find({
          gigId: ticket.gigId,
          status: "pending",
        });
        for (const app of applications) {
          app.status = "rejected";
          await app.save();
          const applicant = await User.findOne({ _id: app.applicantId });
          if (applicant) {
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: applicant.email,
              subject: `Application Update for Gig "${gig.title}"`,
              html: `<p>Dear ${applicant.fullName},</p><p>The gig "${gig.title}" has been closed as payment has been confirmed, and your application has been rejected.</p><p>Explore other gigs on Gig Connect.</p>`,
            };
            await transporter.sendMail(mailOptions).catch((err) => {
              console.error("Failed to send rejection email:", err);
            });
          }
        }
        console.log("Rejected pending applications:", {
          gigId: ticket.gigId,
          count: applications.length,
        });
      }

      const seller = await User.findOne({ _id: ticket.sellerId });
      if (seller) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: seller.email,
          subject: `Payment Confirmed for Gig "${gig.title}"`,
          html: `<p>Dear ${seller.fullName},</p><p>${
            req.user.fullName
          } has confirmed payment of ₹${(
            ticket.agreedPrice || gig.price
          ).toLocaleString("en-IN")} for "${
            gig.title
          }".</p><p>Proceed with the work and wait for the buyer to mark it as completed: /tickets/${
            ticket._id
          }</p>`,
        };
        await transporter.sendMail(mailOptions).catch((err) => {
          console.error("Failed to send payment confirmation email:", err);
        });
      }

      console.log("Payment confirmed for ticket:", {
        ticketId: req.params.id,
        agreedPrice: ticket.agreedPrice || gig.price,
      });
      res.json({ success: true, ticket });
    } catch (err) {
      console.error("Confirm payment error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Mark Work as Completed
app.patch(
  "/api/tickets/:id/complete",
  authMiddleware,
  checkTicketParticipant,
  async (req, res) => {
    try {
      const ticket = req.ticket;
      if (ticket.status !== "paid") {
        return res.status(400).json({
          error: "Ticket must be in paid status to mark as completed",
        });
      }
      if (req.userId !== ticket.buyerId) {
        return res
          .status(403)
          .json({ error: "Only the buyer can mark work as completed" });
      }

      ticket.status = "completed";
      await ticket.save();

      const seller = await User.findOne({ _id: ticket.sellerId });
      if (seller) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: seller.email,
          subject: `Work Marked as Completed for Gig "${ticket.gigId.title}"`,
          html: `<p>Dear ${seller.fullName},</p><p>${req.user.fullName} has marked the work as completed for "${ticket.gigId.title}".</p><p>Please confirm completion at: /tickets/${ticket._id}</p>`,
        };
        await transporter.sendMail(mailOptions).catch((err) => {
          console.error("Failed to send completion email:", err);
        });
      }

      console.log("Work marked as completed for ticket:", {
        ticketId: req.params.id,
      });
      res.json({ success: true, ticket });
    } catch (err) {
      console.error("Mark work completed error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Confirm Completion and Update Credits
app.patch(
  "/api/tickets/:id/confirm-completion",
  authMiddleware,
  checkTicketParticipant,
  async (req, res) => {
    try {
      const ticket = req.ticket;
      if (ticket.status !== "completed") {
        return res.status(400).json({
          error: "Ticket must be in completed status to confirm completion",
        });
      }
      if (req.userId !== ticket.sellerId) {
        return res
          .status(403)
          .json({ error: "Only the seller can confirm completion" });
      }

      const { rating } = req.body; // Get rating from request body
      if (rating && (typeof rating !== "number" || rating < 1 || rating > 5)) {
        return res.status(400).json({
          error: "Rating must be a number between 1 and 5",
        });
      }

      ticket.status = "closed";
      await ticket.save();

      const gig = await Gig.findOne({ _id: ticket.gigId });
      const seller = await User.findOne({ _id: ticket.sellerId });
      const buyer = await User.findOne({ _id: ticket.buyerId });

      if (seller && buyer && gig) {
        // Update seller's order history
        seller.orderHistory.push({
          title: gig.title,
          status: "completed",
          earnings: ticket.agreedPrice || gig.price,
          date: new Date(),
        });
        seller.gigsCompleted = (seller.gigsCompleted || 0) + 1;
        seller.completionRate = seller.totalGigs
          ? (seller.gigsCompleted / seller.totalGigs) * 100
          : 0;
        await seller.save();

        // Update buyer's profile with credits, stats, and rating
        buyer.orderHistory.push({
          title: gig.title,
          status: "completed",
          earnings: 0,
          date: new Date(),
        });
        buyer.gigsCompleted = (buyer.gigsCompleted || 0) + 1;
        buyer.totalGigs = (buyer.totalGigs || 0) + 1;
        buyer.completionRate = buyer.totalGigs
          ? (buyer.gigsCompleted / buyer.totalGigs) * 100
          : 0;
        buyer.credits =
          (buyer.credits || 0) + (ticket.agreedPrice || gig.price);

        // Store rating in buyer's profile if provided
        if (rating) {
          buyer.ratings = buyer.ratings || [];
          buyer.ratings.push({
            value: rating,
            ticketId: ticket._id,
            giverId: req.userId,
            givenAt: new Date(),
          });
        }

        await buyer.save();

        // Notify buyer of completion confirmation
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: buyer.email,
          subject: `Completion Confirmed for Gig "${gig.title}"`,
          html: `<p>Dear ${
            buyer.fullName
          },</p><p>The seller has confirmed completion for "${
            gig.title
          }". You have earned ${(
            ticket.agreedPrice || gig.price
          ).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })} in credits.${
            rating
              ? ` The seller rated you ${rating} star${rating > 1 ? "s" : ""}.`
              : ""
          }</p><p>View details at: /tickets/${ticket._id}</p>`,
        };
        await transporter.sendMail(mailOptions).catch((err) => {
          console.error("Failed to send completion confirmation email:", err);
        });
      }

      console.log("Completion confirmed for ticket:", {
        ticketId: req.params.id,
        buyerId: ticket.buyerId,
        creditsEarned: ticket.agreedPrice || gig.price,
        rating: rating || "Not provided",
      });
      res.json({ success: true, ticket });
    } catch (err) {
      console.error("Confirm completion error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

// Close Ticket
app.patch(
  "/api/tickets/:id/close",
  authMiddleware,
  checkTicketParticipant,
  async (req, res) => {
    try {
      const ticket = req.ticket;
      if (ticket.status === "closed") {
        return res.status(400).json({ error: "Ticket is already closed" });
      }

      ticket.status = "closed";
      await ticket.save();

      console.log("Ticket closed:", { ticketId: req.params.id });
      res.json({ success: true, ticket });
    } catch (err) {
      console.error("Close ticket error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);

//google gemini setup :
app.post("/api/ai/generate-description", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Generate a professional gig description for a service titled "${title}" in 100-150 words. The description should be engaging, highlight the service's unique value, specify deliverables, and mention a typical timeline. Use a professional tone suitable for a freelance marketplace.`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();

    res.json({ description });
  } catch (err) {
    console.error("Error generating description:", err);
    res.status(500).json({ error: "Failed to generate description" });
  }
});

// Cleanup expired pending users and OTPs
setInterval(async () => {
  try {
    await PendingUser.deleteMany({ otpExpire: { $lt: Date.now() } });
    await User.updateMany(
      { emailOtpExpire: { $lt: Date.now() } },
      { $unset: { emailOtp: "", emailOtpExpire: "" } }
    );
    console.log("Cleaned expired pending users and OTPs");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}, 3600000);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
