// src/pages/auth/GoogleCallback.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const onboarded = params.get("onboarded");

    if (!token) {
      toast.error("Google authentication failed");
      return navigate("/login", { replace: true });
    }

    // Save token and userId
    localStorage.setItem("token", token);
    if (userId) localStorage.setItem("userId", userId);

    // Check if user needs onboarding
    if (onboarded === "false") {
      toast.success("Welcome! Please complete your profile.");
      navigate("/onboard", { replace: true });
    } else {
      toast.success("Welcome back!");
      navigate("/home", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
