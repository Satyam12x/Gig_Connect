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

    console.log("Google Callback params:", {
      token: !!token,
      userId,
      onboarded,
    });

    if (!token) {
      toast.error("Google authentication failed");
      return navigate("/login", { replace: true });
    }

    // Save token and userId
    localStorage.setItem("token", token);
    if (userId) localStorage.setItem("userId", userId);

    // IMPORTANT: Check onboarding status - use /signup/onboard to match your routes
    if (onboarded === "false" || onboarded === false) {
      console.log("User needs onboarding, redirecting to /signup/onboard");
      toast.success("Welcome! Please complete your profile.");
      setTimeout(() => {
        navigate("/signup/onboard", { replace: true });
      }, 100);
    } else if (onboarded === "true" || onboarded === true) {
      console.log("User onboarded, redirecting to /home");
      toast.success("Welcome back!");
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 100);
    } else {
      // Fallback: check with API
      console.log("Onboarded status unclear, checking with API");
      axios
        .get(
          `${
            import.meta.env.VITE_API_BASE || "http://localhost:5000/api"
          }/auth/check`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => {
          if (res.data.authenticated) {
            if (res.data.user?.onboarded) {
              navigate("/home", { replace: true });
            } else {
              navigate("/signup/onboard", { replace: true });
            }
          }
        })
        .catch((err) => {
          console.error("Auth check failed:", err);
          navigate("/signup/onboard", { replace: true });
        });
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
