import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const Signup = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Profile Picture
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Both", // Default role
  });
  const [otp, setOtp] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setError("Please fill in all required fields.");
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, formData);
      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        console.log("Signup token:", res.data.token); // Debug
        toast.success("Signup successful. Check your email for OTP.");
        setStep(2); // Move to OTP verification
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Signup failed";
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const currentToken = token || localStorage.getItem("token");
    console.log("OTP submit token:", currentToken); // Debug
    if (!currentToken) {
      setError("No token found. Please sign up again.");
      toast.error("No token found. Please sign up again.");
      setLoading(false);
      return;
    }
    if (!otp) {
      setError("Please enter the OTP.");
      toast.error("Please enter the OTP.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/auth/verify-otp`,
        { otp },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("OTP verified. Please add your profile picture.");
        setStep(3); // Move to profile picture step
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "OTP verification failed";
      setError(errorMsg);
      toast.error(errorMsg);
      console.log("OTP error:", err.response?.data); // Debug
    }
    setLoading(false);
  };

  const handleProfileUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const currentToken = token || localStorage.getItem("token");
    console.log("Profile upload token:", currentToken); // Debug
    if (!currentToken) {
      setError("No token found. Please sign up again.");
      toast.error("No token found. Please sign up again.");
      setLoading(false);
      return;
    }
    if (!profilePicture) {
      setError("Please select a profile picture.");
      toast.error("Please select a profile picture.");
      setLoading(false);
      return;
    }
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", profilePicture);
      const res = await axios.post(
        `${API_BASE}/users/upload-profile`,
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );
      if (res.data.success) {
        setSuccess(true);
        toast.success("Profile picture uploaded! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Upload failed";
      setError(errorMsg);
      toast.error(errorMsg);
      console.log("Upload error:", err.response?.data); // Debug
    }
    setLoading(false);
  };

  const handleSkipProfile = async () => {
    setLoading(true);
    setError("");
    const currentToken = token || localStorage.getItem("token");
    console.log("Skip profile token:", currentToken); // Debug
    if (!currentToken) {
      setError("No token found. Please sign up again.");
      toast.error("No token found. Please sign up again.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/users/skip-profile`,
        {},
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
      if (res.data.success) {
        setSuccess(true);
        toast.success("Profile setup complete! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Skip failed";
      setError(errorMsg);
      toast.error(errorMsg);
      console.log("Skip error:", err.response?.data); // Debug
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg border border-blue-100 text-center">
          <h2
            className="text-3xl font-bold text-navyBlue font-sans"
            style={{ color: "#1A2A4F" }}
          >
            Welcome to Gig Connect!
          </h2>
          <p
            className="text-navyBlueMedium font-sans"
            style={{ color: "#2A3A6F" }}
          >
            Your profile has been created successfully.
          </p>
          {profilePicture && (
            <img
              src={URL.createObjectURL(profilePicture)}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto"
            />
          )}
          <p className="text-navyBlue font-sans" style={{ color: "#1A2A4F" }}>
            Redirecting to landing page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg border border-blue-100">
        <div className="text-center">
          <h2
            className="text-3xl font-bold text-navyBlue font-sans"
            style={{ color: "#1A2A4F" }}
          >
            Join Gig Connect
          </h2>
          <p
            className="mt-2 text-navyBlueMedium font-sans"
            style={{ color: "#2A3A6F" }}
          >
            {step === 1
              ? "Create your account"
              : step === 2
              ? "Verify your email with OTP"
              : "Add your profile picture"}
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-sans">
            {error}
          </div>
        )}
        {step === 1 ? (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-navyBlue focus:border-navyBlue sm:text-sm font-sans"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-navyBlue focus:border-navyBlue sm:text-sm font-sans"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-navyBlue focus:border-navyBlue sm:text-sm font-sans"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-navyBlueLight"
                  style={{ color: "#3A4A7F" }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-navyBlue focus:border-navyBlue sm:text-sm font-sans"
              >
                <option value="Seller">Seller (Post Work)</option>
                <option value="Buyer">Buyer (Seek Work)</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navyBlue hover:bg-navyBlueLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navyBlue font-sans"
                style={{ backgroundColor: "#1A2A4F" }}
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </div>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                OTP (Check your email)
              </label>
              <input
                type="text"
                name="otp"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-navyBlue focus:border-navyBlue sm:text-sm font-sans"
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navyBlue hover:bg-navyBlueLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navyBlue font-sans"
                style={{ backgroundColor: "#1A2A4F" }}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleProfileUpload} className="space-y-6">
            <div>
              <label
                htmlFor="profilePicture"
                className="block text-sm font-medium text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                Profile Picture (Optional)
              </label>
              <input
                type="file"
                name="profilePicture"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-navyBlue file:text-white hover:file:bg-navyBlueLight font-sans"
              />
            </div>
            {profilePicture && (
              <img
                src={URL.createObjectURL(profilePicture)}
                alt="Preview"
                className="w-32 h-32 rounded-full mx-auto"
              />
            )}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || !profilePicture}
                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navyBlue hover:bg-navyBlueLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navyBlue font-sans"
                style={{ backgroundColor: "#1A2A4F" }}
              >
                {loading ? "Uploading..." : "Upload and Continue"}
              </button>
              <button
                type="button"
                onClick={handleSkipProfile}
                disabled={loading}
                className="flex-1 flex justify-center py-3 px-4 border border-navyBlue rounded-lg shadow-sm text-sm font-medium text-navyBlue bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navyBlue font-sans"
                style={{ color: "#1A2A4F", borderColor: "#1A2A4F" }}
              >
                {loading ? "Processing..." : "Skip"}
              </button>
            </div>
          </form>
        )}
        <div className="text-center">
          <Link
            to="/login"
            className="text-navyBlue hover:text-navyBlueLight font-sans"
            style={{ color: "#1A2A4F" }}
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
