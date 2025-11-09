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
  Activity,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

/* ---------- COLOR THEME ---------- */
const COLORS = {
  navy: "#1A2A4F",
  navyLight: "#2A3A6F",
  navyDark: "#0F1729",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray600: "#4B5563",
  gray900: "#111827",
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

  /* ---------- SCROLL ANIMATIONS ---------- */
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading]);

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

  const getApplicationStatus = (gigId) =>
    applications.find((a) => a.gigId._id === gigId)?.status || null;

  /* ---------- RENDER ---------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4"
            size={48}
            style={{ color: COLORS.cyan }}
          />
          <p className="font-medium" style={{ color: COLORS.navy }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="font-medium text-lg text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg text-white transition-all hover:scale-105"
            style={{ backgroundColor: COLORS.cyan }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* BACKGROUND SHAPES */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large blob top-right */}
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${COLORS.cyan}, ${COLORS.navyLight})`,
          }}
        />
        {/* Medium blob left */}
        <div
          className="absolute top-1/4 -left-32 w-80 h-80 opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${COLORS.navyLight}, ${COLORS.navy})`,
            transform: "rotate(45deg)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          }}
        />
        {/* Small blob bottom-right */}
        <div
          className="absolute bottom-20 right-20 w-64 h-64 opacity-10 blur-2xl"
          style={{
            background: `radial-gradient(circle, ${COLORS.cyan}, transparent)`,
            borderRadius: "70% 30% 50% 50% / 60% 40% 60% 40%",
          }}
        />
        {/* Triangle shape middle-right */}
        <div
          className="absolute top-1/2 right-0 w-0 h-0 opacity-5"
          style={{
            borderLeft: "200px solid transparent",
            borderRight: `200px solid ${COLORS.navyLight}`,
            borderBottom: "200px solid transparent",
          }}
        />
        {/* Curved shape bottom-left */}
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 opacity-10 blur-2xl"
          style={{
            background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.cyan})`,
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          }}
        />
      </div>

      {/* STYLES */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(26, 42, 79, 0.15);
        }

        .glow-on-hover {
          transition: all 0.3s ease;
        }

        .glow-on-hover:hover {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
        }
      `}</style>

      {/* NAVBAR */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{
              color: COLORS.navy,
              animation: "fadeInUp 0.8s ease-out",
            }}
          >
            Welcome back,{" "}
            <span
              style={{
                color: COLORS.cyan,
                textShadow: "0 0 30px rgba(6, 182, 212, 0.3)",
              }}
            >
              {user
                ? user.fullName?.split(" ")[0] ||
                  user.name?.split(" ")[0] ||
                  "Friend"
                : "Explorer"}
            </span>
          </h1>
          <p
            className="text-xl md:text-2xl mb-12"
            style={{
              color: COLORS.gray600,
              animation: "fadeInUp 0.8s ease-out 0.2s both",
            }}
          >
            {user?.role === "Seller"
              ? "Showcase your skills and start earning today!"
              : user?.role === "Buyer"
              ? "Find talented students for your next big project!"
              : "Connect, Collaborate, and Create Together"}
          </p>

          {/* SEARCH BAR */}
          <form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto mb-16"
            style={{ animation: "scaleIn 0.8s ease-out 0.4s both" }}
          >
            <div className="relative group">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10"
                size={24}
                style={{ color: COLORS.gray600 }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for gigs, skills, or services..."
                className="w-full pl-16 pr-40 py-5 rounded-2xl text-lg border-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: COLORS.white,
                  color: COLORS.navy,
                  borderColor: COLORS.gray200,
                  boxShadow: "0 10px 30px rgba(26, 42, 79, 0.08)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.cyan;
                  e.target.style.boxShadow =
                    "0 10px 40px rgba(6, 182, 212, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.gray200;
                  e.target.style.boxShadow =
                    "0 10px 30px rgba(26, 42, 79, 0.08)";
                }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: COLORS.navy,
                  boxShadow: "0 4px 12px rgba(26, 42, 79, 0.3)",
                }}
              >
                Search
              </button>
            </div>
          </form>

          {/* PLATFORM STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Briefcase,
                label: "Active Gigs",
                value: stats.totalGigs,
                delay: 0.6,
              },
              {
                icon: Users,
                label: "Active Users",
                value: stats.activeUsers,
                delay: 0.7,
              },
              {
                icon: CheckCircle,
                label: "Completed",
                value: stats.completedProjects,
                delay: 0.8,
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-white hover-lift"
                  style={{
                    border: `2px solid ${COLORS.gray100}`,
                    boxShadow: "0 10px 30px rgba(26, 42, 79, 0.08)",
                    animation: `fadeInUp 0.8s ease-out ${stat.delay}s both`,
                  }}
                >
                  <div className="flex items-center justify-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${COLORS.cyan}20`,
                        border: `2px solid ${COLORS.cyan}30`,
                      }}
                    >
                      <Icon size={32} style={{ color: COLORS.cyan }} />
                    </div>
                    <div className="text-left">
                      <p
                        className="text-sm font-medium"
                        style={{ color: COLORS.gray600 }}
                      >
                        {stat.label}
                      </p>
                      <p
                        className="text-4xl font-bold"
                        style={{ color: COLORS.navy }}
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
        <section className="py-16 px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-4xl font-bold mb-12 scroll-animate"
              style={{ color: COLORS.navy }}
            >
              Your Dashboard
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
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
                  color: COLORS.cyan,
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
                    className="p-6 rounded-xl bg-white hover-lift scroll-animate"
                    style={{
                      border: `2px solid ${COLORS.gray100}`,
                      boxShadow: "0 8px 24px rgba(26, 42, 79, 0.08)",
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        backgroundColor: `${stat.color}20`,
                        border: `2px solid ${stat.color}30`,
                      }}
                    >
                      <Icon size={28} style={{ color: stat.color }} />
                    </div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: COLORS.gray600 }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: COLORS.navy }}
                    >
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Applications */}
              <div
                className="p-8 rounded-2xl bg-white hover-lift scroll-animate"
                style={{
                  border: `2px solid ${COLORS.gray100}`,
                  boxShadow: "0 10px 30px rgba(26, 42, 79, 0.08)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: COLORS.navy }}
                  >
                    Recent Applications
                  </h3>
                  <Activity size={24} style={{ color: COLORS.cyan }} />
                </div>
                {applications.slice(0, 3).length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((app) => (
                      <div
                        key={app._id}
                        className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-105"
                        style={{
                          backgroundColor: COLORS.gray50,
                          border: `1px solid ${COLORS.gray200}`,
                        }}
                      >
                        <div>
                          <p
                            className="font-semibold mb-1"
                            style={{ color: COLORS.navy }}
                          >
                            {app.gigId?.title || "Gig"}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: COLORS.gray600 }}
                          >
                            Status:{" "}
                            <span
                              className={
                                app.status === "accepted"
                                  ? "text-green-600 font-medium"
                                  : app.status === "rejected"
                                  ? "text-red-600 font-medium"
                                  : "text-yellow-600 font-medium"
                              }
                            >
                              {app.status}
                            </span>
                          </p>
                        </div>
                        <Clock size={20} style={{ color: COLORS.gray600 }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: COLORS.gray600 }}>
                    No recent applications
                  </p>
                )}
              </div>

              {/* Tickets */}
              <div
                className="p-8 rounded-2xl bg-white hover-lift scroll-animate"
                style={{
                  border: `2px solid ${COLORS.gray100}`,
                  boxShadow: "0 10px 30px rgba(26, 42, 79, 0.08)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: COLORS.navy }}
                  >
                    Active Tickets
                  </h3>
                  <MessageSquare size={24} style={{ color: COLORS.cyan }} />
                </div>
                {tickets.slice(0, 3).length > 0 ? (
                  <div className="space-y-4">
                    {tickets.slice(0, 3).map((ticket) => (
                      <div
                        key={ticket._id}
                        className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-105"
                        style={{
                          backgroundColor: COLORS.gray50,
                          border: `1px solid ${COLORS.gray200}`,
                        }}
                      >
                        <div>
                          <p
                            className="font-semibold mb-1"
                            style={{ color: COLORS.navy }}
                          >
                            {ticket.gigId?.title || "Ticket"}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: COLORS.gray600 }}
                          >
                            Status: {ticket.status}
                          </p>
                        </div>
                        <ArrowRight size={20} style={{ color: COLORS.cyan }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: COLORS.gray600 }}>No active tickets</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES SECTION */}
      <section
        className="py-20 px-4 relative z-10"
        style={{ backgroundColor: COLORS.gray50 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl font-bold mb-12 text-center scroll-animate"
            style={{ color: COLORS.navy }}
          >
            Explore Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                  className="p-8 rounded-2xl text-center bg-white hover-lift glow-on-hover scroll-animate"
                  style={{
                    border: `2px solid ${COLORS.gray100}`,
                    boxShadow: "0 8px 24px rgba(26, 42, 79, 0.08)",
                  }}
                >
                  <div
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${COLORS.cyan}20`,
                      border: `2px solid ${COLORS.cyan}30`,
                    }}
                  >
                    <Icon size={36} style={{ color: COLORS.cyan }} />
                  </div>
                  <p
                    className="font-bold text-lg"
                    style={{ color: COLORS.navy }}
                  >
                    {category}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED GIGS */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-5xl font-bold mb-16 text-center scroll-animate"
            style={{ color: COLORS.navy }}
          >
            Featured Opportunities
          </h2>

          {gigs.length === 0 ? (
            <div className="text-center">
              <p style={{ color: COLORS.gray600 }}>
                No gigs available yet.{" "}
                <Link
                  to="/gigs"
                  className="underline font-medium"
                  style={{ color: COLORS.cyan }}
                >
                  Browse all
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    className="relative group p-8 rounded-2xl bg-white hover-lift scroll-animate"
                    style={{
                      border: `2px solid ${COLORS.gray100}`,
                      boxShadow: "0 10px 30px rgba(26, 42, 79, 0.08)",
                    }}
                  >
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(gig._id)}
                      className="absolute top-6 right-6 p-3 rounded-xl transition-all hover:scale-110"
                      style={{
                        backgroundColor: COLORS.gray50,
                        border: `1px solid ${COLORS.gray200}`,
                      }}
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
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${COLORS.cyan}20`,
                        border: `2px solid ${COLORS.cyan}30`,
                      }}
                    >
                      <Icon size={36} style={{ color: COLORS.cyan }} />
                    </div>

                    {/* Title & Category */}
                    <h3
                      className="text-2xl font-bold mb-3 text-center"
                      style={{ color: COLORS.navy }}
                    >
                      {gig.title}
                    </h3>
                    <p
                      className="text-center mb-4"
                      style={{ color: COLORS.gray600 }}
                    >
                      {gig.category}
                    </p>

                    {/* Price */}
                    <p
                      className="text-3xl font-bold text-center mb-4"
                      style={{ color: COLORS.cyan }}
                    >
                      {formatINR(gig.price)}
                    </p>

                    {/* Seller */}
                    <p
                      className="text-center font-semibold mb-4"
                      style={{ color: COLORS.navy }}
                    >
                      By {gig.sellerName}
                    </p>

                    {/* Rating */}
                    {gig.rating > 0 && (
                      <div className="flex items-center justify-center gap-2 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={
                              i < Math.floor(gig.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                        <span
                          className="ml-1 text-sm font-medium"
                          style={{ color: COLORS.gray600 }}
                        >
                          {gig.rating} ({gig.reviews || 0})
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    {status && (
                      <p
                        className={`text-sm text-center font-semibold mb-4 ${
                          status === "accepted"
                            ? "text-green-600"
                            : status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Application:{" "}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </p>
                    )}

                    {/* Action Button */}
                    {closed ? (
                      <span
                        className="block w-full py-4 text-center rounded-xl font-semibold"
                        style={{
                          backgroundColor: COLORS.gray100,
                          color: COLORS.gray600,
                        }}
                      >
                        Applications Closed
                      </span>
                    ) : status ? (
                      <span
                        className="block w-full py-4 text-center rounded-xl font-semibold"
                        style={{
                          backgroundColor: COLORS.gray100,
                          color: COLORS.gray600,
                        }}
                      >
                        Application Submitted
                      </span>
                    ) : (
                      <Link
                        to={`/gigs/${gig._id}`}
                        className="block w-full py-4 text-center rounded-xl text-white font-semibold transition-all hover:scale-105"
                        style={{
                          backgroundColor: COLORS.navy,
                          boxShadow: "0 4px 12px rgba(26, 42, 79, 0.3)",
                        }}
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
          <div className="text-center mt-16">
            <Link
              to="/gigs"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 scroll-animate"
              style={{
                backgroundColor: COLORS.cyan,
                boxShadow: "0 8px 20px rgba(6, 182, 212, 0.4)",
              }}
            >
              Explore All Gigs <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section
        className="py-20 px-4 relative z-10"
        style={{ backgroundColor: COLORS.gray50 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-5xl font-bold mb-16 text-center scroll-animate"
            style={{ color: COLORS.navy }}
          >
            Why Choose Gig Connect?
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Shield,
                title: "Secure Payments",
                description:
                  "Your transactions are protected with industry-leading security standards",
              },
              {
                icon: Zap,
                title: "Quick Turnaround",
                description:
                  "Find and hire verified talent in minutes, not days or weeks",
              },
              {
                icon: Users,
                title: "Verified Talent",
                description:
                  "Work with pre-screened students and verified professionals",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="text-center p-10 rounded-2xl bg-white hover-lift scroll-animate"
                  style={{
                    border: `2px solid ${COLORS.gray100}`,
                    boxShadow: "0 10px 30px rgba(26, 42, 79, 0.08)",
                  }}
                >
                  <div
                    className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${COLORS.cyan}20`,
                      border: `2px solid ${COLORS.cyan}30`,
                    }}
                  >
                    <Icon size={48} style={{ color: COLORS.cyan }} />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-4"
                    style={{ color: COLORS.navy }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-lg leading-relaxed"
                    style={{ color: COLORS.gray600 }}
                  >
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
        <section className="py-20 px-4 relative z-10">
          <div
            className="max-w-5xl mx-auto text-center p-16 rounded-3xl relative overflow-hidden scroll-animate"
            style={{
              backgroundColor: COLORS.navy,
              boxShadow: "0 20px 50px rgba(26, 42, 79, 0.3)",
            }}
          >
            {/* Background decoration */}
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${COLORS.cyan}, transparent)`,
              }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${COLORS.cyanLight}, transparent)`,
              }}
            />

            <div className="relative z-10">
              <h2 className="text-5xl font-bold mb-6 text-white">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-10 text-white opacity-90">
                Join thousands of students and professionals already using Gig
                Connect
              </p>
              <div className="flex gap-6 justify-center flex-wrap">
                <Link
                  to="/signup"
                  className="px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
                  style={{
                    backgroundColor: COLORS.cyan,
                    color: COLORS.white,
                    boxShadow: "0 8px 20px rgba(6, 182, 212, 0.4)",
                  }}
                >
                  Sign Up Now
                </Link>
                <Link
                  to="/login"
                  className="px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
                  style={{
                    backgroundColor: COLORS.white,
                    color: COLORS.navy,
                    boxShadow: "0 8px 20px rgba(255, 255, 255, 0.3)",
                  }}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;
