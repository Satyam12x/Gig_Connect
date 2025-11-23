import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function SignupEmail() {
  useDocumentTitle("Create Your Gig Connect Account");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Both", // Backend accepts: "Provider", "Freelancer", "Both"
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "account_exists") {
      toast.error(
        "This Google account is already registered. Please login instead."
      );
    }
  }, [searchParams]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/signup`, form);
      localStorage.setItem("token", data.token);
      toast.success("Account created! Check your email for OTP");
      navigate("/signup/otp");
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API}/auth/google/signup`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <h2
          className="text-3xl font-bold text-center mb-2"
          style={{ color: "#1A2A4F" }}
        >
          Create Your Account
        </h2>
        <p className="text-center text-gray-600 text-sm mb-8">
          Join Gig Connect – post gigs or freelance with ease
        </p>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all font-medium"
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
          <span className="px-4 text-sm text-gray-500 font-medium">
            or sign up with email
          </span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        <form onSubmit={submit} className="space-y-5">
          <input
            required
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <input
            required
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <div className="relative">
            <input
              required
              type={showPwd ? "text" : "password"}
              name="password"
              placeholder="Create Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
            >
              {showPwd ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          {/* Updated Role Options – Match Backend Exactly */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="Both">Both – Post gigs & Freelance</option>
            <option value="Provider">Provider – I want to post gigs</option>
            <option value="Freelancer">
              Freelancer – I want to work on gigs
            </option>
          </select>

          <button
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#1A2A4F] to-[#0F1729] text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold hover:underline"
            style={{ color: "#1A2A4F" }}
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
