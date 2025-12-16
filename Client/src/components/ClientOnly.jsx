import React, { useEffect, useState } from "react";

// Renders children only on the client after mount. Useful to keep
// heavy client-only libraries out of the server bundle.
const ClientOnly = ({ children, fallback = null }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback;
  return <>{children}</>;
};

export default ClientOnly;
