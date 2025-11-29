import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Wallet,
  CreditCard,
  Shield,
  Zap,
  Check,
  ArrowLeft,
  Gift,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Sparkles,
  Clock,
  ChevronRight,
  Info,
  Award,
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
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

// Floating Coins Animation
const FloatingCoins = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{
          x: `${Math.random() * 100}%`,
          y: "110%",
          rotate: 0,
          opacity: 0.4,
        }}
        animate={{
          y: "-10%",
          rotate: 360,
          opacity: 0,
        }}
        transition={{
          duration: Math.random() * 8 + 8,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: "linear",
        }}
      >
        <Coins className="text-yellow-400/20" size={Math.random() * 24 + 12} />
      </motion.div>
    ))}
  </div>
);

// Coin Package Card
const CoinPackageCard = ({ pkg, isSelected, onSelect, isLoading, index }) => {
  const savings = pkg.originalPrice - pkg.price;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onSelect(pkg)}
      disabled={isLoading}
      className={`relative w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left group disabled:opacity-50 ${
        isSelected ? "shadow-lg" : "hover:shadow-md"
      }`}
      style={{
        backgroundColor: isSelected ? theme.lighter : theme.white,
        borderColor: isSelected ? theme.primary : theme.light,
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Badge */}
      {pkg.badge && (
        <div className="absolute -top-3 left-4">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full text-white ${
              pkg.popular
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : "bg-gradient-to-r from-green-400 to-emerald-500"
            }`}
          >
            {pkg.badge}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex items-start justify-between mb-4 mt-1">
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isSelected
                ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                : "bg-gradient-to-br from-yellow-100 to-orange-100 group-hover:from-yellow-200 group-hover:to-orange-200"
            }`}
          >
            <Coins
              className={`w-7 h-7 ${
                isSelected ? "text-white" : "text-yellow-600"
              }`}
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold" style={{ color: theme.primary }}>
              {pkg.coins.toLocaleString()}
            </h3>
            <p className="text-sm" style={{ color: theme.primaryMedium }}>
              coins
            </p>
          </div>
        </div>

        {/* Selection Indicator */}
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            isSelected ? "border-green-500 bg-green-500" : "border-gray-300"
          }`}
        >
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold" style={{ color: theme.primary }}>
          ₹{pkg.price}
        </span>
        {pkg.originalPrice !== pkg.price && (
          <span
            className="text-sm line-through"
            style={{ color: theme.primaryMedium }}
          >
            ₹{pkg.originalPrice}
          </span>
        )}
      </div>

      {/* Savings & Per Coin */}
      <div className="flex items-center justify-between text-sm">
        {savings > 0 ? (
          <span className="font-medium" style={{ color: theme.success }}>
            Save ₹{savings}
          </span>
        ) : (
          <span style={{ color: theme.primaryMedium }}>Standard price</span>
        )}
        <span style={{ color: theme.primaryMedium }}>
          ₹{(pkg.price / pkg.coins).toFixed(2)}/coin
        </span>
      </div>
    </motion.button>
  );
};

// Transaction Item
const TransactionItem = ({ transaction, index }) => {
  const getTypeConfig = () => {
    switch (transaction.type) {
      case "purchase":
        return { icon: ArrowDownLeft, color: theme.success, prefix: "+" };
      case "deduct":
        return { icon: ArrowUpRight, color: theme.error, prefix: "-" };
      case "transfer_sent":
        return { icon: ArrowUpRight, color: theme.warning, prefix: "-" };
      case "transfer_received":
        return { icon: ArrowDownLeft, color: theme.success, prefix: "+" };
      case "bonus":
        return { icon: Gift, color: theme.success, prefix: "+" };
      default:
        return { icon: Coins, color: theme.primaryMedium, prefix: "" };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-sm"
      style={{ backgroundColor: theme.white, borderColor: theme.light }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        </div>
        <div>
          <p className="font-medium text-sm" style={{ color: theme.primary }}>
            {transaction.description ||
              transaction.type.replace(/_/g, " ").toUpperCase()}
          </p>
          <p className="text-xs" style={{ color: theme.primaryMedium }}>
            {formatDate(transaction.createdAt)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold" style={{ color: config.color }}>
          {config.prefix}
          {transaction.amount}
        </p>
        <p className="text-xs" style={{ color: theme.primaryMedium }}>
          Bal: {transaction.balanceAfter}
        </p>
      </div>
    </motion.div>
  );
};

// Success Modal
const SuccessModal = ({ isOpen, onClose, coins, balance }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: theme.white }}
        variants={scaleIn}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Header */}
        <div
          className="p-8 text-center"
          style={{ backgroundColor: theme.success }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Payment Successful!
          </motion.h2>
          <motion.p
            className="text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Coins have been added to your wallet
          </motion.p>
        </div>

        {/* Details */}
        <div className="p-6">
          <motion.div
            className="p-6 rounded-2xl mb-6 text-center"
            style={{ backgroundColor: theme.lighter }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="w-8 h-8 text-yellow-500" />
              <span
                className="text-4xl font-bold"
                style={{ color: theme.primary }}
              >
                +{coins}
              </span>
            </div>
            <p className="text-sm" style={{ color: theme.primaryMedium }}>
              coins added
            </p>
          </motion.div>

          <motion.div
            className="flex items-center justify-between p-4 rounded-xl border mb-6"
            style={{ borderColor: theme.light }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span style={{ color: theme.primaryMedium }}>New Balance</span>
            <span
              className="text-xl font-bold"
              style={{ color: theme.primary }}
            >
              {balance.toLocaleString()} coins
            </span>
          </motion.div>

          <motion.button
            onClick={onClose}
            className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90"
            style={{ backgroundColor: theme.primary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Test Mode Banner
const TestModeBanner = ({ onTestPurchase, isProcessing, transactionId }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 p-4 rounded-xl border-2 border-dashed"
    style={{
      borderColor: theme.warning,
      backgroundColor: `${theme.warning}10`,
    }}
  >
    <div className="flex items-start gap-3">
      <AlertCircle
        className="w-5 h-5 mt-0.5 flex-shrink-0"
        style={{ color: theme.warning }}
      />
      <div className="flex-1">
        <h4 className="font-semibold mb-1" style={{ color: theme.primary }}>
          Test Mode Active
        </h4>
        <p className="text-sm mb-3" style={{ color: theme.primaryMedium }}>
          Razorpay is not configured. Use the test button below to simulate a
          purchase.
        </p>
        {transactionId && (
          <button
            onClick={onTestPurchase}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg font-medium text-white text-sm flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: theme.warning }}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Complete Test Purchase
              </>
            )}
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

// Main Component
const PurchaseCoins = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedCoins, setPurchasedCoins] = useState(0);
  const [activeTab, setActiveTab] = useState("purchase");
  const [testMode, setTestMode] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);

  useEffect(() => {
    fetchData();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const [packagesRes, coinsRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/coins/packages`),
        axios.get(`${API_BASE}/users/coins`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/users/coins/history?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPackages(packagesRes.data.packages || []);
      setTestMode(packagesRes.data.testMode || false);
      setUserCoins(coinsRes.data.coins || 0);
      setTransactions(historyRes.data.transactions || []);

      const popularPkg = packagesRes.data.packages?.find((p) => p.popular);
      if (popularPkg) setSelectedPackage(popularPkg);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error("Failed to load data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error("Please select a package");
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");

      const orderRes = await axios.post(
        `${API_BASE}/coins/create-order`,
        { packageId: selectedPackage.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order, transactionId, key, testMode: isTestMode } = orderRes.data;
      setCurrentTransactionId(transactionId);

      if (isTestMode) {
        setTestMode(true);
        toast.success(
          "Order created! Use the test button to complete purchase.",
          {
            duration: 5000,
          }
        );
        setIsProcessing(false);
        return;
      }

      // Real Razorpay checkout
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: "Gig Connect",
        description: `Purchase ${selectedPackage.coins} Coins`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${API_BASE}/coins/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                transactionId: transactionId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            setPurchasedCoins(selectedPackage.coins);
            setUserCoins(verifyRes.data.coins);
            setShowSuccess(true);
            setCurrentTransactionId(null);
            fetchData();
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {},
        theme: { color: theme.primary },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  const handleTestPurchase = async () => {
    if (!currentTransactionId) {
      toast.error("Please create an order first");
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_BASE}/coins/test-payment`,
        { transactionId: currentTransactionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPurchasedCoins(selectedPackage.coins);
      setUserCoins(res.data.coins);
      setShowSuccess(true);
      setCurrentTransactionId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Test payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.lighter }}
      >
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 rounded-full mx-auto mb-4"
            style={{ borderColor: theme.light, borderTopColor: theme.primary }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="font-medium" style={{ color: theme.primary }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <Navbar />

      <div
        className="min-h-screen pt-20 pb-24"
        style={{ backgroundColor: theme.lighter }}
      >
        {/* Hero Section */}
        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: theme.primary }}
        >
          <FloatingCoins />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
            {/* Back Button */}
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </motion.button>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white/90">Special Offers</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Buy Coins &<br />
                  <span className="text-yellow-400">Unlock Features</span>
                </h1>

                <p className="text-base text-white/70 mb-6 max-w-md">
                  Use coins to apply for gigs, boost your profile, and access
                  premium features.
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Shield, text: "Secure Payments" },
                    { icon: Zap, text: "Instant Delivery" },
                    { icon: Gift, text: "Bonus Offers" },
                    { icon: Award, text: "Best Value" },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2 text-white/80"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <feature.icon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Content - Wallet Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Your Balance</p>
                      <p className="text-2xl font-bold text-white">
                        {userCoins.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/10">
                      <p className="text-white/60 text-xs mb-0.5">Purchased</p>
                      <p className="text-lg font-semibold text-white">
                        {transactions
                          .filter(
                            (t) =>
                              t.type === "purchase" && t.status === "completed"
                          )
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/10">
                      <p className="text-white/60 text-xs mb-0.5">Spent</p>
                      <p className="text-lg font-semibold text-white">
                        {transactions
                          .filter(
                            (t) =>
                              t.type === "deduct" && t.status === "completed"
                          )
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
          {/* Tabs */}
          <motion.div
            className="flex gap-1 p-1.5 rounded-xl mb-6 shadow-sm"
            style={{ backgroundColor: theme.white }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {[
              { id: "purchase", label: "Buy Coins", icon: CreditCard },
              { id: "history", label: "History", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300"
                style={{
                  backgroundColor:
                    activeTab === tab.id ? theme.primary : "transparent",
                  color:
                    activeTab === tab.id ? theme.white : theme.primaryMedium,
                }}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "purchase" ? (
              <motion.div
                key="purchase"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-3 gap-6"
              >
                {/* Packages */}
                <div className="lg:col-span-2">
                  <div className="mb-4">
                    <h2
                      className="text-lg font-bold"
                      style={{ color: theme.primary }}
                    >
                      Select a Package
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: theme.primaryMedium }}
                    >
                      Choose the package that suits your needs
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {packages.map((pkg, i) => (
                      <CoinPackageCard
                        key={pkg.id}
                        pkg={pkg}
                        isSelected={selectedPackage?.id === pkg.id}
                        onSelect={setSelectedPackage}
                        isLoading={isProcessing}
                        index={i}
                      />
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <motion.div
                    className="rounded-2xl border p-5 sticky top-24"
                    style={{
                      backgroundColor: theme.white,
                      borderColor: theme.light,
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3
                      className="font-bold mb-4"
                      style={{ color: theme.primary }}
                    >
                      Order Summary
                    </h3>

                    {/* Test Mode Banner */}
                    {testMode && currentTransactionId && (
                      <TestModeBanner
                        onTestPurchase={handleTestPurchase}
                        isProcessing={isProcessing}
                        transactionId={currentTransactionId}
                      />
                    )}

                    {selectedPackage ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span style={{ color: theme.primaryMedium }}>
                            Package
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: theme.primary }}
                          >
                            {selectedPackage.coins.toLocaleString()} Coins
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span style={{ color: theme.primaryMedium }}>
                            Price
                          </span>
                          <span
                            className="line-through"
                            style={{ color: theme.primaryMedium }}
                          >
                            ₹{selectedPackage.originalPrice}
                          </span>
                        </div>

                        {selectedPackage.discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span style={{ color: theme.success }}>
                              Discount ({selectedPackage.discount}%)
                            </span>
                            <span
                              className="font-medium"
                              style={{ color: theme.success }}
                            >
                              -₹
                              {selectedPackage.originalPrice -
                                selectedPackage.price}
                            </span>
                          </div>
                        )}

                        <div
                          className="h-px my-2"
                          style={{ backgroundColor: theme.light }}
                        />

                        <div className="flex justify-between">
                          <span
                            className="font-bold"
                            style={{ color: theme.primary }}
                          >
                            Total
                          </span>
                          <span
                            className="text-xl font-bold"
                            style={{ color: theme.primary }}
                          >
                            ₹{selectedPackage.price}
                          </span>
                        </div>

                        <motion.button
                          onClick={handlePurchase}
                          disabled={
                            isProcessing || (testMode && currentTransactionId)
                          }
                          className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 disabled:opacity-50 mt-4"
                          style={{ backgroundColor: theme.primary }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : testMode && currentTransactionId ? (
                            <>
                              <Clock className="w-5 h-5" />
                              Complete Test Above
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              {testMode
                                ? "Create Test Order"
                                : `Pay ₹${selectedPackage.price}`}
                            </>
                          )}
                        </motion.button>

                        {/* Security Badge */}
                        <div className="flex items-center justify-center gap-2 pt-3">
                          <Shield
                            className="w-4 h-4"
                            style={{ color: theme.primaryMedium }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: theme.primaryMedium }}
                          >
                            {testMode ? "Test Mode" : "Secured by Razorpay"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Coins
                          className="w-12 h-12 mx-auto mb-3"
                          style={{ color: theme.light }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: theme.primaryMedium }}
                        >
                          Select a package to continue
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    backgroundColor: theme.white,
                    borderColor: theme.light,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold" style={{ color: theme.primary }}>
                      Transaction History
                    </h3>
                    <button
                      onClick={fetchData}
                      className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    >
                      <RefreshCw
                        className="w-4 h-4"
                        style={{ color: theme.primaryMedium }}
                      />
                    </button>
                  </div>

                  {transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((transaction, i) => (
                        <TransactionItem
                          key={transaction._id}
                          transaction={transaction}
                          index={i}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: theme.light }}
                      />
                      <p style={{ color: theme.primaryMedium }}>
                        No transactions yet
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{ color: theme.primarySoft }}
                      >
                        Your transaction history will appear here
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAQ Section */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: theme.primary }}
            >
              Frequently Asked Questions
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  q: "What can I use coins for?",
                  a: "Coins can be used to apply for gigs, boost your profile visibility, and access premium features.",
                },
                {
                  q: "Are purchases refundable?",
                  a: "Coin purchases are non-refundable. Contact support if you face any issues.",
                },
                {
                  q: "How fast do I receive coins?",
                  a: "Coins are credited instantly after successful payment verification.",
                },
                {
                  q: "Is my payment secure?",
                  a: "Yes! All payments are processed through Razorpay, a PCI-DSS compliant gateway.",
                },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  className="p-5 rounded-xl border"
                  style={{
                    backgroundColor: theme.white,
                    borderColor: theme.light,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <h3
                    className="font-semibold mb-2 text-sm"
                    style={{ color: theme.primary }}
                  >
                    {faq.q}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: theme.primaryMedium }}
                  >
                    {faq.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal
            isOpen={showSuccess}
            onClose={() => setShowSuccess(false)}
            coins={purchasedCoins}
            balance={userCoins}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PurchaseCoins;
