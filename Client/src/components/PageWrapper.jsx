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
};

const PageWrapper = ({ children, customTitle }) => {
  const location = useLocation();
  const title = customTitle || pageTitles[location.pathname] || "Page";

  useDocumentTitle(title);

  return <>{children}</>;
};

export default PageWrapper;
