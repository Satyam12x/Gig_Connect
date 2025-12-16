import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Build optimizations
  build: {
    target: "esnext",
    rollupOptions: {},
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  
  // Development server
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
    proxy: {
      // Proxy API requests to backend during development. Set BACKEND_URL in .env
      "/api": {
        // Prefer VITE_API_URL (available during build if set). Fallback to BACKEND_URL or localhost.
        target: process.env.VITE_API_URL || process.env.BACKEND_URL || "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  
  // Preview server (for testing production build)
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },
  
  // Performance optimizations
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "framer-motion"],
  },
  
  // SSR options
  ssr: {
    noExternal: ['react-router-dom'],
  },
});
