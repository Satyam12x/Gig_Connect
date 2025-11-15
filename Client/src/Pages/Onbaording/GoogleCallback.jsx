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
    if (!token) {
      toast.error("Google login failed");
      return navigate("/login");
    }
    localStorage.setItem("token", token);
    if (userId) localStorage.setItem("userId", userId);
    toast.success("Google login successful!");
    navigate("/signup/onboard", { replace: true });
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting...
    </div>
  );
}
