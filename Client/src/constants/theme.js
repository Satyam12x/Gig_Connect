// Centralized theme configuration
export const theme = {
  // Primary Colors
  primary: "#1A2A4F",
  primaryLight: "#2A3A6F",
  primaryMedium: "#3A4A7F",
  primarySoft: "#4A5A8F",
  accent: "#5B6B9F",
  
  // Neutral Colors
  light: "#E8EBF2",
  lighter: "#F4F6FA",
  white: "#FFFFFF",
  
  // Gradient Definitions
  gradients: {
    primary: "linear-gradient(135deg, #1A2A4F 0%, #3A4A7F 50%, #5B6B9F 100%)",
    primarySubtle: "linear-gradient(135deg, #F4F6FA 0%, #E8EBF2 100%)",
    overlay: "linear-gradient(135deg, rgba(26, 42, 79, 0.95) 0%, rgba(58, 74, 127, 0.9) 100%)",
    accent: "linear-gradient(45deg, #5B6B9F 0%, #3A4A7F 100%)",
  },
  
  // Shadows
  shadows: {
    sm: "0 2px 4px rgba(26, 42, 79, 0.05)",
    md: "0 4px 12px rgba(26, 42, 79, 0.1)",
    lg: "0 8px 24px rgba(26, 42, 79, 0.15)",
    xl: "0 12px 48px rgba(26, 42, 79, 0.2)",
  },
  
  // Spacing
  spacing: {
    xs: "0.25rem",    // 4px
    sm: "0.5rem",     // 8px
    md: "1rem",       // 16px
    lg: "1.5rem",     // 24px
    xl: "2rem",       // 32px
    "2xl": "3rem",    // 48px
    "3xl": "4rem",    // 64px
    "4xl": "6rem",    // 96px
  },
  
  // Border Radius
  borderRadius: {
    sm: "0.5rem",     // 8px
    md: "0.75rem",    // 12px
    lg: "1rem",       // 16px
    xl: "1.5rem",     // 24px
    "2xl": "2rem",    // 32px
    full: "9999px",
  },
  
  // Typography
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  
  // Transitions
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

export default theme;
