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
const PLACEHOLDER_IMG =
  "https://via.placeholder.com/400x300?text=Gig+Thumbnail";

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

  // 2. Fetch Real Data (Split Strategy)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        // A. Critical Public Data
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
        });
        if (selectedCategory) params.append("category", selectedCategory);
        if (searchTerm) params.append("search", searchTerm);

        const [gigsRes, catsRes, recentRes] = await Promise.all([
          fetch(`${API_BASE}/gigs?${params}`),
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/gigs/recent`),
        ]);

        if (!gigsRes.ok) throw new Error("Failed to fetch gigs");

        const gigsData = await gigsRes.json();
        const catsData = await catsRes.json();
        const recentData = await recentRes.json();

        setGigs(gigsData.gigs || []);
        setTotalPages(gigsData.pages || 1);
        setCategories(catsData.categories || []);
        setFeaturedGigs((recentData.gigs || recentData)?.slice(0, 3) || []);

        // B. User Data (Safe Fetch)
        if (token) {
          try {
            const [profileRes, appsRes, ticketsRes] = await Promise.all([
              fetch(`${API_BASE}/users/profile`, { headers }),
              userId
                ? fetch(`${API_BASE}/users/${userId}/applications`, { headers })
                : Promise.resolve(null),
              userId
                ? fetch(`${API_BASE}/users/${userId}/tickets`, { headers })
                : Promise.resolve(null),
            ]);

            if (profileRes.ok) {
              const profileData = await profileRes.json();
              setUser(profileData);
              if (profileData.role) setRole(profileData.role);
            }

            if (appsRes && appsRes.ok) {
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

            if (ticketsRes && ticketsRes.ok) {
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
            console.warn("User data fetch failed (non-critical):", userErr);
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

  const GigCard = ({ gig, isFeatured = false }) => {
    // If I'm the owner or I have a ticket for this gig, I want to access the ticket
    const ticket = tickets[gig._id];
    const isOwner = gig.providerId === userId;
    const status = applications[gig._id];
    const isFavorited = favorites.includes(gig._id);
    const isClosed = gig.status === "closed" || gig.status === "in_progress"; // Backend filters usually hide these, but just in case

    return (
      <div
        className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full ${
          isFeatured
            ? "border-2 border-[#1A2A4F] shadow-lg"
            : "border border-gray-200 hover:border-[#1A2A4F]"
        }`}
      >
        <div className="relative h-48 sm:h-56 overflow-hidden group">
          <img
            src={gig.thumbnail || PLACEHOLDER_IMG}
            alt={gig.title}
            onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-[#1A2A4F]/90 backdrop-blur-sm text-white rounded-full text-xs font-bold shadow-lg">
            {gig.category}
          </div>
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
            <span className="font-medium truncate">{gig.providerName}</span>
            {gig.rating > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{gig.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
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
              <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {isOwner ? (
              <Link
                to={`/gigs/${gig._id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:bg-[#152241] transition-colors"
              >
                <Users className="h-4 w-4" /> Manage
              </Link>
            ) : ticket ? (
              <Link
                to={`/tickets/${ticket._id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                <Ticket className="h-4 w-4" /> View Ticket
              </Link>
            ) : isClosed ? (
              <button
                disabled
                className="flex-1 bg-gray-200 text-gray-500 rounded-xl font-semibold cursor-not-allowed py-3"
              >
                Closed
              </button>
            ) : (
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
                <span className="hidden sm:inline">Apply Now</span>
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
      <div className="relative bg-gradient-to-br from-[#1A2A4F] via-[#243454] to-[#1A2A4F] pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight">
            Find Your Next Gig
          </h1>
          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Package className="text-white" />
              <div className="text-left text-white">
                <div className="font-bold text-xl">{gigs.length}+</div>
                <div className="text-xs opacity-80">Active Gigs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Search and Filters (Simplified for brevity) */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search gigs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1A2A4F] focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? "" : cat)
                }
                className={`px-4 py-2 rounded-xl whitespace-nowrap border font-semibold ${
                  selectedCategory === cat
                    ? "bg-[#1A2A4F] text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gig Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            Loading amazing opportunities...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.map((gig) => (
              <GigCard key={gig._id} gig={gig} />
            ))}
          </div>
        )}

        {!isLoading && filteredGigs.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No gigs found matching your criteria.
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Gigs;
