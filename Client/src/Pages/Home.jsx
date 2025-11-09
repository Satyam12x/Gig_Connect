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
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const COLORS = {
  cyan: "#06B6D4",
  blue: "#1E40AF",
  gray200: "#E5E7EB",
  gray600: "#4B5563",
  red500: "#EF4444",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const fetchData = async () => {
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
      } catch (e) {
        console.error(e);
        setError(e.response?.data?.error || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <div className="text-center max-w-md">
          <AlertTriangle
            size={48}
            className="mx-auto mb-4"
            style={{ color: COLORS.red500 }}
          />
          <p className="font-medium text-lg" style={{ color: COLORS.red500 }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-lg text-white"
            style={{ backgroundColor: COLORS.cyan }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* HERO */}
      <section className="pt-20 pb-12 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Welcome back,{" "}
            <span style={{ color: COLORS.cyan }}>
              {user?.fullName?.split(" ")[0] || "Guest"}
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {user?.role === "Seller"
              ? "Showcase your skills and start earning!"
              : user?.role === "Buyer"
              ? "Hire talented students for your projects!"
              : "Explore campus services"}
          </p>

          {/* SEARCH */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gigs, skills, services..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-cyan"
                style={{ borderColor: COLORS.gray200 }}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: COLORS.cyan }}
            >
              Search
            </button>
          </form>

          {/* USER STATS */}
          {user && (
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Star,
                  label: "Rating",
                  value: user.rating ? user.rating.toFixed(1) : "N/A",
                },
                {
                  icon: Briefcase,
                  label: "Completed",
                  value: user.completedGigs || 0,
                },
                {
                  icon: TrendingUp,
                  label: "Earnings",
                  value: formatINR(user.earnings || 0),
                },
                { icon: Award, label: "Badge", value: user.badge || "New" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="p-4 bg-white border rounded-lg flex items-center gap-3"
                    style={{ borderColor: COLORS.gray200 }}
                  >
                    <div className="w-10 h-10 bg-cyan-50 rounded flex items-center justify-center">
                      <Icon size={20} style={{ color: COLORS.cyan }} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="font-semibold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <hr className="my-8 border-gray-200" />

      {/* FEATURED GIGS */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Featured Gigs
          </h2>

          {gigs.length === 0 ? (
            <p className="text-center text-gray-600">
              No gigs available.{" "}
              <Link
                to="/gigs"
                className="underline"
                style={{ color: COLORS.cyan }}
              >
                View all
              </Link>
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
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
                    className="p-6 bg-white border rounded-xl hover:border-cyan transition"
                    style={{ borderColor: COLORS.gray200 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                          <Icon size={24} style={{ color: COLORS.cyan }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {gig.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {gig.category}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavorite(gig._id)}
                        className="p-1 rounded hover:bg-gray-100 transition"
                      >
                        <Heart
                          size={22}
                          className={
                            isFavorited
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }
                        />
                      </button>
                    </div>

                    <p
                      className="text-2xl font-bold mb-3"
                      style={{ color: COLORS.cyan }}
                    >
                      {formatINR(gig.price)}
                    </p>

                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                        {gig.sellerName?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {gig.sellerName}
                        </p>
                        {gig.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star
                              className="fill-yellow-400 text-yellow-400"
                              size={14}
                            />
                            {gig.rating} ({gig.reviews || 0} reviews)
                          </div>
                        )}
                      </div>
                    </div>

                    {status && (
                      <p
                        className={`text-sm font-medium mb-3 ${
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
                      <span className="block w-full text-center py-2 bg-gray-200 text-gray-600 rounded-lg">
                        Applications Closed
                      </span>
                    ) : status ? (
                      <span className="block w-full text-center py-2 bg-gray-200 text-gray-600 rounded-lg">
                        Application Submitted
                      </span>
                    ) : (
                      <Link
                        to={`/gigs/${gig._id}`}
                        className="block w-full text-center py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: COLORS.cyan }}
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/gigs"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: COLORS.cyan }}
            >
              View All Gigs <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <hr className="my-8 border-gray-200" />

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;
