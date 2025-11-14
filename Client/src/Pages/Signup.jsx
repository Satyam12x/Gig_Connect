// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const GOOGLE_AUTH_URL = `${API_BASE}/auth/google`;

const Signup = () => {
  // ────────────────────────────────────────
  // 1. State
  // ────────────────────────────────────────
  const [step, setStep] = useState(1); // 1: Form | 2: OTP | 3: Onboarding
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [token, setToken] = useState("");

  // Step-1 (Email signup)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Both",
  });

  // Step-2 (OTP)
  const [otp, setOtp] = useState("");

  // Step-3 (Onboarding)
  const [onboard, setOnboard] = useState({
    profilePicture: null,
    preview: "",
    skills: "",
    bio: "",
    college: "",
    socialLinks: { linkedin: "", github: "", instagram: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ────────────────────────────────────────
  // 2. Google token handling
  // ────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
      setIsGoogleSignup(true);
      fetchGoogleUser(tokenFromUrl);
      navigate("/signup", { replace: true });
    }
  }, [location, navigate]);

  const fetchGoogleUser = async (tok) => {
    try {
      const { data } = await axios.get(`${API_BASE}/auth/check`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (data.authenticated) {
        const u = data.user;
        setGoogleUser(u);
        setFormData((prev) => ({
          ...prev,
          fullName: u.fullName,
          email: u.email,
          role: u.role || "Both",
        }));
        setOnboard((prev) => ({
          ...prev,
          preview: u.profilePicture || "",
        }));
        toast.success(`Welcome, ${u.fullName.split(" ")[0]}!`);
        setStep(3); // jump to onboarding
      }
    } catch {
      toast.error("Failed to load Google profile");
      navigate("/login");
      console.log("Han bhai yahi maa chudri hai iski")
    }
  };

  // ────────────────────────────────────────
  // 3. Helpers
  // ────────────────────────────────────────
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOnboard((prev) => ({
        ...prev,
        profilePicture: file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  // ────────────────────────────────────────
  // 4. Step 1 – Email signup
  // ────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/signup`, formData);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      toast.success("Check your email for OTP");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────
  // 5. Step 2 – OTP verification
  // ────────────────────────────────────────
  const handleOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const curToken = token || localStorage.getItem("token");
    try {
      await axios.post(
        `${API_BASE}/auth/verify-otp`,
        { otp },
        { headers: { Authorization: `Bearer ${curToken}` } }
      );
      toast.success("Email verified!");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────
  // 6. Step 3 – Full Onboarding (single API call)
  // ────────────────────────────────────────
  const handleOnboard = async (e) => {
    e.preventDefault();
    setLoading(true);
    const curToken = token || localStorage.getItem("token");

    const payload = new FormData();
    payload.append("role", formData.role);
    if (onboard.profilePicture) payload.append("image", onboard.profilePicture);
    if (onboard.bio) payload.append("bio", onboard.bio);
    if (onboard.college) payload.append("college", onboard.college);
    if (onboard.skills) {
      const skillsArr = onboard.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      payload.append("skills", JSON.stringify(skillsArr));
    }
    if (
      onboard.socialLinks.linkedin ||
      onboard.socialLinks.github ||
      onboard.socialLinks.instagram
    ) {
      payload.append("socialLinks", JSON.stringify(onboard.socialLinks));
    }

    try {
      await axios.post(`${API_BASE}/users/onboard`, payload, {
        headers: {
          Authorization: `Bearer ${curToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile completed!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.error || "Onboarding failed");
    } finally {
      setLoading(false);
    }
  };

  const skipOnboard = () => navigate("/home");

  // ────────────────────────────────────────
  // 7. Render
  // ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-lg shadow-lg border border-blue-100">
        {/* Header */}
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

        {/* ──────── STEP 1 ──────── */}
        {step === 1 && !isGoogleSignup && (
          <>
            {/* Google button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
                <div className="flex-1 border-t border-gray-300" />
                <span className="px-3 text-sm text-gray-500">or</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleSignup} className="space-y-5">
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
                {loading ? "Signing up…" : "Sign up"}
              </button>
            </form>
          </>
        )}

        {/* ──────── STEP 2 ──────── */}
        {step === 2 && (
          <form onSubmit={handleOtp} className="space-y-6">
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
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
          </form>
        )}

        {/* ──────── STEP 3 – ONBOARDING ──────── */}
        {step === 3 && (
          <form onSubmit={handleOnboard} className="space-y-6">
            {/* Role */}
            <div>
              <label
                className="block text-sm font-medium text-navyBlue"
                style={{ color: "#1A2A4F" }}
              >
                I want to:
              </label>
              <div className="flex gap-4 mt-2">
                {["Seller", "Buyer", "Both"].map((r) => (
                  <label key={r} className="flex items-center">
                    <input
                      type="radio"
                      name="role"
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

            {/* Profile picture */}
            <div>
              <label
                className="block text-sm font-medium text-navyBlue"
                style={{ color: "#1A2A4F" }}
              >
                Profile Picture{" "}
                {isGoogleSignup && onboard.preview && "(from Google)"}
              </label>
              <div className="flex items-center gap-4 mt-2">
                {onboard.preview ? (
                  <img
                    src={onboard.preview}
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
                  onChange={handleImage}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-navyBlue file:text-white"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label
                className="block text-sm font-medium text-navyBlue"
                style={{ color: "#1A2A4F" }}
              >
                Skills (comma-separated)
              </label>
              <input
                type="text"
                placeholder="React, Node.js, UI/UX"
                value={onboard.skills}
                onChange={(e) =>
                  setOnboard({ ...onboard, skills: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg mt-1"
              />
            </div>

            {/* College */}
            <div>
              <label
                className="block text-sm font-medium text-navyBlue"
                style={{ color: "#1A2A4F" }}
              >
                College / University (optional)
              </label>
              <input
                type="text"
                placeholder="MIT, Stanford..."
                value={onboard.college}
                onChange={(e) =>
                  setOnboard({ ...onboard, college: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg mt-1"
              />
            </div>

            {/* Bio */}
            <div>
              <label
                className="block text-sm font-medium text-navyBlue"
                style={{ color: "#1A2A4F" }}
              >
                Bio
              </label>
              <textarea
                rows="4"
                maxLength="500"
                placeholder="Tell us about yourself..."
                value={onboard.bio}
                onChange={(e) =>
                  setOnboard({ ...onboard, bio: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg mt-1"
              />
              <p className="text-xs text-right text-gray-500">
                {onboard.bio.length}/500
              </p>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="url"
                placeholder="LinkedIn"
                value={onboard.socialLinks.linkedin}
                onChange={(e) =>
                  setOnboard({
                    ...onboard,
                    socialLinks: {
                      ...onboard.socialLinks,
                      linkedin: e.target.value,
                    },
                  })
                }
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="url"
                placeholder="GitHub"
                value={onboard.socialLinks.github}
                onChange={(e) =>
                  setOnboard({
                    ...onboard,
                    socialLinks: {
                      ...onboard.socialLinks,
                      github: e.target.value,
                    },
                  })
                }
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="url"
                placeholder="Instagram"
                value={onboard.socialLinks.instagram}
                onChange={(e) =>
                  setOnboard({
                    ...onboard,
                    socialLinks: {
                      ...onboard.socialLinks,
                      instagram: e.target.value,
                    },
                  })
                }
                className="px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-navyBlue text-white rounded-lg"
                style={{ backgroundColor: "#1A2A4F" }}
              >
                {loading ? "Saving…" : "Complete Profile"}
              </button>
              <button
                type="button"
                onClick={skipOnboard}
                className="flex-1 py-3 border border-navyBlue text-navyBlue rounded-lg bg-white"
                style={{ color: "#1A2A4F", borderColor: "#1A2A4F" }}
              >
                Skip
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
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
