// Application configuration
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
  apiTimeout: 30000, // 30 seconds
  
  // App Information
  appName: "Gig Connect",
  appTagline: "Where Talent Meets Opportunity",
  appDescription: "Connect with skilled designers, developers, and tutors from your campus community.",
  
  // Features
  features: {
    enableGoogleAuth: true,
    enableChat: true,
    enableNotifications: true,
  },
  
  // Social Links
  social: {
    twitter: "https://twitter.com/gigconnect",
    facebook: "https://facebook.com/gigconnect",
    linkedin: "https://linkedin.com/company/gigconnect",
    instagram: "https://instagram.com/gigconnect",
  },
  
  // Animation Settings
  animations: {
    enableIntroAnimation: true,
    enableScrollAnimations: true,
    reducedMotion: false,
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 12,
    gigsPerPage: 12,
    ticketsPerPage: 10,
  },
};

export default config;
