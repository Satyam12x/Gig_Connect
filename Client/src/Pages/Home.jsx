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
  AlertTriangle,
  ArrowRight,
  Users,
  Zap,
  Shield,
  CheckCircle,
  MessageSquare,
  Clock,
  Activity,
  Globe,
  Layers,
  Filter,
  SortDesc,
  Eye,
  Lock,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

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

// --- SKELETON COMPONENTS ---
const SkeletonStat = () => (
  <div
    className="p-6 rounded-xl bg-white animate-pulse"
    style={{ border: `2px solid ${COLORS.gray100}` }}
  >
    <div className="w-14 h-14 rounded-xl bg-gray-200 mb-4"></div>
    <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
  </div>
);

const SkeletonActivity = () => (
  <div
    className="p-8 rounded-2xl bg-white animate-pulse"
    style={{ border: `2px solid ${COLORS.gray100}` }}
  >
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="w-6 h-6 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl bg-gray-50">
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonGig = () => (
  <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm animate-pulse">
    <div className="h-56 bg-gray-200 rounded-2xl mb-4"></div>
    <div className="px-2 pb-2">
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-6"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const BentoItem = ({ title, desc, icon: Icon, className }) => (
  <div
    className={`relative overflow-hidden rounded-3xl p-8 border-2 border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group ${className}`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
    <div className="relative z-10 h-full flex flex-col justify-between">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-[#1A2A4F] group-hover:bg-[#1A2A4F] group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#1A2A4F] mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  </div>
);

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
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");

      try {
        const [categoriesRes, gigsRes] = await Promise.all([
          axios.get(`${API_BASE}/categories`),
          axios.get(`${API_BASE}/gigs/recent`),
        ]);

        setCategories(categoriesRes.data.categories || []);
        setGigs(gigsRes.data);
        setStats({
          totalGigs: gigsRes.data.length + 120,
          activeUsers: Math.floor(Math.random() * 500) + 100,
          completedProjects: Math.floor(Math.random() * 1000) + 500,
        });

        if (token) {
          try {
            const userRes = await axios.get(`${API_BASE}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const userId = userRes.data._id;
            setUser(userRes.data);

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

  // Scroll Animation Observer
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

  const filteredGigs = gigs
    .filter((gig) => {
      // NOTE: We generally hide closed gigs from the Home/Featured page
      // to keep it fresh. If you want to show them, remove this line.
      if (gig.status === "closed") return false;

      if (filterCategory === "all") return true;
      return gig.category === filterCategory;
    })
    .sort((a, b) => {
      if (sortBy === "recent")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const toggleFavorite = (gigId) => {
    const newFavs = new Set(favorites);
    newFavs.has(gigId) ? newFavs.delete(gigId) : newFavs.add(gigId);
    setFavorites(newFavs);
  };

  const getApplicationStatus = (gigId) =>
    applications.find((a) => a.gigId?._id === gigId)?.status || null;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md animate-fade-in">
          <AlertTriangle size={64} className="mx-auto mb-6 text-red-500" />
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: COLORS.navy }}
          >
            Oops! Something went wrong
          </h2>
          <p className="text-lg text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 rounded-xl text-white font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: COLORS.navyLight }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
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
          box-shadow: 0 0 20px rgba(42, 58, 111, 0.4);
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${COLORS.navyLight}, ${COLORS.navy})`,
          }}
        />
        <div
          className="absolute top-1/4 -left-32 w-80 h-80 opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${COLORS.navyLight}, ${COLORS.navyDark})`,
            transform: "rotate(45deg)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          }}
        />
        <div
          className="absolute bottom-20 right-20 w-64 h-64 opacity-10 blur-2xl"
          style={{
            background: `radial-gradient(circle, ${COLORS.navyLight}, transparent)`,
            borderRadius: "70% 30% 50% 50% / 60% 40% 60% 40%",
          }}
        />
      </div>

      <Navbar user={user} onLogout={handleLogout} />

      {/* --- HERO SECTION --- */}
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
            <span style={{ color: COLORS.navyLight }}>
              {loading
                ? "..."
                : user
                ? user.fullName?.split(" ")[0] || "Friend"
                : "Creator"}
            </span>
          </h1>
          <p
            className="text-xl md:text-2xl mb-12"
            style={{
              color: COLORS.gray600,
              animation: "fadeInUp 0.8s ease-out 0.2s both",
            }}
          >
            {loading
              ? "Loading your personalized experience..."
              : user?.role === "Freelancer"
              ? "Browse gigs, apply, and start earning!"
              : user?.role === "Provider" || "Seller"
              ? "Post gigs and find talented students!"
              : "Connect, Collaborate, and Create Together"}
          </p>

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
                  e.target.style.borderColor = COLORS.navyLight;
                  e.target.style.boxShadow =
                    "0 10px 40px rgba(42, 58, 111, 0.2)";
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <>
                <SkeletonStat />
                <SkeletonStat />
                <SkeletonStat />
              </>
            ) : (
              [
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
                  label: "Completed Projects",
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
                          backgroundColor: `${COLORS.navyLight}20`,
                          border: `2px solid ${COLORS.navyLight}30`,
                        }}
                      >
                        <Icon size={32} style={{ color: COLORS.navyLight }} />
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
              })
            )}
          </div>
        </div>
      </section>

      {/* --- USER DASHBOARD SECTION --- */}
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
              {loading ? (
                <>
                  <SkeletonStat />
                  <SkeletonStat />
                  <SkeletonStat />
                  <SkeletonStat />
                </>
              ) : (
                [
                  {
                    icon: Star,
                    label: "Average Rating",
                    value: user.rating ? user.rating.toFixed(1) : "N/A",
                    color: COLORS.navyLight,
                  },
                  {
                    icon: Briefcase,
                    label: "Gigs Completed",
                    value: user.completedGigs || 0,
                    color: COLORS.navy,
                  },
                  {
                    icon: TrendingUp,
                    label: "Total Earnings",
                    value: formatINR(user.earnings || 0),
                    color: "#10B981",
                  },
                  {
                    icon: Award,
                    label: "Status Badge",
                    value: user.badge || "New",
                    color: COLORS.navyLight,
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
                })
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {loading ? (
                <>
                  <SkeletonActivity />
                  <SkeletonActivity />
                </>
              ) : (
                <>
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
                        Recent Activity
                      </h3>
                      <Activity size={24} style={{ color: COLORS.navyLight }} />
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
                                {app.gigId?.title || "Gig Application"}
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
                                  {app.status.charAt(0).toUpperCase() +
                                    app.status.slice(1)}
                                </span>
                              </p>
                            </div>
                            <Clock
                              size={20}
                              style={{ color: COLORS.gray600 }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: COLORS.gray600 }}>
                        No recent applications found.
                      </p>
                    )}
                  </div>

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
                      <MessageSquare
                        size={24}
                        style={{ color: COLORS.navyLight }}
                      />
                    </div>
                    {tickets.slice(0, 3).length > 0 ? (
                      <div className="space-y-4">
                        {tickets.slice(0, 3).map((ticket) => (
                          <Link
                            to={`/tickets/${ticket._id}`}
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
                                {ticket.gigId?.title || "Work Ticket"}
                              </p>
                              <p
                                className="text-sm"
                                style={{ color: COLORS.gray600 }}
                              >
                                Status:{" "}
                                <span className="capitalize font-medium">
                                  {ticket.status}
                                </span>
                              </p>
                            </div>
                            <ArrowRight
                              size={20}
                              style={{ color: COLORS.navyLight }}
                            />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: COLORS.gray600 }}>
                        No active tickets. Start by applying!
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* --- CATEGORIES SECTION --- */}
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
            {loading
              ? Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="p-8 rounded-2xl bg-white animate-pulse"
                    >
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-200"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    </div>
                  ))
              : categories.slice(0, 8).map((category, i) => {
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
                          backgroundColor: `${COLORS.navyLight}20`,
                          border: `2px solid ${COLORS.navyLight}30`,
                        }}
                      >
                        <Icon size={36} style={{ color: COLORS.navyLight }} />
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

      {/* --- FEATURED OPPORTUNITIES --- */}
      <section className="py-24 px-4 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 scroll-animate">
            <div>
              <h2 className="text-4xl font-bold text-[#1A2A4F]">
                Featured Gigs
              </h2>
              <p className="text-gray-500 mt-2">
                Apply for work posted by top Providers
              </p>
            </div>
            <Link
              to="/gigs"
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 font-semibold text-gray-600 hover:bg-[#1A2A4F] hover:text-white hover:border-[#1A2A4F] transition-all"
            >
              Explore All <ArrowRight size={16} />
            </Link>
          </div>

          {/* Filter and Sort Controls */}
          {!loading && categories.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8 scroll-animate">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1A2A4F]/20 transition-all"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <SortDesc size={18} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1A2A4F]/20 transition-all"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => <SkeletonGig key={i} />)
            ) : filteredGigs.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Eye size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-xl text-gray-500 mb-4">No gigs found</p>
                <Link
                  to="/gigs"
                  className="text-[#1A2A4F] font-semibold hover:underline"
                >
                  Browse all gigs
                </Link>
              </div>
            ) : (
              filteredGigs.map((gig) => {
                const isFav = favorites.has(gig._id);
                const status = getApplicationStatus(gig._id);
                const isClosed = gig.status === "closed";

                return (
                  <div
                    key={gig._id}
                    className={`group bg-white rounded-3xl p-3 border-2 border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full scroll-animate ${
                      isClosed ? "opacity-80" : ""
                    }`}
                  >
                    {/* Image Container */}
                    <div className="relative h-56 bg-gray-100 rounded-2xl overflow-hidden mb-4">
                      {gig.thumbnail ? (
                        <img
                          src={gig.thumbnail}
                          alt={gig.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50">
                          <Laptop size={40} className="text-[#1A2A4F]/30" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#1A2A4F] text-xs font-bold px-3 py-1.5 rounded-lg">
                        {gig.category}
                      </div>

                      {isClosed && (
                        <div className="absolute top-3 right-14 bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <Lock size={12} /> Closed
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(gig._id);
                        }}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
                      >
                        <Heart
                          size={16}
                          className={
                            isFav
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }
                        />
                      </button>
                      <div className="absolute bottom-3 right-3 bg-[#1A2A4F] text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                        {formatINR(gig.price)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-2 pb-2 flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-[#1A2A4F] line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                        {gig.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                        {gig.description}
                      </p>

                      {gig.rating > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < Math.floor(gig.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-700">
                            {gig.rating} ({gig.reviews || 0})
                          </span>
                        </div>
                      )}

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

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-[#1A2A4F] flex items-center justify-center text-xs font-bold border border-gray-200 overflow-hidden">
                            {gig.providerName
                              ? gig.providerName.charAt(0)
                              : "U"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700 leading-none">
                              {gig.sellerName || "Unknown Provider"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">
                              Provider
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        {isClosed ? (
                          <span className="block w-full py-3 text-center rounded-xl font-semibold bg-gray-100 text-gray-500 cursor-not-allowed">
                            Applications Closed
                          </span>
                        ) : status ? (
                          <span className="block w-full py-3 text-center rounded-xl font-semibold bg-gray-100 text-gray-600">
                            Application Submitted
                          </span>
                        ) : (
                          <Link
                            to={`/gigs/${gig._id}`}
                            className="block w-full py-3 text-center rounded-xl text-white font-semibold transition-all hover:scale-105 bg-[#1A2A4F] shadow-lg hover:shadow-blue-900/30"
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* View All Button */}
          {!loading && filteredGigs.length > 0 && (
            <div className="text-center mt-16 scroll-animate">
              <Link
                to="/gigs"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: COLORS.navyLight,
                  boxShadow: "0 8px 20px rgba(42, 58, 111, 0.4)",
                }}
              >
                Explore All Gigs <ArrowRight size={24} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* --- WHY CHOOSE GIG CONNECT --- */}
      <section
        className="py-24 px-4 relative z-10"
        style={{ backgroundColor: COLORS.gray50 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-animate">
            <h2
              className="text-5xl font-bold mb-4"
              style={{ color: COLORS.navy }}
            >
              Why Gig Connect?
            </h2>
            <p className="text-lg" style={{ color: COLORS.gray600 }}>
              Designed to protect your work and your wallet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 scroll-animate">
            {/* Large Left */}
            <div className="md:col-span-2 bg-white rounded-3xl p-10 border-2 border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-[#1A2A4F]">
                  <Shield size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#1A2A4F] mb-3">
                  Secure Escrow Payments
                </h3>
                <p className="text-gray-500 max-w-md leading-relaxed">
                  Funds are held safely until the work is approved. This ensures
                  freelancers get paid for their effort and providers get
                  exactly what they ordered.
                </p>
              </div>
            </div>

            {/* Small Right Top */}
            <BentoItem
              title="Verified IDs"
              desc="Students are verified via college emails."
              icon={CheckCircle}
              className="bg-white"
            />

            {/* Small Left Bottom */}
            <BentoItem
              title="Fast Withdrawals"
              desc="Get paid directly to your Bank Account."
              icon={Zap}
              className="bg-white"
            />

            {/* Large Right Bottom */}
            <div className="md:col-span-2 bg-[#1A2A4F] rounded-3xl p-10 border-2 border-[#1A2A4F] relative overflow-hidden group text-white shadow-xl shadow-blue-900/10">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2A3A6F] rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-white">
                    <Globe size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Community First</h3>
                  <p className="text-blue-100 max-w-md">
                    Connect with peers, build your portfolio, and launch your
                    career while still in college.
                  </p>
                </div>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white text-[#1A2A4F] rounded-xl font-bold hover:bg-blue-50 transition-colors shrink-0"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-animate">
            <h2
              className="text-5xl font-bold mb-4"
              style={{ color: COLORS.navy }}
            >
              How It Works
            </h2>
            <p className="text-lg" style={{ color: COLORS.gray600 }}>
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                desc: "Sign up with your college email, showcase your skills, and get verified.",
                icon: Users,
              },
              {
                step: "02",
                title: "Post or Apply",
                desc: "Providers post gigs with a budget. Freelancers browse and apply with proposals.",
                icon: Search,
              },
              {
                step: "03",
                title: "Secure Payment",
                desc: "Payment is held in escrow. Funds are released to the Freelancer only when work is completed.",
                icon: TrendingUp,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative group scroll-animate">
                {/* Connector Line (hidden on last item) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-200 to-transparent"></div>
                )}

                <div className="relative bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <div
                    className="absolute -top-6 left-8 w-12 h-12 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg"
                    style={{ backgroundColor: COLORS.navy }}
                  >
                    {item.step}
                  </div>

                  <div
                    className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 mt-4 group-hover:bg-[#1A2A4F] group-hover:text-white transition-colors"
                    style={{ color: COLORS.navy }}
                  >
                    <item.icon size={32} />
                  </div>

                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: COLORS.navy }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: COLORS.gray600 }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section
        className="py-24 px-4 relative z-10"
        style={{ backgroundColor: COLORS.navy }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            {loading ? (
              <>
                <SkeletonStat />
                <SkeletonStat />
                <SkeletonStat />
                <SkeletonStat />
              </>
            ) : (
              [
                {
                  label: "Total Earnings Distributed",
                  value: "₹1.2 Cr+",
                  icon: TrendingUp,
                },
                { label: "Success Rate", value: "96%", icon: CheckCircle },
                {
                  label: "Avg. Response Time",
                  value: "< 2 hours",
                  icon: Clock,
                },
                {
                  label: "Active Categories",
                  value: `${categories.length}+`,
                  icon: Layers,
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="text-center group hover:scale-105 transition-transform duration-300 scroll-animate text-white"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4 group-hover:bg-white/20 transition-colors">
                    <stat.icon size={28} />
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
