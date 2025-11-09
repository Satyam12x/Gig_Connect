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
  Quote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const COLORS = {
  blue: "#1E40AF",
  blueLight: "#3B82F6",
  cyan: "#06B6D4",
  cyanLight: "#67E8F9",
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
    <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40" />
  </div>
);

/* ---------- MAIN HOME ---------- */
const Home = () => {
  const navigate = useNavigate();
  const visible = useScrollAnimation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());

  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        const [userRes, gigsRes, appsRes] = await Promise.all([
          axios.get(`${API_BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/gigs/recent`),
          axios.get(`${API_BASE}/users/${userId}/applications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userRes.data);
        setGigs(gigsRes.data.slice(0, 4));
        setApplications(appsRes.data);
        setLoading(false);
      } catch (e) {
        console.error(e);
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
    newFavs.has(gigId) ? newFavs.delete(gigId) : newFavs.add(gigId);
    setFavorites(newFavs);
  };

  const getApplicationStatus = (gigId) =>
    applications.find((a) => a.gigId._id === gigId)?.status || null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4"
            size={48}
            style={{ color: COLORS.cyan }}
          />
          <p className="font-medium" style={{ color: COLORS.blue }}>
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
    <div className="min-h-screen bg-white">
      <style>
        {`
          @keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(.9)} }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}
      </style>

      {/* NAVBAR */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 opacity-15">
            <div className="w-full h-full bg-gradient-to-br from-cyan-300 via-cyan-200 to-cyan-400 blur-3xl animate-blob" />
          </div>
          <div className="absolute bottom-[-15%] left-[-8%] w-80 h-80 opacity-10">
            <div className="w-full h-full bg-gradient-to-tr from-cyan-200 via-cyan-300 to-cyan-500 blur-3xl animate-blob animation-delay-2000" />
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto">
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
              <span style={{ color: COLORS.cyan }}>
                {user?.name?.split(" ")[0] || "Guest"}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              {user?.role === "Seller"
                ? "Showcase your skills and start earning!"
                : user?.role === "Buyer"
                ? "Hire talented students for your projects!"
                : "Discover or offer services in your campus community!"}
            </p>

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
                  onChange={(e) => setSearchQuery(e.value)}
                  placeholder="Search gigs, skills, services..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan transition"
                  style={{ borderColor: COLORS.gray200 }}
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-cyan text-white font-bold rounded-xl hover:bg-cyan-600 transition"
                style={{ backgroundColor: COLORS.cyan }}
              >
                Search
              </button>
            </form>
          </div>

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
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    data-animate
                    className={`p-4 bg-white border-2 border-gray-100 rounded-xl transition-all duration-1000 ${
                      visible["hero"]
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-10"
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <Icon
                          className="text-cyan"
                          size={24}
                          style={{ color: COLORS.cyan }}
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

      {/* FEATURED GIGS SECTION */}
      <section id="gigs" data-animate className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-12 transition-all duration-1000 ${
              visible["gigs"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl font-bold text-gray-900 relative inline-block">
              Featured Gigs
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-cyan-500 rounded-full"></span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {gigs.map((gig, i) => {
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
                  className={`group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-cyan hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    visible["gigs"]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{
                    borderColor: COLORS.gray200,
                    transitionDelay: `${i * 100}ms`,
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                        <Icon
                          className="text-cyan"
                          size={28}
                          style={{ color: COLORS.cyan }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
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
                    style={{ color: COLORS.cyan }}
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
                      className="block w-full px-6 py-3 bg-gradient-to-r from-cyan to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.cyan}, ${COLORS.blue})`,
                      }}
                    >
                      View Details
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/gigs"
              className="px-8 py-3 bg-cyan text-white font-bold rounded-xl hover:bg-cyan-600 transition"
              style={{ backgroundColor: COLORS.cyan }}
            >
              View All Gigs
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* TESTIMONIALS SECTION */}
      <section
        data-animate
        className="py-20 px-4 bg-gradient-to-br from-blue-50 to-cyan-50"
      >
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-12 transition-all duration-1000 ${
              visible["testimonials"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            id="testimonials"
          >
            <h2 className="text-4xl font-bold text-gray-900 relative inline-block">
              What Our Users Say
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-cyan-500 rounded-full"></span>
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${0 * 100}%)` }}
              >
                {[
                  {
                    quote:
                      "Gig Connect connected me with a talented student developer who built my website in record time!",
                    author: "Satyam Pandey",
                    role: "Small Business Owner",
                  },
                  {
                    quote:
                      "As a student, I showcased my graphic design portfolio and landed my first freelance gig within a week.",
                    author: "Apoorva Sharma",
                    role: "Computer Science Student",
                  },
                  {
                    quote:
                      "The platform's focus on local campus talent made collaboration seamless and trustworthy.",
                    author: "Priya Gupta",
                    role: "Marketing Coordinator",
                  },
                ].map((t, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4">
                    <div className="group relative bg-white p-10 rounded-3xl shadow-xl border border-gray-200 hover:border-cyan transition-all duration-300">
                      <div className="absolute inset-0 bg-cyan-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-cyan flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                          <Quote className="text-white" size={32} />
                        </div>
                        <p className="text-xl text-gray-700 mb-8 italic leading-relaxed text-center">
                          "{t.quote}"
                        </p>
                        <div className="text-center">
                          <p className="text-cyan font-bold text-lg mb-1">
                            {t.author}
                          </p>
                          <p className="text-gray-600">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-cyan hover:text-white transition-all">
              <ChevronLeft size={24} />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-cyan hover:text-white transition-all">
              <ChevronRight size={24} />
            </button>

            <div className="flex justify-center mt-8 space-x-3">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === 0
                      ? "w-8 bg-cyan"
                      : "w-2 bg-gray-300 hover:bg-cyan-400"
                  }`}
                  style={{ backgroundColor: i === 0 ? COLORS.cyan : undefined }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;
