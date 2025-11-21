import { useEffect } from "react";

const useDocumentTitle = (title) => {
  useEffect(() => {
    const baseTitle = "Gig Connect";
    document.title = title ? `${title} | Gig Connect` : baseTitle;
  }, [title]);
};

export default useDocumentTitle;
