// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import PageWrapper from "./components/PageWrapper";
import EnhancedPageWrapper from "./components/EnhancedPageWrapper";

// Pages
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Onbaording/Login";
import Profile from "./Pages/Profile";
import Home from "./Pages/Home";
import GlobalChat from "./Pages/GlobalChat";

// Auth Pages
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

// Configure axios base URL (adjust according to your backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Title resolver functions
const gigTitleResolver = async (params) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/gigs/${params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Make sure we have a valid title
    if (response.data && response.data.title) {
      return `${response.data.title} | Gig Details`;
    }
    return "Gig Details";
  } catch (error) {
    console.error("Error fetching gig:", error);
    return "Gig Details";
  }
};

const ticketTitleResolver = async (params) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_BASE_URL}/api/tickets/${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.title) {
      return `${response.data.title} | Ticket`;
    }
    return `Ticket #${params.id}`;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return `Ticket #${params.id}`;
  }
};

const userTitleResolver = async (params) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/users/${params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data && response.data.name) {
      return `${response.data.name} | Profile`;
    }
    return "User Profile";
  } catch (error) {
    console.error("Error fetching user:", error);
    return "User Profile";
  }
};

// Main App
const App = () => {
  return (
    <Router>
      {/* Show toast notifications */}
      <Toaster position="top-right" />

      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route
          path="/"
          element={
            <PageWrapper>
              <LandingPage />
            </PageWrapper>
          }
        />
        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />

        {/* === AUTH FLOW === */}
        <Route
          path="/signup"
          element={
            <PageWrapper>
              <SignupEmail />
            </PageWrapper>
          }
        />
        <Route
          path="/signup/otp"
          element={
            <PageWrapper>
              <OtpVerify />
            </PageWrapper>
          }
        />
        <Route
          path="/signup/onboard"
          element={
            <PageWrapper>
              <OnboardProfile />
            </PageWrapper>
          }
        />

        {/* Onboard alias route */}
        <Route
          path="/onboard"
          element={
            <PageWrapper>
              <OnboardProfile />
            </PageWrapper>
          }
        />

        {/* Google OAuth Callback */}
        <Route
          path="/auth/google/callback"
          element={
            <PageWrapper>
              <GoogleCallback />
            </PageWrapper>
          }
        />

        {/* === PROTECTED ROUTES === */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Home />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Profile />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-gig"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <CreateGig />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/gigs"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Gigs />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Dynamic route for Gig Details */}
        <Route
          path="/gigs/:id"
          element={
            <ProtectedRoute>
              <EnhancedPageWrapper
                titleResolver={gigTitleResolver}
                fallbackTitle="Gig Details"
              >
                <GigDetails />
              </EnhancedPageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Tickets />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Dynamic route for Ticket Details */}
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <EnhancedPageWrapper
                titleResolver={ticketTitleResolver}
                fallbackTitle="Ticket Details"
              >
                <Ticket />
              </EnhancedPageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Dynamic route for User Profile */}
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <EnhancedPageWrapper
                titleResolver={userTitleResolver}
                fallbackTitle="User Profile"
              >
                <UserProfile />
              </EnhancedPageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/global-chat"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <GlobalChat />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Fallback with PageWrapper */}
        <Route
          path="*"
          element={
            <PageWrapper customTitle="404 - Not Found">
              <Navigate to="/" replace />
            </PageWrapper>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
