// src/pages/Home.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Code,
  PenTool,
  BookOpen,
  Laptop,
  Heart,
  Star,
  Briefcase,
  TrendingUp,
  Award,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Users,
  Zap,
  Shield,
  CheckCircle,
  MessageSquare,
  Clock,
  DollarSign,
  TrendingDown,
  Activity,
  Moon,
  Sun,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

/* ---------- COLOR THEMES ---------- */
const THEMES = {
  light: {
    primary: "#1A2A4F",
    secondary: "#3A4A7F",
    accent: "#06B6D4",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    cardBg: "#FFFFFF",
    gradientStart: "#F0F4FF",
    gradientEnd: "#FFFFFF",
  },
  dark: {
    primary: "#0A1628",
    secondary: "#1A2A4F",
    accent: "#06B6D4",
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    border: "#334155",
    cardBg: "#1E293B",
    gradientStart: "#0F172A",
    gradientEnd: "#1A2A4F",
  },
};

/* ---------- HELPERS ---------- */
const formatINR = (amount) => {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

/* ---------- MAIN COMPONENT ---------- */
const Home = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const colors = THEMES[theme];

  const [user, setUser] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalGigs: 0,
    activeUsers: 0,
    completedProjects: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");

      try {
        // Fetch categories and stats without auth
        const [categoriesRes, gigsRes] = await Promise.all([
          axios.get(`${API_BASE}/categories`),
          axios.get(`${API_BASE}/gigs/recent`),
        ]);

        setCategories(categoriesRes.data.categories || []);
        setGigs(gigsRes.data.slice(0, 6));
        setStats({
          totalGigs: gigsRes.data.length,
          activeUsers: Math.floor(Math.random() * 500) + 100,
          completedProjects: Math.floor(Math.random() * 1000) + 500,
        });

        // Fetch user data if authenticated
        if (token) {
          try {
            const userRes = await axios.get(`${API_BASE}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const userId = userRes.data._id;
            setUser(userRes.data);

            // Fetch user-specific data
            const [appsRes, ticketsRes] = await Promise.all([
              axios.get(`${API_BASE}/users/${userId}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get(`${API_BASE}/users/${userId}/tickets`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);

            setApplications(appsRes.data);
            setTickets(ticketsRes.data);
          } catch (authError) {
            // If token is invalid, clear it
            console.error("Auth error:", authError);
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
          }
        }
      } catch (e) {
        console.error(e);
        setError(e.response?.data?.error || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* ---------- HANDLERS ---------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gigs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleFavorite = (gigId) => {
    const newFavs = new Set(favorites);
    newFavs.has(gigId) ? newFavs.delete(gigId) : newFavs.add(gigId);
    setFavorites(newFavs);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const getApplicationStatus = (gigId) =>
    applications.find((a) => a.gigId._id === gigId)?.status || null;

  /* ---------- RENDER ---------- */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4"
            size={48}
            style={{ color: colors.accent }}
          />
          <p className="font-medium" style={{ color: colors.text }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="font-medium text-lg text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-lg text-white transition-all hover:scale-105"
            style={{ backgroundColor: colors.accent }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      {/* NAVBAR */}
      <Navbar user={user} onLogout={handleLogout} theme={theme} />

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-24 right-6 z-50 p-3 rounded-full shadow-lg transition-all hover:scale-110"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
        }}
      >
        {theme === "light" ? (
          <Moon size={20} style={{ color: colors.text }} />
        ) : (
          <Sun size={20} style={{ color: colors.accent }} />
        )}
      </button>

      {/* HERO SECTION */}
      <section
        className="pt-24 pb-16 px-4"
        style={{
          background: `linear-gradient(to bottom, ${colors.gradientStart}, ${colors.gradientEnd})`,
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            Welcome back,{" "}
            <span style={{ color: colors.accent }}>
              {user?.fullName?.split(" ")[0] || "Explorer"}
            </span>
          </h1>
          <p className="text-xl mb-8" style={{ color: colors.textSecondary }}>
            {user?.role === "Seller"
              ? "Showcase your skills and start earning today!"
              : user?.role === "Buyer"
              ? "Find talented students for your next big project!"
              : "Connect, Collaborate, and Create Together"}
          </p>

          {/* SEARCH BAR */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex gap-2"
          >
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={20}
                style={{ color: colors.textSecondary }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for gigs, skills, or services..."
                className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: colors.cardBg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
                }}
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: colors.accent }}
            >
              Search
            </button>
          </form>

          {/* PLATFORM STATS */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, label: "Active Gigs", value: stats.totalGigs },
              { icon: Users, label: "Active Users", value: stats.activeUsers },
              {
                icon: CheckCircle,
                label: "Completed",
                value: stats.completedProjects,
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl shadow-lg transition-all hover:scale-105"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="flex items-center justify-center gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${colors.accent}20` }}
                    >
                      <Icon size={28} style={{ color: colors.accent }} />
                    </div>
                    <div className="text-left">
                      <p
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {stat.label}
                      </p>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: colors.text }}
                      >
                        {stat.value}+
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* USER DASHBOARD (if logged in) */}
      {user && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ color: colors.text }}
            >
              Your Dashboard
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Star,
                  label: "Rating",
                  value: user.rating ? user.rating.toFixed(1) : "N/A",
                  color: "#FCD34D",
                },
                {
                  icon: Briefcase,
                  label: "Completed",
                  value: user.completedGigs || 0,
                  color: colors.accent,
                },
                {
                  icon: TrendingUp,
                  label: "Earnings",
                  value: formatINR(user.earnings || 0),
                  color: "#10B981",
                },
                {
                  icon: Award,
                  label: "Badge",
                  value: user.badge || "New",
                  color: "#8B5CF6",
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-xl shadow-lg transition-all hover:scale-105"
                    style={{
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <Icon size={24} style={{ color: stat.color }} />
                    </div>
                    <p
                      className="text-xs mb-1"
                      style={{ color: colors.textSecondary }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="text-xl font-bold"
                      style={{ color: colors.text }}
                    >
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {/* Applications */}
              <div
                className="p-6 rounded-xl shadow-lg"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-xl font-bold"
                    style={{ color: colors.text }}
                  >
                    Recent Applications
                  </h3>
                  <Activity size={20} style={{ color: colors.accent }} />
                </div>
                {applications.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((app) => (
                      <div
                        key={app._id}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: colors.text }}
                          >
                            {app.gigId?.title || "Gig"}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            Status:{" "}
                            <span
                              className={
                                app.status === "accepted"
                                  ? "text-green-500"
                                  : app.status === "rejected"
                                  ? "text-red-500"
                                  : "text-yellow-500"
                              }
                            >
                              {app.status}
                            </span>
                          </p>
                        </div>
                        <Clock
                          size={16}
                          style={{ color: colors.textSecondary }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: colors.textSecondary }}>
                    No recent applications
                  </p>
                )}
              </div>

              {/* Tickets */}
              <div
                className="p-6 rounded-xl shadow-lg"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-xl font-bold"
                    style={{ color: colors.text }}
                  >
                    Active Tickets
                  </h3>
                  <MessageSquare size={20} style={{ color: colors.accent }} />
                </div>
                {tickets.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {tickets.slice(0, 3).map((ticket) => (
                      <div
                        key={ticket._id}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: colors.text }}
                          >
                            {ticket.gigId?.title || "Ticket"}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            Status: {ticket.status}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          style={{ color: colors.accent }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: colors.textSecondary }}>
                    No active tickets
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES SECTION */}
      <section
        className="py-12 px-4"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: colors.text }}
          >
            Explore Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category, i) => {
              const icons = [
                Code,
                PenTool,
                BookOpen,
                Laptop,
                Users,
                Zap,
                Shield,
                Award,
              ];
              const Icon = icons[i % icons.length];
              return (
                <Link
                  key={i}
                  to={`/gigs?category=${encodeURIComponent(category)}`}
                  className="p-6 rounded-xl text-center transition-all hover:scale-105 shadow-lg"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div
                    className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${colors.accent}20` }}
                  >
                    <Icon size={32} style={{ color: colors.accent }} />
                  </div>
                  <p className="font-semibold" style={{ color: colors.text }}>
                    {category}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED GIGS */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl font-bold mb-12 text-center"
            style={{ color: colors.text }}
          >
            Featured Opportunities
          </h2>

          {gigs.length === 0 ? (
            <div className="text-center">
              <p style={{ color: colors.textSecondary }}>
                No gigs available yet.{" "}
                <Link
                  to="/gigs"
                  className="underline"
                  style={{ color: colors.accent }}
                >
                  Browse all
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => {
                const Icon =
                  {
                    "Web Development": Code,
                    "Graphic Design": PenTool,
                    Tutoring: BookOpen,
                  }[gig.category] || Laptop;

                const status = getApplicationStatus(gig._id);
                const isFavorited = favorites.has(gig._id);
                const closed = gig.status === "closed";

                return (
                  <div
                    key={gig._id}
                    className="relative group p-6 rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
                    style={{
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(gig._id)}
                      className="absolute top-4 right-4 p-2 rounded-full transition-all hover:scale-110"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <Heart
                        size={20}
                        className={
                          isFavorited
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }
                      />
                    </button>

                    {/* Icon */}
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${colors.accent}20` }}
                    >
                      <Icon size={32} style={{ color: colors.accent }} />
                    </div>

                    {/* Title & Category */}
                    <h3
                      className="text-xl font-bold mb-2 text-center"
                      style={{ color: colors.text }}
                    >
                      {gig.title}
                    </h3>
                    <p
                      className="text-center mb-4"
                      style={{ color: colors.textSecondary }}
                    >
                      {gig.category}
                    </p>

                    {/* Price */}
                    <p
                      className="text-2xl font-bold text-center mb-4"
                      style={{ color: colors.accent }}
                    >
                      {formatINR(gig.price)}
                    </p>

                    {/* Seller */}
                    <p
                      className="text-center font-medium mb-4"
                      style={{ color: colors.text }}
                    >
                      By {gig.sellerName}
                    </p>

                    {/* Rating */}
                    {gig.rating > 0 && (
                      <div className="flex items-center justify-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < Math.floor(gig.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                        <span
                          className="ml-1 text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          {gig.rating} ({gig.reviews || 0})
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    {status && (
                      <p
                        className={`text-sm text-center font-medium mb-3 ${
                          status === "accepted"
                            ? "text-green-500"
                            : status === "rejected"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }`}
                      >
                        Application:{" "}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </p>
                    )}

                    {/* Action Button */}
                    {closed ? (
                      <span
                        className="block w-full py-3 text-center rounded-lg font-medium"
                        style={{
                          backgroundColor: colors.surface,
                          color: colors.textSecondary,
                        }}
                      >
                        Applications Closed
                      </span>
                    ) : status ? (
                      <span
                        className="block w-full py-3 text-center rounded-lg font-medium"
                        style={{
                          backgroundColor: colors.surface,
                          color: colors.textSecondary,
                        }}
                      >
                        Application Submitted
                      </span>
                    ) : (
                      <Link
                        to={`/gigs/${gig._id}`}
                        className="block w-full py-3 text-center rounded-lg text-white font-semibold transition-all hover:scale-105"
                        style={{ backgroundColor: colors.primary }}
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              to="/gigs"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: colors.accent }}
            >
              Explore All Gigs <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section
        className="py-16 px-4"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl font-bold mb-12 text-center"
            style={{ color: colors.text }}
          >
            Why Choose Gig Connect?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Payments",
                description:
                  "Your transactions are protected with industry-leading security",
              },
              {
                icon: Zap,
                title: "Quick Turnaround",
                description: "Find and hire talent in minutes, not days",
              },
              {
                icon: Users,
                title: "Verified Talent",
                description: "Work with verified students and professionals",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="text-center p-8 rounded-xl shadow-lg transition-all hover:scale-105"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div
                    className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${colors.accent}20` }}
                  >
                    <Icon size={40} style={{ color: colors.accent }} />
                  </div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: colors.text }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: colors.textSecondary }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      {!user && (
        <section className="py-16 px-4">
          <div
            className="max-w-4xl mx-auto text-center p-12 rounded-2xl shadow-2xl"
            style={{
              backgroundColor: colors.primary,
              backgroundImage: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            }}
          >
            <h2 className="text-4xl font-bold mb-4 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-white opacity-90">
              Join thousands of students and professionals already using Gig
              Connect
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                style={{ backgroundColor: colors.accent, color: "white" }}
              >
                Sign Up Now
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: "white",
                  color: colors.primary,
                }}
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <Footer theme={theme} />
    </div>
  );
};

export default Home;
