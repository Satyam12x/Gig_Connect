// Centralized API constants for the client app
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = import.meta.env.VITE_API_BASE || `${API_URL.replace(/\/$/, '')}/api`;

export { API_URL, API_BASE };
