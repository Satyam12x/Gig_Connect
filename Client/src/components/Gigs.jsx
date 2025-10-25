import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import {
  Briefcase,
  Search,
  Users,
  User,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.id) {
          setUserId(decoded.id);
        } else {
          localStorage.removeItem("token");
          toast.error("Session invalid. Please log in.");
          navigate("/login");
        }
      } catch (error) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in.");
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = {
          page,
          limit: 12,
          sort: sortBy,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        };
        if (selectedCategory) params.category = selectedCategory;
        if (searchTerm) params.search = searchTerm;

        const [
          gigsResponse,
          categoriesResponse,
          applicationsResponse,
          featuredResponse,
        ] = await Promise.all([
          axios.get(`${API_BASE}/gigs`, { params }),
          axios.get(`${API_BASE}/categories`),
          userId
            ? axios.get(`${API_BASE}/users/${userId}/applications`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
            : Promise.resolve({ data: [] }),
          axios
            .get(`${API_BASE}/gigs/featured`, { params: { limit: 3 } })
            .catch((err) => {
              console.error("Failed to fetch featured gigs:", err);
              return { data: { gigs: [] } }; // Fallback to empty array
            }),
        ]);

        setGigs(gigsResponse.data.gigs || []);
        setTotalPages(gigsResponse.data.pages || 1);
        setFeaturedGigs(featuredResponse.data.gigs || []);
        setCategories(categoriesResponse.data.categories || []);
        setUserApplications(
          applicationsResponse.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );

        if (userId) {
          const applicantPromises = gigs
            .filter((gig) => gig.sellerId === userId)
            .map((gig) =>
              axios.get(`${API_BASE}/gigs/${gig._id}/applications`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
            );
          const responses = await Promise.all(applicantPromises);
          setApplicants(
            responses.reduce((acc, response, index) => {
              const gigId = gigs.filter((gig) => gig.sellerId === userId)[index]
                ._id;
              acc[gigId] = response.data;
              return acc;
            }, {})
          );
        }
      } catch (error) {
        console.error("Fetch data error:", error);
        toast.error("Failed to load gigs or categories.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, selectedCategory, searchTerm, priceRange, sortBy, userId]);

  const handleApply = async (gigId) => {
    if (!userId) {
      toast.error("Please log in to apply.");
      navigate("/login", { state: { from: `/gigs/${gigId}` } });
      return;
    }
    setIsApplying((prev) => ({ ...prev, [gigId]: true }));
    try {
      const response = await axios.post(
        `${API_BASE}/gigs/${gigId}/apply`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Application submitted!");
      setUserApplications([
        ...userApplications,
        { gigId, status: "pending", _id: response.data.application._id },
      ]);
      navigate(`/tickets/${response.data.ticketId}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to apply.");
    } finally {
      setIsApplying((prev) => ({ ...prev, [gigId]: false }));
    }
  };

  const handleApplicationStatus = async (gigId, applicationId, status) => {
    try {
      await axios.patch(
        `${API_BASE}/gigs/${gigId}/applications/${applicationId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(`Application ${status}!`);
      setApplicants((prev) => ({
        ...prev,
        [gigId]: prev[gigId].map((app) =>
          app._id === applicationId ? { ...app, status } : app
        ),
      }));
      if (userId) {
        const response = await axios.get(
          `${API_BASE}/users/${userId}/applications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserApplications(
          response.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to update application."
      );
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    setShowFilters(false);
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
        const colors = ["#1A2A4F", "#3A4A7F", "#2A3A6F", "#4A5A9F"];
        acc[category] = colors[index % colors.length];
        return acc;
      }, {}),
    [categories]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <div className="mt-16 sm:mt-20">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[#1A2A4F] to-[#2A3A6F] overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#3A4A7F,transparent_70%)]"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white animate-in fade-in duration-500">
              Discover Top Campus Gigs
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto mt-3 animate-in fade-in duration-500 delay-100">
              Connect with skilled students for design, development, tutoring,
              and more.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
              className="mt-6 px-6 py-3 text-sm bg-[#3A4A7F] text-white rounded-lg hover:bg-[#4A5A9F] animate-in fade-in duration-500 delay-200"
            >
              Browse Gigs
            </button>
          </div>
        </div>

        {/* Category Bar */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("")}
              className={`px-4 py-2 text-xs sm:text-sm rounded-lg font-medium flex-shrink-0 ${
                selectedCategory === ""
                  ? "bg-[#1A2A4F] text-white"
                  : "bg-white/90 text-[#2A3A6F] hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 text-xs sm:text-sm rounded-lg font-medium flex-shrink-0 ${
                  selectedCategory === category
                    ? `bg-[${categoryColors[category]}] text-white`
                    : "bg-white/90 text-[#2A3A6F] hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="max-w-7xl mx-auto px-4 sticky top-16 sm:top-20 z-10">
          <div className="bg-white/90 backdrop-blur-md rounded-lg p-3 flex flex-col sm:flex-row gap-2 sm:gap-3 shadow-md border border-white/20">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2A3A6F]" />
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-transparent border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#3A4A7F] focus:border-transparent placeholder-[#2A3A6F]/50"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-white border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#3A4A7F] focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-xs sm:text-sm bg-white text-[#2A3A6F] rounded-lg hover:bg-slate-200 flex items-center gap-2"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            {userId && (
              <button
                onClick={() => navigate("/tickets")}
                className="px-4 py-2 text-xs sm:text-sm bg-[#1A2A4F] text-white rounded-lg hover:bg-[#3A4A7F] flex items-center gap-2"
              >
                <Users className="h-4 w-4" /> Tickets
              </button>
            )}
          </div>
          {showFilters && (
            <div className="mt-2 bg-white/90 backdrop-blur-md rounded-lg p-3 shadow-md border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[#2A3A6F]">
                  Advanced Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-[#2A3A6F]/50 hover:text-[#2A3A6F]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#2A3A6F]">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([+e.target.value, priceRange[1]])
                    }
                    className="w-1/2 px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], +e.target.value])
                    }
                    className="w-1/2 px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured Gigs */}
        {featuredGigs.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1A2A4F] mb-4">
              Featured Gigs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredGigs.map((gig) => (
                <div
                  key={gig._id}
                  className="bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg border border-white/20 hover:border-[#3A4A7F]/20 transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={gig.thumbnail || "/default-thumbnail.jpg"}
                      alt={gig.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => (e.target.src = "/default-thumbnail.jpg")}
                    />
                    <span className="absolute top-3 right-3 px-3 py-1 bg-[#1A2A4F] text-white rounded-lg text-xs font-medium">
                      Featured
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[#1A2A4F] line-clamp-2">
                      {gig.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2A3A6F]/70 mt-1 line-clamp-2">
                      {gig.description}
                    </p>
                    <div className="mt-3 space-y-1 text-xs sm:text-sm">
                      <p className="text-[#2A3A6F]">
                        <span className="font-medium">Price:</span>{" "}
                        {gig.price.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/gigs/${gig._id}`)}
                        className="flex-1 px-4 py-2 text-xs sm:text-sm bg-slate-100 text-[#2A3A6F] rounded-lg hover:bg-slate-200"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleApply(gig._id)}
                        disabled={gig.status !== "open" || isApplying[gig._id]}
                        className={`flex-1 px-4 py-2 text-xs sm:text-sm rounded-lg text-white ${
                          gig.status !== "open" || isApplying[gig._id]
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-[#1A2A4F] hover:bg-[#3A4A7F]"
                        }`}
                      >
                        {isApplying[gig._id] ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gigs Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1A2A4F] mb-4">
            All Gigs
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/90 rounded-xl p-4 animate-pulse"
                >
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <Briefcase className="h-16 w-16 text-[#2A3A6F]/30 mb-4" />
              <p className="text-lg font-medium text-[#2A3A6F]">
                No gigs found.
              </p>
              <button
                onClick={() => handleCategoryChange("")}
                className="mt-4 px-4 py-2 text-sm bg-[#1A2A4F] text-white rounded-lg hover:bg-[#3A4A7F]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {gigs.map((gig) => {
                const userApplication = userApplications.find(
                  (app) => app.gigId === gig._id
                );
                const isClosed = gig.status !== "open";
                const isOwner = gig.sellerId === userId;

                return (
                  <div
                    key={gig._id}
                    className={`bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg border border-white/20 hover:border-[#3A4A7F]/20 transition-all duration-300 ${
                      isClosed ? "opacity-70" : ""
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={gig.thumbnail || "/default-thumbnail.jpg"}
                        alt={gig.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) =>
                          (e.target.src = "/default-thumbnail.jpg")
                        }
                      />
                      {isClosed && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-4 py-1 bg-red-500 text-white rounded-lg text-sm font-medium">
                            Closed
                          </span>
                        </div>
                      )}
                      <span
                        className="absolute top-3 right-3 px-3 py-1 text-white rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor:
                            categoryColors[gig.category] || "#1A2A4F",
                        }}
                      >
                        {gig.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#1A2A4F] line-clamp-2">
                        {gig.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#2A3A6F]/70 mt-1 line-clamp-2">
                        {gig.description}
                      </p>
                      <div className="mt-3 space-y-1 text-xs sm:text-sm">
                        <p className="text-[#2A3A6F]">
                          <span className="font-medium">Price:</span>{" "}
                          {gig.price.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </p>
                        <p className="text-[#2A3A6F]">
                          <span className="font-medium">Seller:</span>{" "}
                          {gig.sellerName}
                        </p>
                      </div>
                      <div className="mt-4 space-y-2">
                        {isOwner ? (
                          <>
                            <button
                              onClick={() => navigate(`/gigs/${gig._id}`)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm bg-slate-100 text-[#2A3A6F] rounded-lg hover:bg-slate-200"
                            >
                              <Users className="h-4 w-4" /> Applicants
                              <ChevronRight className="h-4 w-4" />
                            </button>
                            {applicants[gig._id]?.slice(0, 1).map((app) => (
                              <div
                                key={app._id}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                              >
                                <div>
                                  <p className="text-xs font-medium text-[#2A3A6F]">
                                    {app.applicantName}
                                  </p>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      app.status === "pending"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : app.status === "accepted"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {app.status.charAt(0).toUpperCase() +
                                      app.status.slice(1)}
                                  </span>
                                </div>
                                {app.status === "pending" && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleApplicationStatus(
                                          gig._id,
                                          app._id,
                                          "accepted"
                                        )
                                      }
                                      className="text-xs text-green-600 hover:text-green-700"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleApplicationStatus(
                                          gig._id,
                                          app._id,
                                          "rejected"
                                        )
                                      }
                                      className="text-xs text-red-600 hover:text-red-700"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/gigs/${gig._id}`)}
                              className="flex-1 px-4 py-2 text-xs sm:text-sm bg-slate-100 text-[#2A3A6F] rounded-lg hover:bg-slate-200"
                            >
                              Details
                            </button>
                            {userApplication ? (
                              <span
                                className={`flex-1 px-4 py-2 text-xs sm:text-sm text-center rounded-lg ${
                                  userApplication.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : userApplication.status === "accepted"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {userApplication.status
                                  .charAt(0)
                                  .toUpperCase() +
                                  userApplication.status.slice(1)}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApply(gig._id)}
                                disabled={isClosed || isApplying[gig._id]}
                                className={`flex-1 px-4 py-2 text-xs sm:text-sm rounded-lg text-white ${
                                  isClosed || isApplying[gig._id]
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-[#1A2A4F] hover:bg-[#3A4A7F]"
                                }`}
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
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="max-w-7xl mx-auto px-4 py-6 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center bg-white text-[#2A3A6F] rounded-full disabled:opacity-50 hover:bg-[#3A4A7F] hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(Math.min(totalPages, 3))].map((_, i) => {
              const pageNum = page <= 2 ? i + 1 : page - 1 + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    page === pageNum
                      ? "bg-[#1A2A4F] text-white"
                      : "bg-white text-[#2A3A6F] hover:bg-slate-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 3 && page < totalPages && (
              <span className="px-2 text-[#2A3A6F] self-center">...</span>
            )}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center bg-white text-[#2A3A6F] rounded-full disabled:opacity-50 hover:bg-[#3A4A7F] hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Gigs;
