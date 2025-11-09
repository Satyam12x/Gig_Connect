import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
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
  ArrowRight,
  Grid,
  List,
  SlidersHorizontal,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Bookmark,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Ticket,
  Menu,
} from "lucide-react";

// Import your components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";
const PLACEHOLDER_IMG = "/api/placeholder-gig.jpg";
const Gigs = () => {
  const [user, setUser] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [featuredGigs, setFeaturedGigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userApplications, setUserApplications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [applicants, setApplicants] = useState({});
  const [isApplying, setIsApplying] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState("all");

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.id) {
          setUserId(payload.id);
          const savedFavorites =
            JSON.parse(localStorage.getItem(`favorites_${payload.id}`)) || [];
          setFavorites(savedFavorites);
        }
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
        });
        if (selectedCategory) params.append("category", selectedCategory);
        if (searchTerm) params.append("search", searchTerm);
        const [gigsRes, catsRes, appsRes, featuredRes, userRes] =
          await Promise.all([
            fetch(`${API_BASE}/gigs?${params}`),
            fetch(`${API_BASE}/categories`),
            userId && getToken()
              ? fetch(`${API_BASE}/users/${userId}/applications`, {
                  headers: { Authorization: `Bearer ${getToken()}` },
                })
              : Promise.resolve(null),
            fetch(`${API_BASE}/gigs/recent`),
            getToken()
              ? fetch(`${API_BASE}/users/profile`, {
                  headers: { Authorization: `Bearer ${getToken()}` },
                })
              : Promise.resolve(null),
          ]);
        const [gigsData, catsData, appsData, featuredData, userData] =
          await Promise.all([
            gigsRes.json(),
            catsRes.json(),
            appsRes ? appsRes.json() : [],
            featuredRes.json(),
            userRes ? userRes.json() : null,
          ]);
        setGigs(gigsData.gigs || []);
        setTotalPages(gigsData.pages || 1);
        setCategories(catsData.categories || []);
        setFeaturedGigs(featuredData.slice(0, 3) || []);
        if (userData) setUser(userData);
        setUserApplications(
          (appsData || []).map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          }))
        );
        if (userId) {
          const userGigs = gigsData.gigs.filter(
            (gig) => gig.sellerId === userId
          );
          const applicantPromises = userGigs.map((gig) =>
            fetch(`${API_BASE}/gigs/${gig._id}/applications`, {
              headers: { Authorization: `Bearer ${getToken()}` },
            }).then((res) => (res.ok ? res.json() : []))
          );
          const responses = await Promise.all(applicantPromises);
          const applicantsMap = responses.reduce((acc, response, index) => {
            acc[userGigs[index]._id] = response;
            return acc;
          }, {});
          setApplicants(applicantsMap);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [page, selectedCategory, searchTerm, userId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    window.location.href = "/";
  };

  const handleApply = async (gigId) => {
    if (!userId) {
      alert("Please log in to apply");
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
        alert("Application submitted!");
        setUserApplications((prev) => [
          ...prev,
          { gigId, status: "pending", _id: data.application._id },
        ]);
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch (error) {
      alert("Failed to apply");
    } finally {
      setIsApplying((prev) => ({ ...prev, [gigId]: false }));
    }
  };

  const handleToggleFavorite = (gigId) => {
    const newFavorites = favorites.includes(gigId)
      ? favorites.filter((id) => id !== gigId)
      : [...favorites, gigId];
    setFavorites(newFavorites);
    if (userId) {
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(newFavorites));
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filteredGigs = useMemo(() => {
    let filtered = gigs;

    if (showSavedOnly) {
      filtered = filtered.filter((gig) => favorites.includes(gig._id));
    }

    if (priceFilter !== "all") {
      filtered = filtered.filter((gig) => {
        if (priceFilter === "low") return gig.price < 10000;
        if (priceFilter === "medium")
          return gig.price >= 10000 && gig.price < 50000;
        if (priceFilter === "high") return gig.price >= 50000;
        return true;
      });
    }

    if (priceRange[0] > 0 || priceRange[1] < 100000) {
      filtered = filtered.filter(
        (gig) => gig.price >= priceRange[0] && gig.price <= priceRange[1]
      );
    }

    return filtered;
  }, [gigs, showSavedOnly, priceFilter, priceRange, favorites]);

  // Check if any filter is active
  const isFilterActive =
    selectedCategory ||
    searchTerm ||
    showSavedOnly ||
    priceFilter !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 100000;

  const categoryColors = useMemo(
    () =>
      categories.reduce((acc, category, index) => {
        acc[category] = "bg-[#1A2A4F]";
        return acc;
      }, {}),
    [categories]
  );

  const GigCard = ({ gig, isFeatured = false }) => {
    const userApplication = userApplications.find(
      (app) => app.gigId === gig._id
    );
    const isOwner = gig.sellerId === userId;
    const isFavorited = favorites.includes(gig._id);

    if (viewMode === "list") {
      return (
        <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#1A2A4F] flex">
          <div className="relative w-72 flex-shrink-0">
            <img
              src={gig.thumbnail || PLACEHOLDER_IMG}
              alt={gig.title}
              onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
              className="w-full h-full object-cover"
            />
            {isFeatured && (
              <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-2 bg-[#1A2A4F] text-white rounded-lg text-xs font-bold">
                <Sparkles className="h-3 w-3" /> Featured
              </div>
            )}
            <div
              className={`absolute top-3 left-3 px-3 py-2 text-white rounded-lg text-xs font-bold bg-[#1A2A4F]`}
            >
              {gig.category}
            </div>
          </div>
          <div className="p-6 flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#1A2A4F] mb-2 line-clamp-2">
                  {gig.title}
                </h3>
                <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {gig.sellerName || "Unknown Seller"}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleFavorite(gig._id);
                }}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </button>
            </div>
            <p className="text-gray-600 line-clamp-3 leading-relaxed">
              {gig.description}
            </p>
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
              <div className="flex gap-6 items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-semibold uppercase mb-1">
                    Budget
                  </span>
                  <span className="text-2xl font-bold text-[#1A2A4F]">
                    ₹{gig.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Just posted</span>
                </div>
              </div>
              <div className="flex gap-3">
                {isOwner ? (
                  <Link
                    to={`/gigs/${gig._id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                  >
                    <Users className="h-4 w-4" />
                    View Applicants ({applicants[gig._id]?.length || 0})
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to={`/gigs/${gig._id}`}
                      className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Link>
                    {userApplication ? (
                      <div
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold ${
                          userApplication.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : userApplication.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {userApplication.status === "pending" && (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        {userApplication.status === "accepted" && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {userApplication.status === "rejected" && (
                          <XCircle className="h-4 w-4" />
                        )}
                        {userApplication.status.charAt(0).toUpperCase() +
                          userApplication.status.slice(1)}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleApply(gig._id);
                        }}
                        disabled={isApplying[gig._id]}
                        className="flex items-center gap-2 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isApplying[gig._id] ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Applying...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            Apply Now
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#1A2A4F] flex flex-col h-full">
        <div className="relative h-56 overflow-hidden group">
          <img
            src={gig.thumbnail || PLACEHOLDER_IMG}
            alt={gig.title}
            onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          {isFeatured && (
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-2 bg-[#1A2A4F] text-white rounded-lg text-xs font-bold shadow-lg">
              <Sparkles className="h-3 w-3" /> Featured
            </div>
          )}
          <div
            className={`absolute top-3 left-3 px-3 py-2 text-white rounded-lg text-xs font-bold shadow-lg bg-[#1A2A4F]`}
          >
            {gig.category}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleToggleFavorite(gig._id);
            }}
            className="absolute bottom-3 right-3 p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-xl transition-all shadow-lg"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-700"
              }`}
            />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-3 flex-1">
          <h3 className="text-xl font-bold text-[#1A2A4F] line-clamp-2 leading-tight">
            {gig.title}
          </h3>
          <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            {gig.sellerName || "Unknown Seller"}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed flex-1">
            {gig.description}
          </p>
          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold uppercase">
                Budget
              </span>
              <span className="text-2xl font-bold text-[#1A2A4F]">
                ₹{gig.price.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="h-4 w-4" />
              <span>Just posted</span>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            {isOwner ? (
              <Link
                to={`/gigs/${gig._id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:opacity-90 transition-all"
              >
                <Users className="h-4 w-4" />
                Applicants ({applicants[gig._id]?.length || 0})
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to={`/gigs/${gig._id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  <Eye className="h-4 w-4" />
                  Details
                </Link>
                {userApplication ? (
                  <div
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold ${
                      userApplication.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : userApplication.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {userApplication.status === "pending" && (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {userApplication.status === "accepted" && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {userApplication.status === "rejected" && (
                      <XCircle className="h-4 w-4" />
                    )}
                    {userApplication.status.charAt(0).toUpperCase() +
                      userApplication.status.slice(1)}
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleApply(gig._id);
                    }}
                    disabled={isApplying[gig._id]}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isApplying[gig._id] ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Applying...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Apply
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1A2A4F] opacity-5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A2A4F] opacity-5 rounded-full blur-3xl -z-10"></div>

      {/* Hero Section */}
      <div className="relative bg-[#1A2A4F] pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Discover Your Next Opportunity
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Connect with top gigs, filter by category, and find the perfect
            match for your skills
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex-1">
        {/* Search & Filters + My Tickets Button */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={20}
              />
              <input
                type="text"
                placeholder="Search gigs by title, category, or skills..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-14 pr-6 py-4 text-base border-2 border-gray-300 rounded-2xl bg-white focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 transition-all"
              />
            </div>
            {/* My Tickets Button - Mobile Icon Only */}
            {userId && (
              <Link
                to="/tickets"
                className="hidden md:flex items-center gap-2 px-5 py-4 bg-[#1A2A4F] text-white rounded-2xl font-semibold hover:opacity-90 transition-all"
              >
                <Ticket className="h-5 w-5" />
                My Tickets
              </Link>
            )}
            <Link
              to="/tickets"
              className="md:hidden p-4 bg-[#1A2A4F] text-white rounded-2xl hover:opacity-90 transition-all"
            >
              <Ticket className="h-5 w-5" />
            </Link>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-5 py-3 border-2 border-gray-300 rounded-xl bg-white font-semibold text-sm cursor-pointer hover:border-[#1A2A4F] focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-5 py-3 border-2 border-gray-300 rounded-xl bg-white font-semibold text-sm cursor-pointer hover:border-[#1A2A4F] focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 transition-all"
            >
              <option value="all">All Prices</option>
              <option value="low">Under ₹10,000</option>
              <option value="medium">₹10,000 - ₹50,000</option>
              <option value="high">Above ₹50,000</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 border-2 rounded-xl font-semibold text-sm transition-all ${
                showFilters
                  ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#1A2A4F]"
              }`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            {userId && (
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={`flex items-center gap-2 px-5 py-3 border-2 rounded-xl font-semibold text-sm transition-all ${
                  showSavedOnly
                    ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#1A2A4F]"
                }`}
              >
                <Bookmark
                  size={18}
                  className={showSavedOnly ? "fill-white" : ""}
                />
                <span className="hidden sm:inline">
                  Saved ({favorites.length})
                </span>
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 border-2 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#1A2A4F]"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 border-2 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#1A2A4F]"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-[#1A2A4F]">
                  Price Range (₹)
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Math.max(0, +e.target.value), priceRange[1]])
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], +e.target.value])
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10"
                />
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="mb-10">
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-[#1A2A4F] scrollbar-track-gray-200">
            <button
              onClick={() => handleCategoryChange("")}
              className={`px-6 py-3 border-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                selectedCategory === ""
                  ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#1A2A4F]"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-3 border-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#1A2A4F]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Gigs - Hidden if any filter applied */}
        {featuredGigs.length > 0 && !isFilterActive && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={32} className="text-[#1A2A4F]" />
              <h2 className="text-4xl font-black text-[#1A2A4F]">
                Featured Gigs
              </h2>
            </div>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {featuredGigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} isFeatured={true} />
              ))}
            </div>
          </div>
        )}

        {/* All Gigs */}
        <div>
          <h2 className="text-4xl font-black text-[#1A2A4F] mb-6">
            {selectedCategory
              ? `${selectedCategory} Gigs`
              : showSavedOnly
              ? "Saved Gigs"
              : "All Available Gigs"}
          </h2>

          {isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden"
                >
                  <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded-xl animate-pulse mt-6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredGigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-2xl text-center">
              <Briefcase className="w-20 h-20 text-gray-300 mb-6" />
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                No gigs found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {showSavedOnly
                  ? "You haven't saved any gigs yet. Start exploring and bookmark your favorites!"
                  : "Try adjusting your filters or search terms to find more opportunities"}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchTerm("");
                  setPriceRange([0, 100000]);
                  setShowSavedOnly(false);
                  setPriceFilter("all");
                }}
                className="flex items-center gap-2 px-8 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:opacity-90 transition-all"
              >
                Clear All Filters
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {filteredGigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && filteredGigs.length > 0 && (
          <div className="flex justify-center items-center gap-3 mt-12">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-3 border-2 border-gray-300 rounded-xl bg-white text-gray-700 hover:border-[#1A2A4F] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page <= 3 ? i + 1 : page - 2 + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`min-w-[48px] h-12 flex items-center justify-center border-2 rounded-xl font-semibold transition-all ${
                    page === pageNum
                      ? "bg-[#1A2A4F] text-white border-[#1A2A4F]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#1A2A4F]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            }).filter(Boolean)}
            {totalPages > 5 && page < totalPages - 2 && (
              <span className="text-gray-600 font-semibold px-2">...</span>
            )}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-3 border-2 border-gray-300 rounded-xl bg-white text-gray-700 hover:border-[#1A2A4F] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Stats Bar */}
        {!isLoading && filteredGigs.length > 0 && (
          <div className="mt-12 bg-[#1A2A4F] rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center relative z-10">
              <div>
                <div className="text-4xl font-black text-white mb-2">
                  {filteredGigs.length}
                </div>
                <div className="text-white/80 font-semibold">
                  Available Gigs
                </div>
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-2">
                  {categories.length}
                </div>
                <div className="text-white/80 font-semibold">Categories</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-2">
                  {favorites.length}
                </div>
                <div className="text-white/80 font-semibold">Saved Gigs</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-2">
                  {userApplications.length}
                </div>
                <div className="text-white/80 font-semibold">Applications</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Gigs;
