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
} from "lucide-react";
import Navbar from "./Navbar";

const API_BASE = "http://localhost:5000/api";
const NAVY = "#1A2A4F";
const PLACEHOLDER_IMG = "/api/placeholder-gig.jpg"; // You can host a default image

const Gigs = () => {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        const [gigsRes, catsRes, appsRes, featuredRes] = await Promise.all([
          fetch(`${API_BASE}/gigs?${params}`),
          fetch(`${API_BASE}/categories`),
          userId && getToken()
            ? fetch(`${API_BASE}/users/${userId}/applications`, {
                headers: { Authorization: `Bearer ${getToken()}` },
              })
            : Promise.resolve(null),
          fetch(`${API_BASE}/gigs/recent`),
        ]);

        const [gigsData, catsData, appsData, featuredData] = await Promise.all([
          gigsRes.json(),
          catsRes.json(),
          appsRes ? appsRes.json() : [],
          featuredRes.json(),
        ]);

        setGigs(gigsData.gigs || []);
        setTotalPages(gigsData.pages || 1);
        setCategories(catsData.categories || []);
        setFeaturedGigs(featuredData.slice(0, 3) || []);

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
    setMobileMenuOpen(false);
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

  const categoryColors = useMemo(
    () =>
      categories.reduce((acc, category, index) => {
        const colors = [NAVY, "#2d3d63", "#3a4a7f", "#4a5a9f"];
        acc[category] = colors[index % colors.length];
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

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 hover:border-[#1A2A4F] transition-all duration-300 overflow-hidden group flex flex-col h-full">
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={gig.thumbnail || PLACEHOLDER_IMG}
            alt={gig.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span
              className="px-3 py-1 text-white rounded-lg text-xs font-semibold"
              style={{ backgroundColor: categoryColors[gig.category] || NAVY }}
            >
              {gig.category}
            </span>
            {isFeatured && (
              <span className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                <Star className="h-3 w-3" /> Featured
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(gig._id);
            }}
            className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all duration-200"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorited
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
          </button>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
            {gig.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            by {gig.sellerName || "Unknown Seller"}
          </p>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed flex-1">
            {gig.description}
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between text-gray-700">
              <span className="font-semibold">Budget:</span>
              <span className="font-bold" style={{ color: NAVY }}>
                ₹{gig.price.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Just posted</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            {isOwner ? (
              <Link
                to={`/gigs/${gig._id}`}
                className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4" /> View Applicants (
                {applicants[gig._id]?.length || 0})
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link
                  to={`/gigs/${gig._id}`}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
                >
                  View Details
                </Link>
                {userApplication ? (
                  <div
                    className={`flex-1 px-3 py-2 text-sm text-center rounded-lg font-semibold ${
                      userApplication.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : userApplication.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {userApplication.status.charAt(0).toUpperCase() +
                      userApplication.status.slice(1)}
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(gig._id)}
                    disabled={isApplying[gig._id]}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg text-white font-semibold transition-all duration-200 ${
                      isApplying[gig._id]
                        ? "bg-gray-400 cursor-not-allowed"
                        : ""
                    }`}
                    style={isApplying[gig._id] ? {} : { backgroundColor: NAVY }}
                  >
                    {isApplying[gig._id] ? "Applying..." : "Apply"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      {/* Hero with Irregular Gradient Background */}
      <div className="relative overflow-hidden">
        {/* Irregular Gradient Shape */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `conic-gradient(from 120deg at 20% 30%, ${NAVY}, #2d3d63, transparent 50%), 
                         conic-gradient(from 240deg at 80% 70%, #3a4a7f, #4a5a9f, transparent 50%)`,
            filter: "blur(80px)",
            transform: "scale(1.5)",
          }}
        ></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 10% 20%, #1A2A4F, transparent 40%), 
                         radial-gradient(circle at 90% 80%, #3a4a7f, transparent 40%)`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-4xl sm:text-6xl font-bold text-white leading-tight drop-shadow-lg">
            Discover Your Next Opportunity
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mt-4 leading-relaxed">
            Connect with top gigs. Filter by category, price, and more.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search gigs by title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 text-base bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] transition-all placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-sm bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Price Range (₹)
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Math.max(0, +e.target.value), priceRange[1]])
                  }
                  className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], +e.target.value])
                  }
                  className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="hidden sm:flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => handleCategoryChange("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === ""
                ? "bg-[#1A2A4F] text-white shadow-md"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#1A2A4F]"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-[#1A2A4F] text-white shadow-md"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#1A2A4F]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Gigs */}
        {featuredGigs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-yellow-500" />
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: NAVY }}
              >
                Featured Gigs
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} isFeatured={true} />
              ))}
            </div>
          </div>
        )}

        {/* All Gigs */}
        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold mb-6"
            style={{ color: NAVY }}
          >
            {selectedCategory
              ? `${selectedCategory} Gigs`
              : "All Available Gigs"}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 animate-pulse h-full"
                >
                  <div className="h-56 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-10 bg-gray-200 rounded mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-600 mb-2">
                No gigs found
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Try adjusting your filters
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchTerm("");
                  setPriceRange([0, 100000]);
                }}
                className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: NAVY }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border-2 border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page <= 3 ? i + 1 : page - 2 + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                    page === pageNum
                      ? "bg-[#1A2A4F] text-white shadow-md"
                      : "border-2 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            }).filter(Boolean)}

            {totalPages > 5 && page < totalPages - 2 && (
              <span className="text-gray-500">...</span>
            )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border-2 border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gigs;
