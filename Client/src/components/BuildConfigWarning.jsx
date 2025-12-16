import React from "react";
import { API_URL, API_BASE } from "../constants/api";

export default function BuildConfigWarning() {
  if (typeof window === "undefined") return null;

  const usingLocalhost = API_URL.includes("localhost");
  const usingRelative = API_BASE.startsWith("/");

  if (!usingLocalhost && !usingRelative) return null;

  return (
    <div style={{ background: "#fff4f4", color: "#7f1d1d", padding: "8px 12px", textAlign: "center", fontSize: 13 }}>
      Warning: frontend built with fallback API configuration.
      <span style={{ display: "block", marginTop: 6 }}>
        API_URL: {API_URL} — API_BASE: {API_BASE}
      </span>
      <span style={{ display: "block", marginTop: 6 }}>
        Fix: set <strong>VITE_API_URL</strong> and <strong>VITE_API_BASE</strong> in your hosting build environment and redeploy.
      </span>
    </div>
  );
}
