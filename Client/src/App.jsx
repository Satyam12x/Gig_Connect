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

// === PAGES ===
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Onbaording/Login";
import Profile from "./Pages/Profile";
import Home from "./Pages/Home";
import GlobalChat from "./Pages/GlobalChat";

// === AUTH FLOW ===
import SignupEmail from "./Pages/Onbaording/SignupEmail";
import OtpVerify from "./Pages/Onbaording/OtpVerify";
import OnboardProfile from "./Pages/Onbaording/OnboardProfile";
import GoogleCallback from "./Pages/Onbaording/GoogleCallback";

// === COMPONENTS ===
import CreateGig from "./components/CreateGig";
import Gigs from "./components/Gigs";
import GigDetails from "./components/GigDetails";
import Ticket from "./components/Ticket";
import Tickets from "./components/Tickets";
import UserProfile from "./components/UserProfile";

// === API BASE ===
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// === PROTECTED ROUTE WITH ONBOARDING CHECK ===
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: Check onboarding status via /auth/check
  // But for now, let backend redirect if needed
  return children;
};

// === GIG TITLE RESOLVER (for dynamic page titles) ===
const gigTitleResolver = async (params) => {
  try {
    const response = await axios.get(`${API_BASE}/gigs/${params.id}`);
    return `${response.data.title} - Gig Connect`;
  } catch {
    return "Gig Details";
  }
};

// === MAIN APP ===
const App = () => {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1A2A4F",
            color: "#fff",
            fontWeight: "500",
          },
        }}
      />

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
            <ProtectedRoute>
              <PageWrapper>
                <OtpVerify />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/signup/onboard"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <OnboardProfile />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Alias for onboarding */}
        <Route
          path="/onboard"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <OnboardProfile />
              </PageWrapper>
            </ProtectedRoute>
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

        {/* Dynamic Gig Page with Title */}
        <Route
          path="/gigs/:id"
          element={
            <ProtectedRoute>
              <EnhancedPageWrapper titleResolver={gigTitleResolver}>
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

        {/* === 404 FALLBACK === */}
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
