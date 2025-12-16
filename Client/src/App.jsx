import React, { Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import PageWrapper from "./components/PageWrapper";
import EnhancedPageWrapper from "./components/EnhancedPageWrapper";

// Lazy Loaded Pages
const LandingPage = lazy(() => import("./Pages/LandingPage"));
const Login = lazy(() => import("./Pages/Onbaording/Login"));
const Profile = lazy(() => import("./Pages/Profile"));
const Home = lazy(() => import("./Pages/Home"));
const GlobalChat = lazy(() => import("./Pages/GlobalChat"));
const PurchaseCoins = lazy(() => import("./Pages/PurchaseCoins"));
const Spotlight = lazy(() => import("./Pages/Spotlight"));
const Settings = lazy(() => import("./Pages/Settings"));

// Lazy Loaded Auth Pages
const SignupEmail = lazy(() => import("./Pages/Onbaording/SignupEmail"));
const OtpVerify = lazy(() => import("./Pages/Onbaording/OtpVerify"));
const OnboardProfile = lazy(() => import("./Pages/Onbaording/OnboardProfile"));
const GoogleCallback = lazy(() => import("./Pages/Onbaording/GoogleCallback"));

// Lazy Loaded Components acting as Pages
const CreateGig = lazy(() => import("./components/CreateGig"));
const Gigs = lazy(() => import("./components/Gigs"));
const GigDetails = lazy(() => import("./components/GigDetails"));
const Ticket = lazy(() => import("./components/Ticket"));
const Tickets = lazy(() => import("./components/Tickets"));
const UserProfile = lazy(() => import("./components/UserProfile"));

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingFallback />;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// ... Title Resolvers ...
const gigTitleResolver = async (params) => {
  try {
    if (typeof window === 'undefined') return "Gig Details";
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/gigs/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data && response.data.title) {
      return `${response.data.title} | Gig Details`;
    }
    return "Gig Details";
  } catch (error) {
    return "Gig Details";
  }
};

const ticketTitleResolver = async (params) => {
  try {
    if (typeof window === 'undefined') return `Ticket #${params.id}`;
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_BASE_URL}/api/tickets/${params.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.data && response.data.title) {
      return `${response.data.title} | Ticket`;
    }
    return `Ticket #${params.id}`;
  } catch (error) {
    return `Ticket #${params.id}`;
  }
};

const userTitleResolver = async (params) => {
  try {
    if (typeof window === 'undefined') return "User Profile";
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/users/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data && response.data.name) {
      return `${response.data.name} | Profile`;
    }
    return "User Profile";
  } catch (error) {
    return "User Profile";
  }
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
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

          {/* Auth Flow */}
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
          <Route
            path="/onboard"
            element={
              <PageWrapper>
                <OnboardProfile />
              </PageWrapper>
            }
          />
          <Route
            path="/auth/google/callback"
            element={
              <PageWrapper>
                <GoogleCallback />
              </PageWrapper>
            }
          />

          {/* Protected Routes */}
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
            path="/spotlight"
            element={
              <ProtectedRoute>
                <PageWrapper customTitle="Spotlight | Gig Connect">
                  <Spotlight />
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
            path="/settings"
            element={
              <ProtectedRoute>
                <PageWrapper customTitle="Settings | Gig Connect">
                  <Settings />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          {/* Purchase Coins Page */}
          <Route
            path="/purchase-coins"
            element={
              <ProtectedRoute>
                <PageWrapper customTitle="Purchase Coins | Gig Connect">
                  <PurchaseCoins />
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

          <Route
            path="*"
            element={
              <PageWrapper customTitle="404 - Not Found">
                <Navigate to="/" replace />
              </PageWrapper>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
