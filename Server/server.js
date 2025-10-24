require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom string ID
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String, required: true },
  bio: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  role: { type: String, enum: ['Seller', 'Buyer', 'Both'], default: 'Both' },
  isVerified: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  skills: [{ name: String, endorsements: { type: Number, default: 0 } }],
  portfolio: [{ title: String, description: String, thumbnail: String }],
  orderHistory: [{ title: String, status: String, earnings: Number, date: Date }],
  gigsCompleted: { type: Number, default: 0 },
  totalGigs: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  socialLinks: {
    linkedin: String,
    github: String,
    instagram: String,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

const pendingUserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  fullName: String,
  email: String,
  password: String,
  college: String,
  role: String,
  isVerified: Boolean,
  otp: String,
  otpExpire: Date,
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

const reviewSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  reviewerName: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  date: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);

const gigSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Gig = mongoose.model('Gig', gigSchema);

const creditSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  balance: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  transactions: [{
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now },
  }],
});

const Credit = mongoose.model('Credit', creditSchema);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Email transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Auth header:', authHeader); // Debug
  if (!authHeader) {
    console.log('No Authorization header provided');
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    console.log('No token found after parsing');
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug
    const user = await User.findOne({ _id: decoded.id }) || await PendingUser.findOne({ _id: decoded.id });
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      console.log('Pending users:', await PendingUser.find()); // Debug
      return res.status(401).json({ error: 'Token is not valid' });
    }
    req.user = user;
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log('Token verification error:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Routes
// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { fullName, email, password, college, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const userId = crypto.randomBytes(16).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const userData = {
      _id: userId,
      fullName,
      email,
      password,
      college,
      role: role || 'Both',
      isVerified: false,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    await PendingUser.create(userData);
    console.log('Pending user added to MongoDB:', userId, userData); // Debug

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Gig Connect account',
      html: `<p>Your OTP is <strong>${otp}</strong>. Enter it to verify your account. It expires in 10 minutes.</p>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log('Email error:', error);
      else console.log('Email sent:', info.response);
    });

    res.json({ success: true, token, message: 'Signup successful. Check your email for OTP.' });
  } catch (err) {
    console.log('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', authMiddleware, async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await PendingUser.findOne({ _id: req.userId });
    console.log('Verifying OTP for user:', req.userId, user); // Debug
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'OTP verified. Please set your profile picture or skip.' });
  } catch (err) {
    console.log('OTP verification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Skip profile picture
app.post('/api/users/skip-profile', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isVerified) {
      return res.status(400).json({ error: 'Please verify your email first' });
    }

    let user = await User.findOne({ _id: req.userId });
    if (!user) {
      const pendingUser = await PendingUser.findOne({ _id: req.userId });
      if (!pendingUser) {
        return res.status(400).json({ error: 'User not found' });
      }
      user = new User({
        _id: req.userId,
        fullName: pendingUser.fullName,
        email: pendingUser.email,
        password: pendingUser.password,
        college: pendingUser.college,
        role: pendingUser.role,
        isVerified: true,
        profilePicture: '',
        skills: [],
        portfolio: [],
        orderHistory: [],
        gigsCompleted: 0,
        totalGigs: 0,
        completionRate: 0,
        socialLinks: {},
      });
      await user.save();
      await PendingUser.deleteOne({ _id: req.userId });
      console.log('User saved to MongoDB (skip):', user._id); // Debug
    }

    // Initialize credits for new user
    let credit = await Credit.findOne({ userId: req.userId });
    if (!credit) {
      credit = new Credit({ userId: req.userId, balance: 0, earnings: 0, transactions: [] });
      await credit.save();
    }

    res.json({ success: true, message: 'Profile setup complete' });
  } catch (err) {
    console.log('Skip profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload profile picture
app.post('/api/users/upload-profile', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.user.isVerified) {
      return res.status(400).json({ error: 'Please verify your email first' });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'gigconnect/profiles' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(req.file.buffer);
    });

    let user = await User.findOne({ _id: req.userId });
    if (!user) {
      const pendingUser = await PendingUser.findOne({ _id: req.userId });
      if (!pendingUser) {
        return res.status(400).json({ error: 'User not found' });
      }
      user = new User({
        _id: req.userId,
        fullName: pendingUser.fullName,
        email: pendingUser.email,
        password: pendingUser.password,
        college: pendingUser.college,
        role: pendingUser.role,
        isVerified: true,
        profilePicture: result.secure_url,
        skills: [],
        portfolio: [],
        orderHistory: [],
        gigsCompleted: 0,
        totalGigs: 0,
        completionRate: 0,
        socialLinks: {},
      });
      await user.save();
      await PendingUser.deleteOne({ _id: req.userId });
      console.log('User saved to MongoDB (upload):', user._id); // Debug
    } else {
      user.profilePicture = result.secure_url;
      await user.save();
      console.log('User profile updated:', user._id); // Debug
    }

    // Initialize credits for new user
    let credit = await Credit.findOne({ userId: req.userId });
    if (!credit) {
      credit = new Credit({ userId: req.userId, balance: 0, earnings: 0, transactions: [] });
      await credit.save();
    }

    res.json({ success: true, profilePicture: result.secure_url });
  } catch (err) {
    console.log('Upload profile error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Update profile
app.put('/api/users/profile', authMiddleware, async (req, res) => {
  const { fullName, email, college, bio, skills, socialLinks, isPublic } = req.body;
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) return res.status(400).json({ error: 'User not found' });

    // Check if email is taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Email already in use' });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.college = college || user.college;
    user.bio = bio || user.bio;
    user.skills = skills || user.skills;
    user.socialLinks = socialLinks || user.socialLinks;
    user.isPublic = isPublic !== undefined ? isPublic : user.isPublic;
    user.updatedAt = Date.now();
    await user.save();

    res.json({ success: true, message: 'Profile updated', user: user.toObject({ getters: true }) });
  } catch (err) {
    console.log('Profile update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update password
app.put('/api/users/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.log('Password update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select('-password');
    if (!user) return res.status(400).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.log('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } catch (err) {
    console.log('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch reviews
app.get('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.userId }).sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    console.log('Reviews fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create review (for testing; in production, restrict to clients post-gig)
app.post('/api/reviews', authMiddleware, async (req, res) => {
  const { userId, text, rating, reviewerName } = req.body;
  try {
    const review = new Review({
      userId,
      reviewerName: reviewerName || req.user.fullName,
      text,
      rating,
    });
    await review.save();
    res.json({ success: true, message: 'Review created' });
  } catch (err) {
    console.log('Review creation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch gigs
app.get('/api/gigs', authMiddleware, async (req, res) => {
  try {
    const gigs = await Gig.find({ userId: req.userId });
    res.json(gigs);
  } catch (err) {
    console.log('Gigs fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create gig
app.post('/api/gigs', authMiddleware, async (req, res) => {
  const { title, category, price } = req.body;
  try {
    const gig = new Gig({
      userId: req.userId,
      title,
      category,
      price,
    });
    await gig.save();
    res.json({ success: true, message: 'Gig created', gig });
  } catch (err) {
    console.log('Gig creation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch credits
app.get('/api/credits', authMiddleware, async (req, res) => {
  try {
    let credit = await Credit.findOne({ userId: req.userId });
    if (!credit) {
      credit = new Credit({ userId: req.userId, balance: 0, earnings: 0, transactions: [] });
      await credit.save();
    }
    res.json(credit);
  } catch (err) {
    console.log('Credits fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endorse skill
app.post('/api/users/endorse', authMiddleware, async (req, res) => {
  try {
    const { skill } = req.body;
    const user = await User.findOne({ _id: req.userId });
    if (!user) return res.status(400).json({ error: 'User not found' });
    user.skills = user.skills.map((s) =>
      s.name === skill ? { ...s, endorsements: (s.endorsements || 0) + 1 } : s
    );
    await user.save();
    res.json({ success: true, message: 'Skill endorsed' });
  } catch (err) {
    console.log('Skill endorsement error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload portfolio item
app.post('/api/users/portfolio', authMiddleware, upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'gigconnect/portfolio' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(req.file.buffer);
    });

    const user = await User.findOne({ _id: req.userId });
    if (!user) return res.status(400).json({ error: 'User not found' });
    user.portfolio.push({ title, description, thumbnail: result.secure_url });
    await user.save();
    res.json({ success: true, message: 'Portfolio item added', thumbnail: result.secure_url });
  } catch (err) {
    console.log('Portfolio upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cleanup expired pending users
setInterval(async () => {
  try {
    await PendingUser.deleteMany({ otpExpire: { $lt: Date.now() } });
    console.log('Cleaned expired pending users');
  } catch (err) {
    console.log('Cleanup error:', err);
  }
}, 3600000);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));