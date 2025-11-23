import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

const pageTitles = {
  "/": "Get started",
  "/home": "Home",
  "/onboarding": "Complete Your Profile",
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/projects": "Projects",
  "/messages": "Messages",
  "/settings": "Settings",
// src/components/PageWrapper.jsx
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

const pageTitles = {
  // Public routes
  "/": "Welcome",
  "/login": "Login",
  "/signup": "Sign Up",
  "/signup/otp": "Verify OTP",
  "/signup/onboard": "Complete Your Profile",
  "/onboard": "Complete Your Profile",
  "/auth/google/callback": "Authenticating...",

  // Protected routes
  "/home": "Home",
  "/profile": "My Profile",
  "/create-gig": "Create New Gig",
  "/gigs": "Browse Gigs",
  "/tickets": "Support Tickets",
  "/global-chat": "Global Chat",
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/messages": "Messages",
  "/settings": "Settings",
};

// Dynamic route patterns
const dynamicTitles = {
  "/gigs/": "Gig Details",
  "/tickets/": "Ticket Details",
  "/users/": "User Profile",
};

const PageWrapper = ({ children, customTitle, dynamicTitle }) => {
  const location = useLocation();
  const title = customTitle || pageTitles[location.pathname] || "Page";

  const params = useParams();

  // Function to get the appropriate title
  const getPageTitle = () => {
    // If customTitle is provided, use it
    if (customTitle) return customTitle;

    // If dynamicTitle is provided (for dynamic routes), use it
    if (dynamicTitle) {
      // Replace placeholders in dynamic title with actual params
      let title = dynamicTitle;
      Object.keys(params).forEach((key) => {
        title = title.replace(`:${key}`, params[key]);
      });
      return title;
    }

    // Check for exact match in static titles
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }

    // Check for dynamic route patterns
    for (const [pattern, title] of Object.entries(dynamicTitles)) {
      if (location.pathname.startsWith(pattern)) {
        return title;
      }
    }

    // Default fallback
    return "Page";
  };

  const title = getPageTitle();
  useDocumentTitle(title);

  return <>{children}</>;
};

export default PageWrapper;
