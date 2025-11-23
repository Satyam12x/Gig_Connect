// src/components/EnhancedPageWrapper.jsx
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

const EnhancedPageWrapper = ({
  children,
  titleResolver,
  fallbackTitle = "Loading...",
}) => {
  const [dynamicTitle, setDynamicTitle] = useState(fallbackTitle);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const location = useLocation();

  useEffect(() => {
    const fetchTitle = async () => {
      if (titleResolver && typeof titleResolver === "function") {
        setIsLoading(true);
        try {
          const title = await titleResolver(params);
          // Make sure we got a valid title
          if (title && title !== "undefined") {
            setDynamicTitle(title);
          } else {
            setDynamicTitle(fallbackTitle);
          }
        } catch (error) {
          console.error("Error fetching title:", error);
          setDynamicTitle(fallbackTitle);
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no titleResolver, use fallback immediately
        setDynamicTitle(fallbackTitle);
        setIsLoading(false);
      }
    };

    fetchTitle();
  }, [params, location.pathname]); // Re-run when params or path changes

  // Use the dynamic title
  useDocumentTitle(dynamicTitle);

  return <>{children}</>;
};

export default EnhancedPageWrapper;
