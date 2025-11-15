// src/pages/auth/GoogleCallback.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (!token) {
      toast.error("Google login failed");
      return navigate("/login", { replace: true });
    }

    // Save token immediately
    localStorage.setItem("token", token);
    if (userId) localStorage.setItem("userId", userId);

    // Always call /auth/check to get user state
    axios
      .get(`${API}/auth/check`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const onboarded = res.data.user?.onboarded ?? false;
        if (onboarded) {
          navigate("/home", { replace: true });
        } else {
          navigate("/onboard", { replace: true }); // New user → onboard
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        toast.error("Session expired. Please try again.");
        navigate("/login", { replace: true });
      });
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navyBlue mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
