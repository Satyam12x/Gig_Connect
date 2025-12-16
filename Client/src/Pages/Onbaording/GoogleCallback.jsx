import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../constants/api";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const onboarded = params.get("onboarded");

    if (!token) {
      setStatus("error");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
      return;
    }

    localStorage.setItem("token", token);
    if (userId) localStorage.setItem("userId", userId);

    if (onboarded === "false" || onboarded === false) {
      setStatus("onboarding");
      setTimeout(() => navigate("/signup/onboard", { replace: true }), 1500);
    } else if (onboarded === "true" || onboarded === true) {
      setStatus("success");
      setTimeout(() => navigate("/home", { replace: true }), 1500);
    } else {
      axios
        .get(
          `${
            import.meta.env.VITE_API_BASE || API_BASE
          }/auth/check`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => {
          if (res.data.authenticated) {
            if (res.data.user?.onboarded) {
              setStatus("success");
              setTimeout(() => navigate("/home", { replace: true }), 1500);
            } else {
              setStatus("onboarding");
              setTimeout(
                () => navigate("/signup/onboard", { replace: true }),
                1500
              );
            }
          }
        })
        .catch(() => {
          setStatus("onboarding");
          setTimeout(
            () => navigate("/signup/onboard", { replace: true }),
            1500
          );
        });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-bounce { animation: bounce 1s ease-in-out infinite; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="text-center animate-fade-in relative z-10">
        <div className="mb-8">
          {status === "processing" && (
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}

          {status === "success" && (
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}

          {status === "onboarding" && (
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}

          {status === "error" && (
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center animate-bounce">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {status === "processing" && "Completing authentication..."}
          {status === "success" && "Welcome back!"}
          {status === "onboarding" && "Setting up your profile..."}
          {status === "error" && "Authentication failed"}
        </h2>

        <p className="text-gray-600">
          {status === "processing" && "Please wait a moment"}
          {status === "success" && "Redirecting to your dashboard"}
          {status === "onboarding" && "Let's complete your profile"}
          {status === "error" && "Redirecting to login"}
        </p>

        <div className="flex justify-center gap-1.5 mt-6">
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
