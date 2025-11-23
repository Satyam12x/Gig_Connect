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
import axios from 'axios';
import PageWrapper from "./components/PageWrapper";

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
import EnhancedPageWrapper from "./components/EnhancedPageWrapper";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
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

        {/* Dynamic route with custom title */}
        <Route
          path="/gigs/:id"
          element={
            <ProtectedRoute>
              <EnhancedPageWrapper 
        titleResolver={async (params) => {
          try {
            const response = await axios.get(`/api/gigs/${params.id}`);
            return `${response.data.title} - Gig`;
          } catch {
            return 'Gig Details';
          }
        }}
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

        {/* Dynamic route with custom title */}
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <PageWrapper dynamicTitle="Ticket #:id">
                <Ticket />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Dynamic route with custom title */}
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <PageWrapper dynamicTitle="User Profile">
                <UserProfile />
              </PageWrapper>
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
