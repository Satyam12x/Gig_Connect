import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
  Heart,
  Clock,
  Star,
  TrendingUp,
  Briefcase,
  Zap,
  Ticket,
  MessageSquare,
  Loader2,
  Package,
  CheckCircle,
  Lock,
  Unlock,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const PLACEHOLDER_IMG =
  "https://via.placeholder.com/400x300?text=Gig+Thumbnail";

// Status Badge Component
const GigStatusBadge = ({ status }) => {
  const config = {
    open: {
      color: "bg-green-100 text-green-700",
      icon: Unlock,
      label: "Open",
    },
    in_progress: {
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
      label: "In Progress",
    },
    closed: {
      color: "bg-gray-100 text-gray-600",
      icon: Lock,
      label: "Closed",
    },
    completed: {
      color: "bg-blue-100 text-blue-700",
      icon: CheckCircle,
      label: "Completed",
    },
  };

  const cfg = config[status] || config.open;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${cfg.color}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const Gigs = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [applications, setApplications] = useState({});
  const [tickets, setTickets] = useState({});
  const [isApplying, setIsApplying] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const getToken = () => localStorage.getItem("token");

  // Initial Token Decode
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.id);
        setRole(payload.role);
        const saved = localStorage.getItem(`favorites_${payload.id}`);
        if (saved) setFavorites(JSON.parse(saved));
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
        });
        if (selectedCategory) params.append("category", selectedCategory);
        if (searchTerm) params.append("search", searchTerm);

        const [gigsRes, catsRes] = await Promise.all([
          fetch(`${API_BASE}/gigs?${params}`),
          fetch(`${API_BASE}/categories`),
        ]);

        if (!gigsRes.ok) throw new Error("Failed to fetch gigs");

        const gigsData = await gigsRes.json();
        const catsData = await catsRes.json();

        setGigs(gigsData.gigs || []);
        setTotalPages(gigsData.pages || 1);
        setCategories(catsData.categories || []);

        // User Data
        if (token && userId) {
          try {
            const [profileRes, appsRes, ticketsRes] = await Promise.all([
              fetch(`${API_BASE}/users/profile`, { headers }),
              fetch(`${API_BASE}/users/${userId}/applications`, { headers }),
              fetch(`${API_BASE}/users/${userId}/tickets`, { headers }),
            ]);

            if (profileRes.ok) {
              const profileData = await profileRes.json();
              setUser(profileData);
              if (profileData.role) setRole(profileData.role);
            }

            if (appsRes.ok) {
              const appsData = await appsRes.json();
              const appMap = {};
              if (Array.isArray(appsData)) {
                appsData.forEach((app) => {
                  const gId = app.gigId?._id || app.gigId;
                  if (gId) appMap[gId] = app.status;
                });
              }
              setApplications(appMap);
            }

            if (ticketsRes.ok) {
              const ticketsData = await ticketsRes.json();
              const ticketMap = {};
              if (Array.isArray(ticketsData)) {
                ticketsData.forEach((ticket) => {
                  const gId = ticket.gigId?._id || ticket.gigId;
                  if (gId) ticketMap[gId] = ticket;
                });
              }
              setTickets(ticketMap);
            }
          } catch (userErr) {
            console.warn("User data fetch failed:", userErr);
          }
        }
      } catch (error) {
        console.error("Error fetching gigs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, selectedCategory, searchTerm, userId]);

  const handleApply = async (gigId) => {
    if (!userId) {
      alert("Please login first!");
      return navigate("/login");
    }
    if (role === "Provider") {
      alert("Only Freelancers can apply to gigs!");
      return;
    }

    setIsApplying((prev) => ({ ...prev, [gigId]: true }));
    try {
      const res = await fetch(`${API_BASE}/gigs/${gigId}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (res.ok) {
        alert("Applied successfully! Redirecting to ticket...");
        setApplications((prev) => ({ ...prev, [gigId]: "pending" }));
        if (data.ticketId) {
          navigate(`/tickets/${data.ticketId}`);
        }
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch (err) {
      console.error("Apply error:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsApplying((prev) => ({ ...prev, [gigId]: false }));
    }
  };

  const handleToggleFavorite = (e, gigId) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = favorites.includes(gigId)
      ? favorites.filter((id) => id !== gigId)
      : [...favorites, gigId];
    setFavorites(updated);
    if (userId)
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(updated));
  };

  const filteredGigs = useMemo(() => {
    let list = showSavedOnly
      ? gigs.filter((g) => favorites.includes(g._id))
      : gigs;

    if (priceFilter !== "all") {
      list = list.filter((g) => {
        if (priceFilter === "low") return g.price < 10000;
        if (priceFilter === "medium")
          return g.price >= 10000 && g.price <= 50000;
        if (priceFilter === "high") return g.price > 50000;
        return true;
      });
    }

    if (sortBy === "price-low") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return list;
  }, [gigs, favorites, showSavedOnly, priceFilter, sortBy]);

  const GigCard = ({ gig }) => {
    const ticket = tickets[gig._id];
    const isOwner = gig.providerId === userId;
    const status = applications[gig._id];
    const isFavorited = favorites.includes(gig._id);
    const isClosed = gig.status === "closed";
    const isInProgress = gig.status === "in_progress";

    return (
      <div
        className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full border border-gray-200 hover:border-[#1A2A4F] ${
          isClosed ? "opacity-80" : ""
        }`}
      >
        {/* Image */}
        <div className="relative h-48 sm:h-56 overflow-hidden group">
          <img
            src={gig.thumbnail || PLACEHOLDER_IMG}
            alt={gig.title}
            onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {/* Category */}
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-[#1A2A4F]/90 backdrop-blur-sm text-white rounded-full text-xs font-bold shadow-lg">
            {gig.category}
          </div>

          {/* Status Badge on Image */}
          {(isClosed || isInProgress) && (
            <div
              className={`absolute top-3 right-14 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                isClosed ? "bg-gray-800 text-white" : "bg-yellow-500 text-white"
              }`}
            >
              {isClosed ? (
                <>
                  <Lock className="h-3 w-3" /> Closed
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" /> In Progress
                </>
              )}
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => handleToggleFavorite(e, gig._id)}
            className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full transition-all shadow-lg hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-700"
              }`}
            />
          </button>

          {/* Price Badge */}
          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-[#1A2A4F] font-bold shadow-lg">
            ₹{gig.price.toLocaleString("en-IN")}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1">
          {/* Title & Status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-[#1A2A4F] line-clamp-2 leading-tight flex-1">
              {gig.title}
            </h3>
            <GigStatusBadge status={gig.status || "open"} />
          </div>

          {/* Provider Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 rounded-full bg-[#1A2A4F] text-white flex items-center justify-center text-xs font-bold">
              {gig.providerName?.[0] || "P"}
            </div>
            <span className="font-medium truncate">
              {gig.providerName || "Unknown"}
            </span>
            {gig.rating > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{gig.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-gray-500 text-xs mt-auto pt-3 border-t border-gray-100">
            <Clock className="h-4 w-4" />
            <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            {isOwner ? (
              // Owner
              <Link
                to={`/gigs/${gig._id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:bg-[#152241] transition-colors"
              >
                <Briefcase className="h-4 w-4" /> Manage
              </Link>
            ) : ticket ? (
              // Has Ticket
              <Link
                to={`/tickets/${ticket._id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                <Ticket className="h-4 w-4" />
                View Ticket
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : isClosed ? (
              // Closed
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 bg-gray-200 text-gray-500 rounded-xl font-semibold py-3">
                  <Lock className="h-4 w-4" /> Closed
                </div>
                <Link
                  to={`/gigs/${gig._id}`}
                  className="text-center text-sm text-[#1A2A4F] font-semibold hover:underline"
                >
                  View Details
                </Link>
              </div>
            ) : isInProgress ? (
              // In Progress
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold py-3">
                  <Clock className="h-4 w-4" /> In Progress
                </div>
                <Link
                  to={`/gigs/${gig._id}`}
                  className="text-center text-sm text-[#1A2A4F] font-semibold hover:underline"
                >
                  View Details
                </Link>
              </div>
            ) : status ? (
              // Applied
              <div className="flex-1 flex flex-col gap-2">
                <div
                  className={`px-4 py-2.5 rounded-xl text-center font-semibold text-sm flex items-center justify-center gap-2 ${
                    status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {status === "accepted" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : status === "rejected" ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <Link
                  to={`/gigs/${gig._id}`}
                  className="text-center text-sm text-[#1A2A4F] font-semibold hover:underline flex items-center justify-center gap-1"
                >
                  View Details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              // Can Apply
              <button
                onClick={() => handleApply(gig._id)}
                disabled={isApplying[gig._id]}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:bg-[#152241] transition-colors disabled:opacity-70"
              >
                {isApplying[gig._id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1A2A4F] via-[#243454] to-[#1A2A4F] pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight">
            Find Your Next Gig
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Browse opportunities, apply with one click, and start earning
          </p>
          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Package className="text-white" />
              <div className="text-left text-white">
                <div className="font-bold text-xl">{gigs.length}+</div>
                <div className="text-xs opacity-80">Active Gigs</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Users className="text-white" />
              <div className="text-left text-white">
                <div className="font-bold text-xl">{categories.length}</div>
                <div className="text-xs opacity-80">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search gigs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#1A2A4F] focus:outline-none text-lg"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-xl whitespace-nowrap border-2 font-semibold transition-all flex-shrink-0 ${
                selectedCategory === ""
                  ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1A2A4F]"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? "" : cat)
                }
                className={`px-4 py-2 rounded-xl whitespace-nowrap border-2 font-semibold transition-all flex-shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1A2A4F]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Filter Row */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white font-medium focus:outline-none focus:border-[#1A2A4F]"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white font-medium focus:outline-none focus:border-[#1A2A4F]"
            >
              <option value="all">All Prices</option>
              <option value="low">Under ₹10,000</option>
              <option value="medium">₹10,000 - ₹50,000</option>
              <option value="high">Above ₹50,000</option>
            </select>

            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`px-4 py-2 rounded-xl border-2 font-medium flex items-center gap-2 transition-all ${
                showSavedOnly
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${showSavedOnly ? "fill-red-500" : ""}`}
              />
              Saved ({favorites.length})
            </button>
          </div>
        </div>

        {/* Gig Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#1A2A4F] mx-auto mb-4" />
            <p className="text-gray-600">Loading amazing opportunities...</p>
          </div>
        ) : filteredGigs.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No gigs found</p>
            <p className="text-gray-400">
              Try adjusting your filters or search term
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-3 rounded-xl border-2 border-gray-200 hover:border-[#1A2A4F] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-semibold text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-3 rounded-xl border-2 border-gray-200 hover:border-[#1A2A4F] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Gigs;
