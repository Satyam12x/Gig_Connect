import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  CheckCircle,
  Linkedin,
  Github,
  Instagram,
  Trophy,
  Award,
  Edit2,
  X,
  Check,
  Plus,
  Trash2,
  Share2,
  Camera,
  Briefcase,
  Zap,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  CreditCard,
  History,
  Wallet,
  TrendingUp,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Settings as SettingsIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const theme = {
  primary: "#1A2A4F",
  primaryLight: "#2A3A6F",
  primaryMedium: "#3A4A7F",
  primarySoft: "#4A5A8F",
  light: "#E8EBF2",
  lighter: "#F4F6FA",
  white: "#FFFFFF",
};

// Fade In Animation Component
const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, delay = 0 }) => (
  <FadeIn delay={delay}>
    <div
      className="text-center p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{ backgroundColor: theme.white, borderColor: theme.light }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ backgroundColor: theme.lighter }}
      >
        <Icon className="w-6 h-6" style={{ color: theme.primary }} />
      </div>
      <div className="text-3xl font-bold" style={{ color: theme.primary }}>
        {value}
      </div>
      <div className="text-sm mt-1" style={{ color: theme.primaryMedium }}>
        {label}
      </div>
    </div>
  </FadeIn>
);

// Section Card Component
const SectionCard = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border p-6 md:p-8 ${className}`}
    style={{ backgroundColor: theme.white, borderColor: theme.light }}
  >
    {children}
  </div>
);

// Section Header Component
const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: theme.lighter }}
      >
        <Icon className="w-5 h-5" style={{ color: theme.primary }} />
      </div>
      <h2 className="text-xl font-bold" style={{ color: theme.primary }}>
        {title}
      </h2>
    </div>
    {action}
  </div>
);

// Setting Item Component
const SettingItem = ({
  icon: Icon,
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}) => (
  <div
    className="rounded-xl p-4 transition-all duration-300 border"
    style={{
      backgroundColor: isOpen ? theme.lighter : theme.white,
      borderColor: isOpen ? theme.primaryMedium : theme.light,
    }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: isOpen ? theme.white : theme.lighter }}
        >
          <Icon className="w-5 h-5" style={{ color: theme.primary }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: theme.primary }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: theme.primaryMedium }}>
            {subtitle}
          </p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className="p-2 rounded-lg transition-colors"
        style={{ backgroundColor: theme.lighter }}
      >
        {isOpen ? (
          <X className="w-5 h-5" style={{ color: theme.primary }} />
        ) : (
          <Edit2 className="w-5 h-5" style={{ color: theme.primary }} />
        )}
      </button>
    </div>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div
            className="pt-4 mt-4 border-t"
            style={{ borderColor: theme.light }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Input Component
const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  className = "",
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`w-full px-4 py-3 rounded-xl border-2 text-base transition-all duration-300 focus:outline-none disabled:opacity-60 ${className}`}
    style={{
      borderColor: theme.light,
      backgroundColor: theme.white,
      color: theme.primary,
    }}
    onFocus={(e) => (e.target.style.borderColor = theme.primary)}
    onBlur={(e) => (e.target.style.borderColor = theme.light)}
  />
);

// Button Component
const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}) => {
  const styles = {
    primary: {
      backgroundColor: theme.primary,
      color: theme.white,
    },
    secondary: {
      backgroundColor: theme.lighter,
      color: theme.primary,
    },
    outline: {
      backgroundColor: "transparent",
      color: theme.primary,
      border: `2px solid ${theme.primary}`,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
};

// Coin Wallet Modal
const CoinWalletModal = ({ isOpen, onClose, user, onUpdateCoins }) => {
  const [activeTab, setActiveTab] = useState("balance");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const actionLockRef = useRef(false);

  const coinPackages = [
    { coins: 100, price: 99, popular: false },
    { coins: 500, price: 449, popular: true },
    { coins: 1000, price: 849, popular: false },
    { coins: 2500, price: 1999, popular: false },
  ];

  const handlePurchase = async (amount) => {
    // prevent duplicate quick clicks
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/users/coins/purchase`,
        { amount, paymentId: `PAY_${Date.now()}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdateCoins(res.data.coins);
      toast.success(`${amount} coins purchased successfully!`);
      setPurchaseAmount("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Purchase failed");
    } finally {
      actionLockRef.current = false;
      setIsLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!recipientId || !transferAmount) return;
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/users/coins/transfer`,
        {
          recipientId,
          amount: parseInt(transferAmount),
          reason: "Profile transfer",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdateCoins(res.data.senderCoins);
      toast.success(`${transferAmount} coins sent successfully!`);
      setTransferAmount("");
      setRecipientId("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Transfer failed");
    } finally {
      actionLockRef.current = false;
      setIsLoading(false);
    }
  };

  const handleNavigateToPurchase = () => {
    navigate("/purchase-coins");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: theme.white }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6" style={{ backgroundColor: theme.primary }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Coin Wallet</h3>
                <p className="text-white/70 text-sm">Manage your coins</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Balance Display */}
          <div className="mt-6 p-4 rounded-xl bg-white/10">
            <p className="text-white/70 text-sm">Current Balance</p>
            <div className="flex items-center gap-2 mt-1">
              <Coins className="w-8 h-8 text-yellow-400" />
              <span className="text-4xl font-bold text-white">
                {user?.coins || 0}
              </span>
              <span className="text-white/70">coins</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: theme.light }}>
          {[
            { id: "balance", label: "Buy Coins", icon: CreditCard },
            { id: "transfer", label: "Transfer", icon: Send },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
                activeTab === tab.id ? "border-b-2" : ""
              }`}
              style={{
                borderColor:
                  activeTab === tab.id ? theme.primary : "transparent",
                color:
                  activeTab === tab.id ? theme.primary : theme.primaryMedium,
              }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "balance" && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: theme.primaryMedium }}>
                Select a package or enter custom amount
              </p>

              {/* Quick Buy Packages */}
              <div className="grid grid-cols-2 gap-3">
                {coinPackages.map((pkg) => (
                  <button
                    key={pkg.coins}
                    onClick={() => handlePurchase(pkg.coins)}
                    disabled={isLoading}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                      pkg.popular ? "border-yellow-400" : ""
                    }`}
                    style={{
                      borderColor: pkg.popular ? "#facc15" : theme.light,
                      backgroundColor: theme.white,
                    }}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-400 text-xs font-bold rounded-full text-yellow-900">
                        POPULAR
                      </span>
                    )}
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span
                        className="text-xl font-bold"
                        style={{ color: theme.primary }}
                      >
                        {pkg.coins}
                      </span>
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: theme.primaryMedium }}
                    >
                      ₹{pkg.price}
                    </p>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="flex gap-3 mt-4">
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() =>
                    purchaseAmount && handlePurchase(parseInt(purchaseAmount))
                  }
                  disabled={!purchaseAmount || isLoading}
                >
                  {isLoading ? "..." : "Buy"}
                </Button>
              </div>

              {/* Navigate to Full Purchase Page */}
              <div
                className="mt-6 pt-6 border-t"
                style={{ borderColor: theme.light }}
              >
                <Button
                  onClick={handleNavigateToPurchase}
                  variant="outline"
                  className="w-full"
                >
                  <CreditCard className="w-4 h-4" />
                  View All Packages & Offers
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {activeTab === "transfer" && (
            <form onSubmit={handleTransfer} className="space-y-4">
              <p className="text-sm" style={{ color: theme.primaryMedium }}>
                Send coins to another user
              </p>

              <Input
                placeholder="Recipient User ID"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Amount to send"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />

              <Button
                type="submit"
                disabled={isLoading || !recipientId || !transferAmount}
                className="w-full"
              >
                {isLoading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Coins
                  </>
                )}
              </Button>

              <p
                className="text-xs text-center"
                style={{ color: theme.primaryMedium }}
              >
                Coins will be instantly transferred to the recipient
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Share Profile Modal
const ShareProfileModal = ({ isOpen, onClose, user, stats }) => {
  const profileUrl = `${window.location.origin}/profile/${user?._id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied!");
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: theme.white }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6" style={{ backgroundColor: theme.primary }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Share Profile</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Profile Card Preview */}
        <div className="p-6">
          <div
            className="p-6 rounded-xl border"
            style={{ backgroundColor: theme.lighter, borderColor: theme.light }}
          >
            <div className="flex items-center gap-4 mb-4">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  {user.fullName?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h4
                  className="text-lg font-bold"
                  style={{ color: theme.primary }}
                >
                  {user.fullName}
                </h4>
                <p className="text-sm" style={{ color: theme.primaryMedium }}>
                  {user.role === "Both" ? "Provider & Freelancer" : user.role}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center p-3 rounded-lg"
                  style={{ backgroundColor: theme.white }}
                >
                  <div
                    className="text-lg font-bold"
                    style={{ color: theme.primary }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: theme.primaryMedium }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Options */}
          <div className="mt-6 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={profileUrl}
                readOnly
                className="flex-1 px-4 py-3 rounded-xl border text-sm truncate"
                style={{
                  backgroundColor: theme.lighter,
                  borderColor: theme.light,
                  color: theme.primary,
                }}
              />
              <Button onClick={copyToClipboard} variant="secondary">
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <Button className="w-full">
              <Download className="w-4 h-4" />
              Download Profile Card
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Main Profile Component
const Profile = () => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [certForm, setCertForm] = useState({ name: "", issuer: "" });
  const [newSkill, setNewSkill] = useState("");

  // UI States
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const actionLockRef = useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const [profileRes, reviewsRes, coinsRes] = await Promise.all([
          axios.get(`${API_BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/users/coins`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser({ ...profileRes.data, coins: coinsRes.data.coins || 0 });
        setReviews(reviewsRes.data);

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Handlers


  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/users/skills`,
        { skill: newSkill },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), { name: newSkill }],
      }));
      setNewSkill("");
      setShowSkillForm(false);
      toast.success("Skill added!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add skill");
    } finally {
      actionLockRef.current = false;
    }
  };

  const handleDeleteSkill = async (skillName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/users/skills/${skillName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s.name !== skillName),
      }));
      toast.success("Skill removed");
    } catch (err) {
      toast.error("Failed to remove skill");
    }
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    if (!certForm.name.trim() || !certForm.issuer.trim()) return;
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/users/certifications`, certForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) => ({
        ...prev,
        certifications: [...(prev.certifications || []), certForm],
      }));
      setCertForm({ name: "", issuer: "" });
      setShowCertForm(false);
      toast.success("Certification added!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add certification");
    } finally {
      actionLockRef.current = false;
    }
  };

  const handleDeleteCertification = async (certName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/users/certifications/${certName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) => ({
        ...prev,
        certifications: prev.certifications.filter((c) => c.name !== certName),
      }));
      toast.success("Certification removed");
    } catch (err) {
      toast.error("Failed to remove certification");
    }
  };

  const handleProfilePicUpload = async (file) => {
    if (!file) return;
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/users/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUser((prev) => ({ ...prev, profilePicture: res.data.profilePicture }));
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
      actionLockRef.current = false;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleProfilePicUpload(file);
    }
  };

  const handleUpdateCoins = (newCoins) => {
    setUser((prev) => ({ ...prev, coins: newCoins }));
  };

  // Loading State
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.lighter }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: theme.light, borderTopColor: theme.primary }}
          />
          <p className="text-lg font-medium" style={{ color: theme.primary }}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1
      )
    : "N/A";

  const isProvider = user.role === "Provider" || user.role === "Both";
  const isFreelancer = user.role === "Freelancer" || user.role === "Both";

  const stats = [
    {
      label: isProvider ? "Gigs Posted" : "Gigs Completed",
      value: isProvider ? user.gigsPosted || 0 : user.gigsCompleted || 0,
      icon: Briefcase,
    },
    { label: "Rating", value: averageRating, icon: TrendingUp },
    { label: "Reviews", value: reviews.length, icon: Trophy },
    { label: "Coins", value: user.coins || 0, icon: Coins },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />

      <div
        className="min-h-screen pt-20 pb-24"
        style={{ backgroundColor: theme.lighter }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <FadeIn>
            <SectionCard className="mt-6">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Profile Picture */}
                <div className="relative group flex-shrink-0">
                  <div
                    className={`w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                      isDragging ? "ring-4 scale-105" : "ring-4"
                    }`}
                    style={{
                      ringColor: isDragging ? theme.primary : theme.light,
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-5xl font-bold text-white"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {user.fullName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      {isUploading ? (
                        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) =>
                          handleProfilePicUpload(e.target.files[0])
                        }
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                    <h1
                      className="text-2xl md:text-3xl font-bold"
                      style={{ color: theme.primary }}
                    >
                      {user.fullName}
                    </h1>
                    {user.isVerified && (
                      <CheckCircle
                        className="w-6 h-6"
                        style={{ color: theme.primary }}
                      />
                    )}
                  </div>

                  <p
                    className="text-lg font-medium mb-2"
                    style={{ color: theme.primaryMedium }}
                  >
                    {user.role === "Both" ? "Provider & Freelancer" : user.role}
                  </p>

                  {user.college && (
                    <div
                      className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
                      style={{
                        backgroundColor: theme.lighter,
                        color: theme.primary,
                      }}
                    >
                      {user.college}
                    </div>
                  )}

                  {user.bio && (
                    <p
                      className="text-sm leading-relaxed max-w-xl mb-4"
                      style={{ color: theme.primaryMedium }}
                    >
                      {user.bio}
                    </p>
                  )}

                  {/* Social Links */}
                  <div className="flex gap-3 justify-center md:justify-start">
                    {user.socialLinks?.linkedin && (
                      <a
                        href={user.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                        style={{
                          backgroundColor: theme.lighter,
                          color: theme.primary,
                        }}
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {user.socialLinks?.github && (
                      <a
                        href={user.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                        style={{
                          backgroundColor: theme.lighter,
                          color: theme.primary,
                        }}
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {user.socialLinks?.instagram && (
                      <a
                        href={user.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                        style={{
                          backgroundColor: theme.lighter,
                          color: theme.primary,
                        }}
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Button onClick={() => setShowWalletModal(true)}>
                    <Wallet className="w-4 h-4" />
                    Wallet
                  </Button>
                  <Button
                    onClick={() => setShowShareModal(true)}
                    variant="outline"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            </SectionCard>
          </FadeIn>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} delay={0.1 + i * 0.05} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column - Performance */}
            <div className="space-y-6">
              {/* Performance Card */}
              <FadeIn delay={0.2}>
                <SectionCard>
                  <SectionHeader icon={Trophy} title="Performance" />

                  <div className="space-y-6">
                    {/* Rating */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className="font-medium"
                          style={{ color: theme.primary }}
                        >
                          Average Rating
                        </span>
                        <span
                          className="text-xl font-bold"
                          style={{ color: theme.primary }}
                        >
                          {averageRating}/5
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{
                              backgroundColor:
                                i < Math.round(parseFloat(averageRating) || 0)
                                  ? theme.primary
                                  : theme.light,
                              color:
                                i < Math.round(parseFloat(averageRating) || 0)
                                  ? theme.white
                                  : theme.primaryMedium,
                            }}
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Completion Rate */}
                    {isFreelancer && user.completionRate !== undefined && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className="font-medium"
                            style={{ color: theme.primary }}
                          >
                            Completion Rate
                          </span>
                          <span
                            className="text-xl font-bold"
                            style={{ color: theme.primary }}
                          >
                            {user.completionRate}%
                          </span>
                        </div>
                        <div
                          className="w-full h-3 rounded-full overflow-hidden"
                          style={{ backgroundColor: theme.light }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: theme.primary }}
                            initial={{ width: 0 }}
                            animate={{ width: `${user.completionRate}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </FadeIn>

              {/* Coin Balance Card */}
              <FadeIn delay={0.25}>
                <SectionCard>
                  <SectionHeader
                    icon={Coins}
                    title="Coin Balance"
                    action={
                      <button
                        onClick={() => setShowWalletModal(true)}
                        className="text-sm font-medium flex items-center gap-1"
                        style={{ color: theme.primary }}
                      >
                        Manage <ChevronRight className="w-4 h-4" />
                      </button>
                    }
                  />

                  <div
                    className="p-4 rounded-xl flex items-center justify-between"
                    style={{ backgroundColor: theme.lighter }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-100">
                        <Coins className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p
                          className="text-sm"
                          style={{ color: theme.primaryMedium }}
                        >
                          Available
                        </p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: theme.primary }}
                        >
                          {user.coins || 0}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowWalletModal(true)}
                      variant="secondary"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </SectionCard>
              </FadeIn>
            </div>

            {/* Right Column - Settings, Skills, Certifications */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Settings Link */}
              <FadeIn delay={0.3}>
                 <div className="bg-white rounded-2xl border border-blue-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <SettingsIcon size={24} /> 
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-[#1A2A4F]">Account Settings</h3>
                          <p className="text-gray-500 text-sm">Update your password, email, and preferences.</p>
                       </div>
                    </div>
                    <Link to="/settings" className="px-6 py-2.5 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:bg-[#2A3A5F] transition-colors flex items-center gap-2">
                       <SettingsIcon size={18} />
                       Manage Account
                    </Link>
                 </div>
              </FadeIn>

              {/* Skills */}
              <FadeIn delay={0.35}>
                <SectionCard>
                  <SectionHeader
                    icon={Zap}
                    title="Skills"
                    action={
                      <button
                        onClick={() => setShowSkillForm(!showSkillForm)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: theme.primary,
                          color: theme.white,
                        }}
                      >
                        {showSkillForm ? (
                          <X className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>
                    }
                  />

                  <AnimatePresence>
                    {showSkillForm && (
                      <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleAddSkill}
                        className="flex gap-3 mb-4 overflow-hidden"
                      >
                        <Input
                          placeholder="e.g. React, Python, Figma"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit">Add</Button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-wrap gap-2">
                    {user.skills?.map((skill) => (
                      <motion.div
                        key={skill.name}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative px-4 py-2 rounded-xl border transition-all duration-300 hover:shadow-md"
                        style={{
                          backgroundColor: theme.lighter,
                          borderColor: theme.light,
                        }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: theme.primary }}
                        >
                          {skill.name}
                        </span>
                        <button
                          onClick={() => handleDeleteSkill(skill.name)}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                    {(!user.skills || user.skills.length === 0) && (
                      <p
                        className="text-sm"
                        style={{ color: theme.primaryMedium }}
                      >
                        No skills added yet. Click + to add your skills.
                      </p>
                    )}
                  </div>
                </SectionCard>
              </FadeIn>

              {/* Certifications */}
              <FadeIn delay={0.4}>
                <SectionCard>
                  <SectionHeader
                    icon={Award}
                    title="Certifications"
                    action={
                      <button
                        onClick={() => setShowCertForm(!showCertForm)}
                        disabled={user.certifications?.length >= 2}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                        style={{
                          backgroundColor: theme.primary,
                          color: theme.white,
                        }}
                      >
                        {showCertForm ? (
                          <X className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>
                    }
                  />

                  <AnimatePresence>
                    {showCertForm && (
                      <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleAddCertification}
                        className="space-y-3 mb-4 overflow-hidden"
                      >
                        <Input
                          placeholder="Certification Name"
                          value={certForm.name}
                          onChange={(e) =>
                            setCertForm({ ...certForm, name: e.target.value })
                          }
                        />
                        <Input
                          placeholder="Issuing Organization"
                          value={certForm.issuer}
                          onChange={(e) =>
                            setCertForm({ ...certForm, issuer: e.target.value })
                          }
                        />
                        <Button type="submit" className="w-full">
                          Add Certification
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.certifications?.map((cert) => (
                      <motion.div
                        key={cert.name}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-md"
                        style={{
                          backgroundColor: theme.lighter,
                          borderColor: theme.light,
                        }}
                      >
                        <h4
                          className="font-semibold"
                          style={{ color: theme.primary }}
                        >
                          {cert.name}
                        </h4>
                        <p
                          className="text-sm mt-1"
                          style={{ color: theme.primaryMedium }}
                        >
                          {cert.issuer}
                        </p>
                        <button
                          onClick={() => handleDeleteCertification(cert.name)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                    {(!user.certifications ||
                      user.certifications.length === 0) && (
                      <p
                        className="text-sm col-span-2"
                        style={{ color: theme.primaryMedium }}
                      >
                        No certifications added yet. Click + to add (max 2).
                      </p>
                    )}
                  </div>
                </SectionCard>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showWalletModal && (
          <CoinWalletModal
            isOpen={showWalletModal}
            onClose={() => setShowWalletModal(false)}
            user={user}
            onUpdateCoins={handleUpdateCoins}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && (
          <ShareProfileModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            user={user}
            stats={stats}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Profile;
