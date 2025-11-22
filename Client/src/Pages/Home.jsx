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
  // cyan removed completely
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

const SkeletonCard = () => (
  <div
    className="p-8 rounded-2xl bg-white animate-pulse"
    style={{ border: `2px solid ${COLORS.gray100}` }}
  >
    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-200"></div>
    <div className="h-6 bg-gray-200 rounded mb-3 w-3/4 mx-auto"></div>
    <div className="h-4 bg-gray-200 rounded mb-4 w-1/2 mx-auto"></div>
    <div className="h-8 bg-gray-200 rounded mb-4 w-2/3 mx-auto"></div>
    <div className="h-4 bg-gray-200 rounded mb-6 w-1/2 mx-auto"></div>
    <div className="h-12 bg-gray-200 rounded w-full"></div>
  </div>
);

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

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");

      try {
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

  const toggleFavorite = (gigId) => {
    const newFavs = new Set(favorites);
    newFavs.has(gigId) ? newFavs.delete(gigId) : newFavs.add(gigId);
    setFavorites(newFavs);
  };

  const getApplicationStatus = (gigId) =>
    applications.find((a) => a.gigId._id === gigId)?.status || null;

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
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
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
            {loading
              ? "Loading your personalized experience..."
              : user?.role === "Seller"
              ? "Showcase your skills and start earning today!"
              : user?.role === "Buyer"
              ? "Find talented students for your next big project!"
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
                    label: "Rating",
                    value: user.rating ? user.rating.toFixed(1) : "N/A",
                    color: COLORS.navyLight,
                  },
                  {
                    icon: Briefcase,
                    label: "Completed",
                    value: user.completedGigs || 0,
                    color: COLORS.navy,
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
                        Recent Applications
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
                            <Clock
                              size={20}
                              style={{ color: COLORS.gray600 }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: COLORS.gray600 }}>
                        No recent applications
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
                            <ArrowRight
                              size={20}
                              style={{ color: COLORS.navyLight }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: COLORS.gray600 }}>No active tickets</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

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

      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-5xl font-bold mb-16 text-center scroll-animate"
            style={{ color: COLORS.navy }}
          >
            Featured Opportunities
          </h2>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : gigs.length === 0 ? (
            <div className="text-center">
              <p style={{ color: COLORS.gray600 }}>
                No gigs available yet.{" "}
                <Link
                  to="/gigs"
                  className="underline font-medium"
                  style={{ color: COLORS.navyLight }}
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

                    <div
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${COLORS.navyLight}20`,
                        border: `2px solid ${COLORS.navyLight}30`,
                      }}
                    >
                      <Icon size={36} style={{ color: COLORS.navyLight }} />
                    </div>

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

                    <p
                      className="text-3xl font-bold text-center mb-4"
                      style={{ color: COLORS.navyLight }}
                    >
                      {formatINR(gig.price)}
                    </p>

                    <p
                      className="text-center font-semibold mb-4"
                      style={{ color: COLORS.navy }}
                    >
                      By {gig.sellerName}
                    </p>

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

          <div className="text-center mt-16">
            <Link
              to="/gigs"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 scroll-animate"
              style={{
                backgroundColor: COLORS.navyLight,
                boxShadow: "0 8px 20px rgba(42, 58, 111, 0.4)",
              }}
            >
              Explore All Gigs <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

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
                      backgroundColor: `${COLORS.navyLight}20`,
                      border: `2px solid ${COLORS.navyLight}30`,
                    }}
                  >
                    <Icon size={48} style={{ color: COLORS.navyLight }} />
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

      {!user && (
        <section className="py-20 px-4 relative z-10">
          <div
            className="max-w-5xl mx-auto text-center p-16 rounded-3xl relative overflow-hidden scroll-animate"
            style={{
              backgroundColor: COLORS.navy,
              boxShadow: "0 20px 50px rgba(26, 42, 79, 0.3)",
            }}
          >
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${COLORS.navyLight}, transparent)`,
              }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${COLORS.navyLight}, transparent)`,
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
                    backgroundColor: COLORS.navyLight,
                    color: COLORS.white,
                    boxShadow: "0 8px 20px rgba(42, 58, 111, 0.4)",
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

      <Footer />
    </div>
  );
};

export default Home;
