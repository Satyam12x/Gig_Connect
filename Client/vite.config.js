import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Build optimizations
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "animation-vendor": ["framer-motion"],
          "icons": ["lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  
  // Development server
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
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
});
