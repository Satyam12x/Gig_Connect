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
    if (!token) {
      toast.error("Google login failed");
      return navigate("/login");
    }

    localStorage.setItem("token", token);
    toast.success("Google login successful!");
    navigate("/signup/onboard");
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting...
    </div>
  );
}
