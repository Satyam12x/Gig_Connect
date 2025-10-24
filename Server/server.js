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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Schemas
const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    college: { type: String, required: true },
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
    socialLinks: {
      linkedin: String,
      github: String,
      instagram: String,
    },
    emailOtp: String,
    emailOtpExpire: Date,
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
  title: { type: String, required: true },
  sellerName: { type: String, required: true },
  sellerId: { type: String, ref: "User", required: true },
  thumbnail: { type: String, default: "" },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Gig = mongoose.model("Gig", gigSchema);

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Routes
app.post("/api/auth/signup", async (req, res) => {
  const { fullName, email, password, college, role, bio, socialLinks } =
    req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

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
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/verify-otp", authMiddleware, async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await PendingUser.findOne({ _id: req.userId });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified. Please set your profile picture or skip.",
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/users/skip-profile", authMiddleware, async (req, res) => {
  try {
    if (!req.user.isVerified) {
      return res.status(400).json({ error: "Please verify your email first" });
    }

    let user = await User.findOne({ _id: req.userId });
    if (!user) {
      const pendingUser = await PendingUser.findOne({ _id: req.userId });
      if (!pendingUser) {
        return res.status(400).json({ error: "User not found" });
      }
      user = new User({
        _id: req.userId,
        fullName: pendingUser.fullName,
        email: pendingUser.email,
        password: pendingUser.password,
        college: pendingUser.college,
        role: pendingUser.role,
        bio: pendingUser.bio,
        socialLinks: pendingUser.socialLinks,
        isVerified: true,
        profilePicture: "",
        skills: [],
        certifications: [],
        orderHistory: [],
        gigsCompleted: 0,
        totalGigs: 0,
        completionRate: 0,
      });
      await user.save();
      await PendingUser.deleteOne({ _id: req.userId });
      console.log("User saved (skip):", user._id);
    }

    res.json({ success: true, message: "Profile setup complete" });
  } catch (err) {
    console.error("Skip profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post(
  "/api/users/upload-profile",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.user.isVerified) {
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
            return res
              .status(500)
              .json({
                error: "Failed to upload image to Cloudinary",
                details: error.message,
              });
          }

          try {
            let user = await User.findOne({ _id: req.userId });
            if (!user) {
              const pendingUser = await PendingUser.findOne({
                _id: req.userId,
              });
              if (!pendingUser) {
                return res.status(400).json({ error: "User not found" });
              }
              user = new User({
                _id: req.userId,
                fullName: pendingUser.fullName,
                email: pendingUser.email,
                password: pendingUser.password,
                college: pendingUser.college,
                role: pendingUser.role,
                bio: pendingUser.bio,
                socialLinks: pendingUser.socialLinks,
                isVerified: true,
                profilePicture: result.secure_url,
                skills: [],
                certifications: [],
                orderHistory: [],
                gigsCompleted: 0,
                totalGigs: 0,
                completionRate: 0,
              });
              await user.save();
              await PendingUser.deleteOne({ _id: req.userId });
              console.log(
                "User saved with profile picture:",
                user._id,
                "URL:",
                result.secure_url
              );
            } else {
              user.profilePicture = result.secure_url;
              await user.save();
              console.log(
                "Profile picture updated:",
                user._id,
                "URL:",
                result.secure_url
              );
            }
            res.json({ success: true, profilePicture: result.secure_url });
          } catch (err) {
            console.error("Database update error:", err);
            res
              .status(500)
              .json({
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

app.put(
  "/api/users/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        console.error("No file provided in profile picture update");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const user = await User.findOne({ _id: req.userId });
      if (!user) {
        console.error("User not found for ID:", req.userId);
        return res.status(400).json({ error: "User not found" });
      }

      const stream = cloudinary.uploader.upload_stream(
        { folder: "gigconnect/profiles", resource_type: "image" },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res
              .status(500)
              .json({
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
            res
              .status(500)
              .json({
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

app.put("/api/users/profile", authMiddleware, async (req, res) => {
  const { fullName } = req.body;
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (fullName) user.fullName = fullName;
    await user.save();
    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.post("/api/users/request-email-otp", authMiddleware, async (req, res) => {
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
});

app.post("/api/users/verify-email-otp", authMiddleware, async (req, res) => {
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
});

app.put("/api/users/password", authMiddleware, async (req, res) => {
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
});

app.post("/api/users/skills", authMiddleware, async (req, res) => {
  const { skill } = req.body;
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

app.post("/api/users/endorse", authMiddleware, async (req, res) => {
  try {
    const { skill } = req.body;
    const user = await User.findOne({ _id: req.userId });
    if (!user) return res.status(400).json({ error: "User not found" });
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

app.post("/api/users/certifications", authMiddleware, async (req, res) => {
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
});

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

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ success: true, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

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

app.post("/api/reviews", authMiddleware, async (req, res) => {
  const { userId, text, rating, reviewerName } = req.body;
  try {
    const review = new Review({
      userId,
      reviewerName: reviewerName || req.user.fullName,
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

app.get("/api/gigs/recent", async (req, res) => {
  try {
    const gigs = await Gig.find().sort({ createdAt: -1 }).limit(10);
    res.json(gigs);
  } catch (err) {
    console.error("Recent gigs fetch error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

setInterval(async () => {
  try {
    await PendingUser.deleteMany({ otpExpire: { $lt: Date.now() } });
    console.log("Cleaned expired pending users");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}, 3600000);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
