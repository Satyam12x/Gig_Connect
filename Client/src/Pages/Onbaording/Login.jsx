import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import { API_BASE } from "../../constants/api";

const Login = () => {
  useDocumentTitle("Sign In to Your Account");

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const submitLockRef = useRef(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "account_exists") {
      toast.error("Account already exists! Please login instead.");
    } else if (errorParam === "no_account") {
      toast.error("No account found. Please sign up first.");
    } else if (errorParam === "not_onboarded") {
      toast.error("Please complete your profile setup first.");
    } else if (errorParam === "auth_failed") {
      toast.error("Google authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, formData);

      // Store token only
      localStorage.setItem("token", res.data.token);
      // Removed: localStorage.setItem("userId", ...) → not needed

      toast.success("Welcome back!");

      // Smart redirect based on onboarding status
      if (res.data.requiresOnboarding) {
        navigate("/onboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      const msg =
        err.response?.data?.error || "Login failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      submitLockRef.current = false;
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google/login`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Your beautiful styles remain 100% unchanged */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes bounce { 0%, 60%, 100% { opacity: 0.5; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-10px); } }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        .animate-slideIn { animation: slideIn 0.5s ease-out; }
        .form-container { animation: fadeInUp 0.6s ease-out; }
        .form-input { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
        .form-input:focus { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(26, 42, 79, 0.12); }
        .submit-btn { transition: all 0.3s ease; position: relative; overflow: hidden; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(26, 42, 79, 0.25); }
        .loading-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: white; margin: 0 4px; animation: bounce 1.4s infinite; }
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        .error-message { animation: slideIn 0.3s ease-out; }
        .input-wrapper::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, #1A2A4F, #2A3A6F); transform: scaleX(0); transition: transform 0.3s ease; transform-origin: left; }
        .input-wrapper:focus-within::after { transform: scaleX(1); }
        .sign-up-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: #1A2A4F; transform: scaleX(0); transition: transform 0.3s ease; }
        .sign-up-link:hover::after { transform: scaleX(1); }
      `}</style>

      <div className="w-full max-w-md">
        <div className="form-container bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-100">
          <div className="text-center mb-8">
            <h2
              className="text-4xl font-bold text-slate-900 mb-2"
              style={{ color: "#1A2A4F" }}
            >
              Welcome Back
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Sign in to continue posting gigs or freelancing
            </p>
          </div>

          {error && (
            <div className="error-message mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 mb-6 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all google-btn"
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

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-500 font-medium">
              or sign in with email
            </span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all form-input"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#1A2A4F] to-[#0F1729] text-white font-bold rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 submit-btn"
            >
              {isLoading ? (
                <>
                  Signing in <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </>
              ) : (
                <>Sign in to Gig Connect</>
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-slate-600 text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-[#1A2A4F] hover:underline"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-8">
          Your credentials are secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default Login;
