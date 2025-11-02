import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Code,
  PenTool,
  BookOpen,
  Users,
  Briefcase,
  CheckCircle,
  Quote,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  Home as HomeIcon,
  Briefcase as BriefcaseIcon,
  PlusCircle,
  MessageCircle,
  Bell,
  ChevronDown,
} from "lucide-react";
import Navbar from '../components/Navbar'

const API_BASE = "http://localhost:5000/api";

// === Navbar Component ===

// === Footer Component ===
const Footer = () => {
  return (
    <footer className="bg-[#1A2A4F] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Sparkles size={20} className="text-[#1A2A4F]" />
              </div>
              <span className="text-xl font-bold">Gig Connect</span>
            </div>
            <p className="text-indigo-200 text-sm">
              Connecting campus talent with real opportunities.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-indigo-200">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gigs" className="hover:text-white">
                  Browse Gigs
                </Link>
              </li>
              <li>
                <Link to="/create-gig" className="hover:text-white">
                  Post a Gig
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-indigo-200">
              <li>
                <Link to="/help" className="hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Stay Connected</h3>
            <p className="text-sm text-indigo-200 mb-4">
              Join 50,000+ students and clients.
            </p>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer">
                <Users size={18} />
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer">
                <MessageCircle size={18} />
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer">
                <Bell size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 text-center text-sm text-indigo-200">
          © 2025 Gig Connect. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

// === Section Divider (Updated Color) ===
const SectionDivider = ({ variant = "default" }) => {
  if (variant === "wave") {
    return (
      <div className="relative h-16 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-16"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="#1A2A4F"
            fillOpacity="0.08"
          />
        </svg>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="relative h-12 flex items-center justify-center">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#1A2A4F] animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                opacity: 0.3 + i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-1 my-8 mx-auto max-w-xs">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1A2A4F] to-transparent opacity-30" />
    </div>
  );
};

// === Hero Section (Updated Colors) ===
const HeroSection = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gigs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const message =
    userRole === "Seller"
      ? "Showcase your skills and start earning with gigs!"
      : userRole === "Buyer"
      ? "Hire talented students for your projects!"
      : "Discover or offer services in your campus community!";

  return (
    <>
      <div className="relative min-h-screen bg-white overflow-hidden pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-5%] right-[-5%] w-96 h-96 bg-[#1A2A4F]/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#1A2A4F]/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
            <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2A4F]/10 rounded-full text-[#1A2A4F] text-sm font-medium mb-4">
                <Sparkles size={16} />
                <span>Welcome to Gig Connect</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A2A4F] leading-tight">
                Connect with
                <span className="block text-[#1A2A4F] mt-2">
                  Student Talent
                </span>
              </h1>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
                {message}
              </p>

              <form
                onSubmit={handleSearch}
                className="relative max-w-md mx-auto lg:mx-0 group"
              >
                <div className="absolute -inset-0.5 bg-[#1A2A4F] rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300" />
                <div className="relative flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for gigs..."
                    className="flex-grow p-4 rounded-l-lg border-2 border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#1A2A4F] bg-white shadow-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-4 bg-[#1A2A4F] text-white rounded-r-lg hover:bg-[#2A3A6F] transition-all duration-300"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-[#1A2A4F] text-white font-semibold rounded-lg hover:bg-[#2A3A6F] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/gigs"
                  className="px-8 py-4 bg-white text-[#1A2A4F] font-semibold rounded-lg border-2 border-[#1A2A4F] hover:bg-[#1A2A4F]/5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Browse Gigs
                  <TrendingUp size={18} />
                </Link>
              </div>

              <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
                {[
                  { number: "5,000+", label: "Active Students" },
                  { number: "10,000+", label: "Projects Completed" },
                  { number: "4.9/5", label: "Average Rating" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center lg:text-left">
                    <p className="text-3xl font-bold text-[#1A2A4F]">
                      {stat.number}
                    </p>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative group">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-8 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop"
                    alt="Students collaborating"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SectionDivider variant="wave" />
    </>
  );
};

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch user profile");
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4"
            size={48}
            style={{ color: "#1A2A4F" }}
          />
          <p className="text-[#1A2A4F] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-600" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased bg-white">
      <style>
        {`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}
      </style>

      <Navbar user={user} onLogout={handleLogout} />
      <div className="pt-16">
        <HeroSection userRole={user?.role} />
        {/* Other sections: FeaturedGigs, RecentGigs, Categories, HowItWorks, Testimonials, CTABanner */}
        {/* ... (include all your updated sections here) */}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
