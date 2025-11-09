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
  Users,
  CheckCircle,
  Award,
  Briefcase,
  Menu,
  X,
  LogOut,
  Plus,
  Heart,
  Star,
  ArrowRight,
  TrendingUp,
  Laptop,
  Lightbulb,
  Smile,
  Rocket,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const COLORS = {
  navy: "#1A2A4F",
  navyLight: "#3A4A7F",
  navyMedium: "#2A3A6F",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray700: "#374151",
  gray900: "#111827",
  red500: "#EF4444",
};

/* ---------- UTILS ---------- */
const formatINR = (amount) => {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

/* ---------- SCROLL ANIMATION ---------- */
const useScrollAnimation = () => {
  const [visible, setVisible] = useState({});
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible((p) => ({ ...p, [e.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    document
      .querySelectorAll("[data-animate]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return visible;
};

/* ---------- SECTION DIVIDER ---------- */
const SectionDivider = () => (
  <div className="my-12 mx-auto max-w-6xl">
    <div className="h-px bg-gray-300" />
  </div>
);

/* ---------- SMOOTH SCROLL HANDLER ---------- */
const handleScrollClick = (e, targetId) => {
  e.preventDefault();
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

/* ---------- MAIN HOME ---------- */
const Home = () => {
  const navigate = useNavigate();
  const visible = useScrollAnimation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());

  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [categories, setCategories] = useState([]);

  /* ---------- FETCH USER & DATA ---------- */
  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // If no token or no userId → skip loading
      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        const [userRes, gigsRes, appsRes, catsRes] = await Promise.all([
          axios.get(`${API_BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/gigs/recent`),
          axios.get(`${API_BASE}/users/${userId}/applications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/categories`),
        ]);

        setUser(userRes.data);
        setGigs(gigsRes.data.slice(0, 4));
        setApplications(appsRes.data);
        setCategories(catsRes.data.categories || []);
        setLoading(false);
      } catch (e) {
        console.error("Fetch error:", e);
        setError(e.response?.data?.error || "Failed to load data");
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

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
    if (newFavs.has(gigId)) newFavs.delete(gigId);
    else newFavs.add(gigId);
    setFavorites(newFavs);
  };

  const getApplicationStatus = (gigId) => {
    return applications.find((a) => a.gigId._id === gigId)?.status || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4"
            size={48}
            style={{ color: COLORS.navyLight }}
          />
          <p className="font-medium" style={{ color: COLORS.navy }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertTriangle
            size={48}
            className="mx-auto mb-4"
            style={{ color: COLORS.red500 }}
          />
          <p className="font-medium" style={{ color: COLORS.red500 }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Rocket
                className="text-navyLight"
                size={28}
                style={{ color: COLORS.navyLight }}
              />
              <span
                className="text-2xl font-bold"
                style={{ color: COLORS.navyLight }}
              >
                GigConnect
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                onClick={(e) => handleScrollClick(e, "categories")}
                className="text-gray-700 hover:text-navyLight transition"
                style={{ color: COLORS.navyMedium }}
              >
                Categories
              </Link>
              <Link
                to="/"
                onClick={(e) => handleScrollClick(e, "gigs")}
                className="text-gray-700 hover:text-navyLight transition"
                style={{ color: COLORS.navyMedium }}
              >
                Browse Gigs
              </Link>
              <Link
                to="/"
                onClick={(e) => handleScrollClick(e, "stats")}
                className="text-gray-700 hover:text-navyLight transition"
                style={{ color: COLORS.navyMedium }}
              >
                Stats
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/create-gig"
                    className="px-6 py-2 bg-navyLight text-white font-semibold rounded-lg hover:bg-navy transition flex items-center gap-2"
                    style={{ backgroundColor: COLORS.navyLight }}
                  >
                    <Plus size={18} />
                    Post a Gig
                  </Link>
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <span className="text-2xl">{user.avatar || "U"}</span>
                    <button
                      onClick={handleLogout}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2 text-navyLight font-semibold hover:bg-gray-50 rounded-lg transition"
                    style={{ color: COLORS.navyLight }}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-6 py-2 bg-navyLight text-white font-semibold rounded-lg hover:bg-navy transition"
                    style={{ backgroundColor: COLORS.navyLight }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link
                to="/"
                onClick={(e) => {
                  handleScrollClick(e, "categories");
                  setMobileMenuOpen(false);
                }}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Categories
              </Link>
              <Link
                to="/"
                onClick={(e) => {
                  handleScrollClick(e, "gigs");
                  setMobileMenuOpen(false);
                }}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Browse Gigs
              </Link>
              {user ? (
                <>
                  <Link
                    to="/create-gig"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 bg-navyLight text-white font-semibold rounded-lg flex items-center gap-2"
                    style={{ backgroundColor: COLORS.navyLight }}
                  >
                    <Plus size={18} />
                    Post a Gig
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 font-semibold flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-navyLight font-semibold"
                    style={{ color: COLORS.navyLight }}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      navigate("/signup");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-navyLight text-white font-semibold rounded-lg px-4 py-2"
                    style={{ backgroundColor: COLORS.navyLight }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-6xl mx-auto">
          <div
            data-animate
            id="hero"
            className={`text-center mb-12 transition-all duration-1000 ${
              visible["hero"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Welcome Back,{" "}
              <span style={{ color: COLORS.navyLight }}>
                {user?.name?.split(" ")[0] || "Guest"}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              {user?.role === "Seller"
                ? "Showcase your skills and start earning with gigs!"
                : user?.role === "Buyer"
                ? "Hire talented students for your projects!"
                : "Discover or offer services in your campus community!"}
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto flex gap-3"
            >
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for gigs, skills, or services..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-navyLight transition"
                  style={{ borderColor: COLORS.gray200 }}
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-navyLight text-white font-bold rounded-xl hover:bg-navy transition"
                style={{ backgroundColor: COLORS.navyLight }}
              >
                Search
              </button>
            </form>
          </div>

          {/* User Stats */}
          {user && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Star, label: "Rating", value: user.rating || "N/A" },
                {
                  icon: Briefcase,
                  label: "Completed",
                  value: user.completedGigs || 0,
                },
                {
                  icon: TrendingUp,
                  label: "Earnings",
                  value: user.earnings ? formatINR(user.earnings) : "₹0",
                },
                { icon: Award, label: "Badge", value: user.badge || "New" },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    data-animate
                    className={`p-4 bg-white border-2 border-gray-100 rounded-xl transition-all duration-1000 ${
                      visible["hero"]
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-10"
                    }`}
                    style={{ transitionDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Icon
                          className="text-navyLight"
                          size={24}
                          style={{ color: COLORS.navyLight }}
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <p className="text-xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <SectionDivider />

      {/* CATEGORIES SECTION */}
      <section id="categories" data-animate className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div
            className={`mb-16 transition-all duration-1000 ${
              visible["categories"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ color: COLORS.navy }}
            >
              Explore Categories
            </h2>
            <p className="text-lg text-gray-600">
              Browse thousands of gigs across different categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const Icon =
                {
                  "Web Development": Code,
                  "Graphic Design": PenTool,
                  Tutoring: BookOpen,
                  "Content Writing": Lightbulb,
                  "Digital Marketing": TrendingUp,
                  "Video Editing": Smile,
                }[cat] || Users;

              return (
                <Link
                  key={cat}
                  to={`/gigs?category=${encodeURIComponent(cat)}`}
                  data-animate
                  className={`group p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl hover:border-navyLight hover:shadow-lg transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                    visible["categories"]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{
                    borderColor: COLORS.gray200,
                    transitionDelay: `${idx * 80}ms`,
                  }}
                >
                  <div
                    className="w-16 h-16 bg-gradient-to-br from-navyLight to-navy rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                    style={{
                      background: `linear-gradient(to bottom right, ${COLORS.navyLight}, ${COLORS.navy})`,
                    }}
                  >
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3
                    className="font-bold text-gray-900 text-center mb-1 group-hover:text-navyLight"
                    style={{ color: COLORS.navy }}
                  >
                    {cat}
                  </h3>
                  <p className="text-sm text-gray-500 text-center">gigs</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* FEATURED GIGS SECTION */}
      <section
        id="gigs"
        data-animate
        className="py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div className="max-w-6xl mx-auto">
          <div
            className={`flex justify-between items-start mb-16 transition-all duration-1000 ${
              visible["gigs"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div>
              <h2
                className="text-4xl font-bold text-gray-900 mb-4"
                style={{ color: COLORS.navy }}
              >
                Featured Gigs
              </h2>
              <p className="text-lg text-gray-600">
                Top opportunities tailored for you
              </p>
            </div>
            <Link
              to="/gigs"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-navyLight text-navyLight font-bold rounded-xl hover:bg-gray-50 transition"
              style={{ borderColor: COLORS.navyLight, color: COLORS.navyLight }}
            >
              View All
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {gigs.map((gig, idx) => {
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
                  data-animate
                  className={`group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-navyLight hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    visible["gigs"]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{
                    borderColor: COLORS.gray200,
                    transitionDelay: `${idx * 100}ms`,
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-gray-100 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(to bottom right, #E0E7FF, ${COLORS.gray100})`,
                        }}
                      >
                        <Icon
                          className="text-navyLight"
                          size={28}
                          style={{ color: COLORS.navyLight }}
                        />
                      </div>
                      <div>
                        <h3
                          className="text-lg font-bold text-gray-900"
                          style={{ color: COLORS.navy }}
                        >
                          {gig.title}
                        </h3>
                        <p className="text-sm text-gray-500">{gig.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(gig._id)}
                      className="p-2 hover:bg-gray-50 rounded-lg transition"
                    >
                      <Heart
                        size={24}
                        className={`transition ${
                          isFavorited
                            ? "fill-red-500 text-red-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  </div>

                  <p
                    className="text-3xl font-bold mb-4"
                    style={{ color: COLORS.navyLight }}
                  >
                    {formatINR(gig.price)}
                  </p>

                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                        {gig.sellerName?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {gig.sellerName}
                        </p>
                        {gig.rating && (
                          <div className="flex items-center gap-1">
                            <Star
                              className="text-yellow-400 fill-yellow-400"
                              size={14}
                            />
                            <span className="text-sm text-gray-600">
                              {gig.rating} ({gig.reviews || 0} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {status && (
                    <p
                      className={`text-sm font-semibold mb-3 ${
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
                    <span className="block w-full px-6 py-3 bg-gray-200 text-gray-600 rounded-xl text-center font-medium">
                      Applications Closed
                    </span>
                  ) : status ? (
                    <span className="block w-full px-6 py-3 bg-gray-200 text-gray-600 rounded-xl text-center font-medium">
                      Application Submitted
                    </span>
                  ) : (
                    <Link
                      to={`/gigs/${gig._id}`}
                      className="block w-full px-6 py-3 bg-navyLight text-white font-bold rounded-xl hover:bg-navy transition-all transform hover:scale-105"
                      style={{ backgroundColor: COLORS.navyLight }}
                    >
                      View Details
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12 md:hidden">
            <Link
              to="/gigs"
              className="px-8 py-3 bg-navyLight text-white font-bold rounded-xl hover:bg-navy transition"
              style={{ backgroundColor: COLORS.navyLight }}
            >
              View All Gigs
            </Link>
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* STATS SECTION */}
      <section id="stats" data-animate className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visible["stats"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ color: COLORS.navy }}
            >
              Platform Statistics
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by thousands of students and clients
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, label: "Active Gigs", value: "2,450+" },
              { icon: Users, label: "Talented Students", value: "5,000+" },
              { icon: CheckCircle, label: "Projects Done", value: "10,000+" },
              { icon: Star, label: "Avg Rating", value: "4.9/5" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  data-animate
                  className={`p-8 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl hover:border-navyLight hover:shadow-lg transition-all duration-500 text-center transform hover:scale-105 ${
                    visible["stats"]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{
                    borderColor: COLORS.gray200,
                    transitionDelay: `${idx * 100}ms`,
                  }}
                >
                  <div
                    className="w-16 h-16 bg-gradient-to-br from-navyLight to-navy rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: `linear-gradient(to bottom right, ${COLORS.navyLight}, ${COLORS.navy})`,
                    }}
                  >
                    <Icon className="text-white" size={32} />
                  </div>
                  <p
                    className="text-4xl font-bold mb-2"
                    style={{ color: COLORS.navyLight }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-lg text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* CTA SECTION */}
      <section
        className="py-20 px-4"
        style={{
          background: `linear-gradient(to right, ${COLORS.navyLight}, ${COLORS.navy})`,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div
            data-animate
            id="cta"
            className={`transition-all duration-1000 ${
              visible["cta"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Post Your First Gig?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Share your skills and start earning with GigConnect today. It
              takes just 5 minutes.
            </p>
            <Link
              to="/create-gig"
              className="px-10 py-4 bg-white text-navyLight font-bold rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
              style={{ color: COLORS.navyLight }}
            >
              Post Your First Gig
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer></Footer>
    </div>
  );
};

export default Home;
