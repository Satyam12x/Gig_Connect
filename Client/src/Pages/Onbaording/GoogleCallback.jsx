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
      return navigate("/login");
    }

    localStorage.setItem("token", token);
    if (userId) localStorage.setItem("userId", userId);

    axios
      .get(`${API}/auth/check`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.user.onboarded) {
          navigate("/home", { replace: true });
        } else {
          navigate("/onboard", { replace: true });
        }
      })
      .catch(() => {
        navigate("/onboard", { replace: true });
      });
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting...
    </div>
  );
}
