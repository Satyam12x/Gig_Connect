import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const GOOGLE_AUTH_URL = `${API_BASE}/auth/google`;

const Signup = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Onboarding
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Both",
  });
  const [otp, setOtp] = useState("");
  const [onboarding, setOnboarding] = useState({
    profilePicture: null,
    skills: "",
    bio: "",
  });
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // === HANDLE GOOGLE TOKEN & FETCH USER ===
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
      setIsGoogleSignup(true);
      fetchGoogleUser(tokenFromUrl);
      navigate("/signup", { replace: true }); // Clean URL
    }
  }, [location, navigate]);

  const fetchGoogleUser = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/auth/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.authenticated) {
        const user = res.data.user;
        setGoogleUser(user);
        setFormData((prev) => ({
          ...prev,
          fullName: user.fullName,
          email: user.email,
          role: user.role || "Both",
        }));
        setPreview(user.profilePicture || "");
        toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);
        setStep(3); // Skip email & OTP
      }
    } catch (err) {
      toast.error("Failed to load user data");
      navigate("/login");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, formData);
      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        toast.success("Check your email for OTP");
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const currentToken = token || localStorage.getItem("token");

    if (!otp) {
      toast.error("Enter OTP");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/auth/verify-otp`,
        { otp },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      toast.success("Email verified!");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOnboarding({ ...onboarding, profilePicture: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const currentToken = token || localStorage.getItem("token");

    try {
      const formDataUpload = new FormData();
      if (onboarding.profilePicture) {
        formDataUpload.append("image", onboarding.profilePicture);
      }
      if (onboarding.bio) formDataUpload.append("bio", onboarding.bio);
      formDataUpload.append("role", formData.role);

      // Upload picture + update role/bio
      if (onboarding.profilePicture || onboarding.bio || formData.role) {
        await axios.post(`${API_BASE}/users/upload-profile`, formDataUpload, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Add skills
      if (onboarding.skills) {
        const skills = onboarding.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        for (const skill of skills) {
          await axios.post(
            `${API_BASE}/users/skills`,
            { skill },
            { headers: { Authorization: `Bearer ${currentToken}` } }
          );
        }
      }

      toast.success("Profile completed!");
      navigate("/home");
    } catch (err) {
      toast.error("Failed to save profile");
    }
    setLoading(false);
  };

  const handleSkipOnboarding = () => {
    navigate("/home");
  };

  const handleGoogleSignup = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-lg shadow-lg border border-blue-100">
        <div className="text-center">
          <h2
            className="text-3xl font-bold text-navyBlue font-sans"
            style={{ color: "#1A2A4F" }}
          >
            {isGoogleSignup
              ? `Hi ${googleUser?.fullName?.split(" ")[0] || ""}!`
              : "Join Gig Connect"}
          </h2>
          <p
            className="mt-2 text-navyBlueMedium font-sans"
            style={{ color: "#2A3A6F" }}
          >
            {step === 1 && !isGoogleSignup
              ? "Create your account"
              : step === 2
              ? "Verify your email"
              : "Complete your profile"}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-sans">
            {error}
          </div>
        )}

        {/* GOOGLE BUTTON */}
        {step === 1 && !isGoogleSignup && (
          <div className="mt-4">
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 font-sans"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.75c1.63 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-sm text-gray-500 font-sans">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          </div>
        )}

        {/* STEP 1: EMAIL SIGNUP */}
        {step === 1 && !isGoogleSignup && (
          <form onSubmit={handleSignup} className="space-y-6">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg pr-10"
                required
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
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="Seller">Seller (Post Work)</option>
              <option value="Buyer">Buyer (Seek Work)</option>
              <option value="Both">Both</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navyBlue text-white rounded-lg"
              style={{ backgroundColor: "#1A2A4F" }}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-center text-xl tracking-widest"
              maxLength="6"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navyBlue text-white rounded-lg"
              style={{ backgroundColor: "#1A2A4F" }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* STEP 3: FULL ONBOARDING */}
        {step === 3 && (
          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            {/* Role */}
            <div>
              <label
                className="block text-sm font-medium text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                I want to:
              </label>
              <div className="flex gap-4 mt-2">
                {["Seller", "Buyer", "Both"].map((r) => (
                  <label key={r} className="flex items-center">
                    <input
                      type="radio"
                      value={r}
                      checked={formData.role === r}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="mr-2"
                    />
                    <span>{r === "Both" ? "Both (Sell & Buy)" : r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <label
                className="block text-sm font-medium text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                Profile Picture{" "}
                {isGoogleSignup && preview ? "(Auto-filled)" : ""}
              </label>
              <div className="flex items-center gap-4 mt-2">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 border-2 border-dashed rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-navyBlue file:text-white"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label
                className="block text-sm font-medium text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={onboarding.skills}
                onChange={(e) =>
                  setOnboarding({ ...onboarding, skills: e.target.value })
                }
                placeholder="React, Node.js, Design"
                className="w-full px-3 py-2 border rounded-lg mt-1"
              />
            </div>

            {/* Bio */}
            <div>
              <label
                className="block text-sm font-medium text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                Bio
              </label>
              <textarea
                value={onboarding.bio}
                onChange={(e) =>
                  setOnboarding({ ...onboarding, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                rows="4"
                maxLength="500"
                className="w-full px-3 py-2 border rounded-lg mt-1"
              />
              <p className="text-xs text-right text-gray-500">
                {onboarding.bio.length}/500
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-navyBlue text-white rounded-lg"
                style={{ backgroundColor: "#1A2A4F" }}
              >
                {loading ? "Saving..." : "Complete Profile"}
              </button>
              <button
                type="button"
                onClick={handleSkipOnboarding}
                className="flex-1 py-3 border border-navyBlue text-navyBlue rounded-lg bg-white"
                style={{ color: "#1A2A4F", borderColor: "#1A2A4F" }}
              >
                Skip
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
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
