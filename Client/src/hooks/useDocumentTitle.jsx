import { useEffect } from "react";

const useDocumentTitle = (title) => {
  useEffect(() => {
    const baseTitle = "Gig Connect";
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    return () => {
      document.title = baseTitle;
    };
  }, [title]);
};

export default useDocumentTitle;
