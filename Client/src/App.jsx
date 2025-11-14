// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Onbaording/Login";
import Profile from "./Pages/Profile";
import Home from "./Pages/Home";
import GlobalChat from "./Pages/GlobalChat";

// Auth Pages (NEW)
import SignupEmail from "./Pages/Onbaording/SignupEmail";
import OtpVerify from "./Pages/Onbaording/OtpVerify";
import OnboardProfile from "./Pages/Onbaording/OnboardProfile";
import GoogleCallback from "./Pages/Onbaording/GoogleCallback";

// Components
import CreateGig from "./components/CreateGig";
import Gigs from "./components/Gigs";
import GigDetails from "./components/GigDetails";
import Ticket from "./components/Ticket";
import Tickets from "./components/Tickets";
import UserProfile from "./components/UserProfile";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Google OAuth Token Extractor (Legacy fallback)
const TokenExtractor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/signup/onboard", { replace: true });
    }

    setLoading(false);
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return null;
};

// Main App
const App = () => {
  return (
    <Router>
      {/* Show toast notifications */}
      <Toaster position="top-right" />

      {/* Extract token from old ?token= URLs (optional fallback) */}
      <TokenExtractor />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* === NEW AUTH FLOW === */}
        <Route path="/signup" element={<SignupEmail />} />
        <Route path="/signup/otp" element={<OtpVerify />} />
        <Route path="/signup/onboard" element={<OnboardProfile />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        {/* === PROTECTED ROUTES === */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-gig"
          element={
            <ProtectedRoute>
              <CreateGig />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gigs"
          element={
            <ProtectedRoute>
              <Gigs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gigs/:id"
          element={
            <ProtectedRoute>
              <GigDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <Ticket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/global-chat"
          element={
            <ProtectedRoute>
              <GlobalChat />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
