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
  Sparkles,
  Zap,
  Grid,
  List,
  AlertCircle,
  Ticket,
  MessageSquare,
  Loader2,
  RefreshCw,
  Package,
  PlusCircle,
  CheckCircle,
  XCircle,
  Lock,
  Bookmark,
  Eye,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const PLACEHOLDER_IMG = "/api/placeholder/400/300";

const Gigs = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [featuredGigs, setFeaturedGigs] = useState([]);
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
  const [viewMode, setViewMode] = useState("grid");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const getToken = () => localStorage.getItem("token");

  // 1. Initial Token Decode
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

  // 2. Fetch Real Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = getToken();
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
        });
        if (selectedCategory) params.append("category", selectedCategory);
        if (searchTerm) params.append("search", searchTerm);

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [gigsRes, catsRes, recentRes, profileRes, appsRes, ticketsRes] =
          await Promise.all([
            fetch(`${API_BASE}/gigs?${params}`),
            fetch(`${API_BASE}/categories`),
            fetch(`${API_BASE}/gigs/recent`),
            token ? fetch(`${API_BASE}/users/profile`, { headers }) : null,
            token && userId
              ? fetch(`${API_BASE}/users/${userId}/applications`, { headers })
              : null,
            token && userId
              ? fetch(`${API_BASE}/users/${userId}/tickets`, { headers })
              : null,
          ]);

        const [
          gigsData,
          catsData,
          recentData,
          profileData,
          appsData,
          ticketsData,
        ] = await Promise.all([
          gigsRes.json(),
          catsRes.json(),
          recentRes.json(),
          profileRes ? profileRes.json() : null,
          appsRes ? appsRes.json() : null,
          ticketsRes ? ticketsRes.json() : null,
        ]);

        setGigs(gigsData.gigs || []);
        setTotalPages(gigsData.pages || 1);
        setCategories(catsData.categories || []);
        setFeaturedGigs((recentData.gigs || recentData)?.slice(0, 3) || []);

        if (profileData) {
          setUser(profileData);
          if (profileData.role) {
            setRole(profileData.role);
          }
        }

        const appMap = {};
        if (Array.isArray(appsData)) {
          appsData.forEach((app) => {
            const gId = app.gigId?._id || app.gigId;
            if (gId) appMap[gId] = app.status;
          });
        }
        setApplications(appMap);

        const ticketMap = {};
        if (Array.isArray(ticketsData)) {
          ticketsData.forEach((ticket) => {
            const gId = ticket.gigId?._id || ticket.gigId;
            if (gId) ticketMap[gId] = ticket;
          });
        }
        setTickets(ticketMap);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const handleToggleFavorite = (gigId) => {
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

  const isFilterActive =
    selectedCategory ||
    searchTerm ||
    showSavedOnly ||
    priceFilter !== "all" ||
    sortBy !== "newest";

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setShowSavedOnly(false);
    setPriceFilter("all");
    setSortBy("newest");
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-50 border-yellow-200",
        text: "text-yellow-700",
        icon: <AlertCircle className="h-4 w-4" />,
        label: "Pending Review",
      },
      accepted: {
        bg: "bg-green-50 border-green-200",
        text: "text-green-700",
        icon: <CheckCircle className="h-4 w-4" />,
        label: "Accepted",
      },
      rejected: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-700",
        icon: <XCircle className="h-4 w-4" />,
        label: "Rejected",
      },
    };
    return badges[status] || null;
  };

  const GigCard = ({ gig, isFeatured = false }) => {
    const status = applications[gig._id];
    const ticket = tickets[gig._id];
    const isOwner = gig.providerId === userId;
    const isFavorited = favorites.includes(gig._id);
    const statusBadge = status ? getStatusBadge(status) : null;
    const isClosed = gig.status === "closed";

    return (
      <div
        className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full ${
          isFeatured
            ? "border-2 border-[#1A2A4F] shadow-lg"
            : "border border-gray-200 hover:border-[#1A2A4F]"
        } ${isClosed ? "opacity-80 grayscale-[50%]" : ""}`}
      >
        <div className="relative h-48 sm:h-56 overflow-hidden group">
          <img
            src={gig.thumbnail || PLACEHOLDER_IMG}
            alt={gig.title}
            onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {isFeatured && !isClosed && (
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-lg">
              <Sparkles className="h-3 w-3" /> Featured
            </div>
          )}

          {isClosed && (
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-white rounded-full text-xs font-bold shadow-lg">
              <Lock className="h-3 w-3" /> Closed
            </div>
          )}

          <div className="absolute top-3 left-3 px-3 py-1.5 bg-[#1A2A4F]/90 backdrop-blur-sm text-white rounded-full text-xs font-bold shadow-lg">
            {gig.category}
          </div>

          {statusBadge && (
            <div
              className={`absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border ${statusBadge.bg} ${statusBadge.text}`}
            >
              {statusBadge.icon}
              {statusBadge.label}
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              handleToggleFavorite(gig._id);
            }}
            className="absolute bottom-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full transition-all shadow-lg hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-700"
              }`}
            />
          </button>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-[#1A2A4F] line-clamp-2 leading-tight">
            {gig.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium truncate">
              {gig.providerName || gig.sellerName || "Provider"}
            </span>
            {gig.rating > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{gig.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed flex-1">
            {gig.description}
          </p>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                Budget
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#1A2A4F]">
                ₹{gig.price.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Clock className="h-4 w-4" />
              <span>
                {gig.createdAt
                  ? new Date(gig.createdAt).toLocaleDateString()
                  : "Recently"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {isOwner ? (
              <Link
                to={`/gigs/${gig._id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:bg-[#152241] transition-colors"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Manage</span>
                <span className="sm:hidden">Manage</span>
              </Link>
            ) : isClosed ? (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
              >
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Closed</span>
                <span className="sm:hidden">Closed</span>
              </button>
            ) : ticket ? (
              <Link
                to={`/tickets/${ticket._id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">View Ticket</span>
                <span className="sm:hidden">Ticket</span>
              </Link>
            ) : status ? (
              <div
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border-2 ${statusBadge?.bg} ${statusBadge?.text}`}
              >
                {statusBadge?.icon}
                <span className="hidden sm:inline">{statusBadge?.label}</span>
                <span className="sm:hidden">{status}</span>
              </div>
            ) : (
              <button
                onClick={() => handleApply(gig._id)}
                disabled={isApplying[gig._id]}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:bg-[#152241] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isApplying[gig._id] ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Applying...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Apply Now</span>
                    <span className="sm:hidden">Apply</span>
                  </>
                )}
              </button>
            )}
            <Link
              to={`/gigs/${gig._id}`}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Details</span>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="relative bg-gradient-to-br from-[#1A2A4F] via-[#243454] to-[#1A2A4F] pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight">
            Discover Your Next
            <br className="sm:hidden" /> Opportunity
          </h1>
          <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
            Connect with top gigs, filter by category, and find the perfect
            match for your skills
          </p>

          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {gigs.length}+
                </div>
                <div className="text-xs sm:text-sm text-white/80">
                  Active Gigs
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {categories.length}+
                </div>
                <div className="text-xs sm:text-sm text-white/80">
                  Categories
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-200 rounded-xl sm:rounded-2xl bg-white focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 transition-all"
              />
            </div>

            {userId && (
              <>
                <div className="hidden sm:flex gap-3">
                  {role === "Provider" && (
                    <Link
                      to="/create-gig"
                      className="flex items-center justify-center gap-2 px-5 py-4 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <PlusCircle className="h-5 w-5" /> Post a Gig
                    </Link>
                  )}
                  <Link
                    to="/tickets"
                    className="flex items-center justify-center gap-2 px-5 py-4 bg-[#1A2A4F] text-white rounded-2xl font-semibold hover:bg-[#152241] transition-colors shadow-sm"
                  >
                    <Ticket className="h-5 w-5" /> My Tickets
                  </Link>
                </div>

                <div className="sm:hidden flex gap-2">
                  {role === "Provider" && (
                    <Link
                      to="/create-gig"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold"
                    >
                      <PlusCircle className="h-5 w-5" /> Post
                    </Link>
                  )}
                  <Link
                    to="/tickets"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold"
                  >
                    <Ticket className="h-5 w-5" /> Tickets
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-sm"
            >
              <Filter size={18} />
              Filters
              {isFilterActive && (
                <span className="flex h-2 w-2 rounded-full bg-[#1A2A4F]"></span>
              )}
            </button>
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                <X size={18} />
                <span className="hidden sm:inline">Clear Filters</span>
              </button>
            )}
          </div>

          <div
            className={`${
              showFilters ? "flex" : "hidden sm:flex"
            } flex-wrap gap-3 items-center`}
          >
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 sm:px-5 py-2 sm:py-3 border-2 border-gray-200 rounded-xl bg-white font-semibold text-xs sm:text-sm cursor-pointer hover:border-[#1A2A4F] transition-colors"
            >
              <option value="all">All Prices</option>
              <option value="low">Under ₹10K</option>
              <option value="medium">₹10K - ₹50K</option>
              <option value="high">Above ₹50K</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 sm:px-5 py-2 sm:py-3 border-2 border-gray-200 rounded-xl bg-white font-semibold text-xs sm:text-sm cursor-pointer hover:border-[#1A2A4F] transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {userId && (
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 border-2 rounded-xl font-semibold text-xs sm:text-sm transition-colors ${
                  showSavedOnly
                    ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#1A2A4F]"
                }`}
              >
                <Bookmark
                  size={18}
                  className={showSavedOnly ? "fill-white" : ""}
                />
                <span className="hidden sm:inline">
                  Saved ({favorites.length})
                </span>
                <span className="sm:hidden">({favorites.length})</span>
              </button>
            )}

            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 sm:p-3 border-2 rounded-xl transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#1A2A4F]"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 sm:p-3 border-2 rounded-xl transition-colors ${
                  viewMode === "list"
                    ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#1A2A4F]"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 sm:mb-10">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <button
              onClick={() => {
                setSelectedCategory("");
                setPage(1);
              }}
              className={`px-4 sm:px-6 py-2 sm:py-3 border-2 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                selectedCategory === ""
                  ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#1A2A4F]"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-4 sm:px-6 py-2 sm:py-3 border-2 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#1A2A4F]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {featuredGigs.length > 0 && !isFilterActive && (
          <div className="mb-10 sm:mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={28} className="text-[#1A2A4F]" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A2A4F]">
                Featured Gigs
              </h2>
            </div>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  : "space-y-4 sm:space-y-6"
              }
            >
              {featuredGigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} isFeatured={true} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A2A4F]">
              {selectedCategory
                ? `${selectedCategory} Gigs`
                : showSavedOnly
                ? "Saved Gigs"
                : "All Available Gigs"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">{filteredGigs.length}</span>
              <span>gigs found</span>
            </div>
          </div>

          {isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  : "space-y-4 sm:space-y-6"
              }
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                >
                  <div className="h-48 sm:h-56 bg-gray-200 animate-pulse"></div>
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="flex gap-2 mt-6">
                      <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                      <div className="w-20 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredGigs.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-6">
                <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-3">
                No gigs found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                {showSavedOnly
                  ? "You haven't saved any gigs yet"
                  : "Try adjusting your filters or search terms"}
              </p>
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:bg-[#152241] transition-colors"
                >
                  <RefreshCw size={18} />
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  : "space-y-4 sm:space-y-6"
              }
            >
              {filteredGigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          )}
        </div>

        {!isLoading && totalPages > 1 && filteredGigs.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-10 sm:mt-12">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === 1}
              className="p-2 sm:p-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#1A2A4F] hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setPage(pageNum);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold text-sm sm:text-base transition-colors ${
                      page === pageNum
                        ? "bg-[#1A2A4F] text-white"
                        : "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#1A2A4F] hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === totalPages}
              className="p-2 sm:p-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#1A2A4F] hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {!isLoading && totalPages > 1 && filteredGigs.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-600">
            <span className="font-semibold">
              Page {page} of {totalPages}
            </span>
            <span className="mx-2">•</span>
            <span>
              Showing {(page - 1) * 12 + 1} -{" "}
              {Math.min(page * 12, filteredGigs.length)} of{" "}
              {filteredGigs.length} gigs
            </span>
          </div>
        )}
      </div>

      {!isLoading && filteredGigs.length > 0 && (
        <div className="bg-gradient-to-br from-[#1A2A4F] to-[#243454] py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to Start Working?
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-8">
              {role === "Provider"
                ? "Post your own gigs and find talented freelancers"
                : "Apply to gigs that match your skills and start earning"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {role === "Provider" ? (
                <Link
                  to="/create-gig"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1A2A4F] rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  <Zap className="h-5 w-5" />
                  Post a Gig
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1A2A4F] rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  Complete Your Profile
                </Link>
              )}
              <Link
                to="/tickets"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl font-bold hover:bg-white/20 transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                View My Tickets
              </Link>
            </div>
          </div>
        </div>
      )}

      {!isLoading && filteredGigs.length > 6 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 p-4 bg-[#1A2A4F] text-white rounded-full shadow-lg hover:bg-[#152241] transition-all hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ChevronRight className="h-6 w-6 -rotate-90" />
        </button>
      )}
      <Footer />
    </div>
  );
};

export default Gigs;
