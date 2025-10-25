import React, { useState, useEffect } from "react";
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
  MapPin,
  Clock,
  TrendingUp,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const Gigs = () => {
  const [gigs, setGigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userApplications, setUserApplications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [applicants, setApplicants] = useState({});
  const [isApplying, setIsApplying] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.id && decoded.role) {
          setUserId(decoded.id);
          setRole(decoded.role);
        } else {
          console.error("Invalid token payload:", decoded);
          localStorage.removeItem("token");
          toast.error("Session invalid. Please log in again.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { page, limit: 12 };
        if (selectedCategory) params.category = selectedCategory;
        if (searchTerm) params.search = searchTerm;

        const requests = [
          axios.get(`${API_BASE}/gigs`, { params }),
          axios.get(`${API_BASE}/categories`),
        ];

        if (userId) {
          requests.push(
            axios.get(`${API_BASE}/users/${userId}/applications`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
          );
        } else {
          requests.push(Promise.resolve({ data: [] }));
        }

        const [gigsResponse, categoriesResponse, applicationsResponse] =
          await Promise.all(requests);

        setGigs(gigsResponse.data.gigs || []);
        setTotalPages(gigsResponse.data.pages || 1);
        setCategories(categoriesResponse.data.categories || []);
        setUserApplications(
          applicationsResponse.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );

        if (userId) {
          const applicantRequests = gigs
            .filter((gig) => gig.sellerId === userId)
            .map((gig) =>
              axios.get(`${API_BASE}/gigs/${gig._id}/applications`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
            );
          const applicantResponses = await Promise.all(applicantRequests);
          const applicantsData = {};
          applicantResponses.forEach((response, index) => {
            const gigId = gigs.filter((gig) => gig.sellerId === userId)[index]
              ._id;
            applicantsData[gigId] = response.data;
          });
          setApplicants(applicantsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load gigs or categories.");
      }
    };

    fetchData();
  }, [page, selectedCategory, searchTerm, userId]);

  const handleApply = async (gigId) => {
    if (!userId) {
      toast.error("Please log in to apply for gigs.");
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
      toast.success("Application submitted! Redirecting to ticket...");
      setUserApplications([
        ...userApplications,
        { gigId, status: "pending", _id: response.data.application._id },
      ]);
      navigate(`/tickets/${response.data.ticketId}`);
    } catch (error) {
      console.error("Error applying for gig:", error);
      const errorMsg =
        error.response?.data?.error || "Failed to apply for gig.";
      toast.error(errorMsg);
    } finally {
      setIsApplying((prev) => ({ ...prev, [gigId]: false }));
    }
  };

  const handleApplicationStatus = async (gigId, applicationId, status) => {
    try {
      const response = await axios.patch(
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
        const applicationsResponse = await axios.get(
          `${API_BASE}/users/${userId}/applications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserApplications(
          applicationsResponse.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );
      }
    } catch (error) {
      console.error("Error updating application status:", error);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section with Glassmorphism */}
      <div className="relative bg-gradient-to-br from-[#1A2A4F] via-[#243654] to-[#1A2A4F] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <TrendingUp className="h-4 w-4 text-cyan-300" />
              <span className="text-sm text-white/90 font-medium">
                Discover Amazing Opportunities
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find Your Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                Gig
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Connect with opportunities that match your skills and help you
              grow your career
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {gigs.length}+
                </div>
                <div className="text-sm text-white/70">Active Gigs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {categories.length}+
                </div>
                <div className="text-sm text-white/70">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  24/7
                </div>
                <div className="text-sm text-white/70">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-12 md:h-20">
            <path
              fill="#f8fafc"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      <div className="flex-grow max-w-7xl mx-auto w-full px-4 -mt-8 md:-mt-12 pb-12">
        {/* Search and Filter Bar with Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-4 md:p-6 mb-8 border border-white/60 sticky top-4 z-20">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search with Icon */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#1A2A4F]/40 group-focus-within:text-[#1A2A4F] transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="Search gigs by title, description..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/80 text-[#1A2A4F] border-2 border-transparent rounded-2xl focus:border-[#1A2A4F] focus:bg-white transition-all duration-200 outline-none placeholder:text-[#1A2A4F]/40 font-medium"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A2A4F]/5 text-[#1A2A4F] rounded-2xl hover:bg-[#1A2A4F]/10 transition-all duration-200 font-medium"
            >
              <Filter className="h-5 w-5" />
              Filters
              {selectedCategory && (
                <span className="ml-2 px-2 py-0.5 bg-[#1A2A4F] text-white rounded-full text-xs">
                  1
                </span>
              )}
            </button>

            {/* Category Pills (Desktop) */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleCategoryChange("")}
                className={`px-5 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                  selectedCategory === ""
                    ? "bg-[#1A2A4F] text-white shadow-lg shadow-[#1A2A4F]/30 scale-105"
                    : "bg-slate-100 text-[#1A2A4F]/70 hover:bg-slate-200 hover:text-[#1A2A4F]"
                }`}
              >
                All
              </button>
              {categories.slice(0, 3).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-5 py-3 rounded-2xl font-semibold transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-[#1A2A4F] text-white shadow-lg shadow-[#1A2A4F]/30 scale-105"
                      : "bg-slate-100 text-[#1A2A4F]/70 hover:bg-slate-200 hover:text-[#1A2A4F]"
                  }`}
                >
                  {category}
                </button>
              ))}
              {categories.length > 3 && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-5 py-3 bg-slate-100 text-[#1A2A4F]/70 rounded-2xl hover:bg-slate-200 hover:text-[#1A2A4F] transition-all duration-200 font-semibold"
                >
                  +{categories.length - 3} More
                </button>
              )}
            </div>

            {/* My Tickets Button */}
            {userId && (
              <button
                onClick={() => navigate("/tickets")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A2A4F] text-white rounded-2xl hover:bg-[#243654] hover:shadow-xl hover:shadow-[#1A2A4F]/30 transition-all duration-200 font-semibold transform hover:scale-105"
              >
                <Users className="h-5 w-5" />
                <span className="hidden sm:inline">My Tickets</span>
              </button>
            )}
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200/60 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1A2A4F] text-lg">
                  All Categories
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-[#1A2A4F]/50 hover:text-[#1A2A4F] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                    selectedCategory === ""
                      ? "bg-[#1A2A4F] text-white shadow-md"
                      : "bg-slate-100 text-[#1A2A4F]/70 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      selectedCategory === category
                        ? "bg-[#1A2A4F] text-white shadow-md"
                        : "bg-slate-100 text-[#1A2A4F]/70 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Badge */}
        {selectedCategory && (
          <div className="flex items-center gap-3 mb-8 animate-in slide-in-from-left duration-300">
            <span className="text-sm font-medium text-[#1A2A4F]/70">
              Showing results for:
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2A4F]/10 text-[#1A2A4F] rounded-full font-semibold border-2 border-[#1A2A4F]/20">
              {selectedCategory}
              <button
                onClick={() => handleCategoryChange("")}
                className="hover:bg-[#1A2A4F]/20 rounded-full p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          </div>
        )}

        {/* Gigs Grid */}
        {gigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 bg-[#1A2A4F]/5 rounded-full flex items-center justify-center mb-6">
              <Briefcase className="h-12 w-12 text-[#1A2A4F]/30" />
            </div>
            <p className="text-2xl font-bold text-[#1A2A4F] mb-2">
              No gigs found
            </p>
            <p className="text-[#1A2A4F]/60 mb-6">
              Try adjusting your filters or check back later
            </p>
            {selectedCategory && (
              <button
                onClick={() => handleCategoryChange("")}
                className="px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:bg-[#243654] transition-all duration-200 font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {gigs.map((gig) => {
              const userApplication = userApplications.find(
                (app) => app.gigId === gig._id
              );
              const isClosed = gig.status !== "open";
              const isOwner = gig.sellerId === userId;

              return (
                <div
                  key={gig._id}
                  className={`group bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-[#1A2A4F]/20 transform hover:-translate-y-2 ${
                    isClosed ? "opacity-60" : ""
                  }`}
                >
                  {/* Thumbnail with Overlay */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#1A2A4F]/10 to-slate-100">
                    {gig.thumbnail ? (
                      <img
                        src={gig.thumbnail}
                        alt={gig.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = "/default-thumbnail.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="h-20 w-20 text-[#1A2A4F]/20" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {isClosed && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                        <div className="px-6 py-3 bg-red-500 text-white rounded-full font-bold text-lg shadow-xl">
                          Gig Closed
                        </div>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-[#1A2A4F] rounded-full text-sm font-bold shadow-lg">
                        {gig.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#1A2A4F] mb-3 line-clamp-2 group-hover:text-[#243654] transition-colors leading-snug">
                      {gig.title}
                    </h3>
                    <p className="text-[#1A2A4F]/60 text-sm mb-5 line-clamp-2 leading-relaxed">
                      {gig.description}
                    </p>

                    {/* Price and Seller Info */}
                    <div className="flex items-center justify-between mb-5 pb-5 border-b-2 border-slate-100">
                      <div>
                        <p className="text-xs font-semibold text-[#1A2A4F]/50 mb-1 uppercase tracking-wide">
                          Price
                        </p>
                        <p className="text-2xl font-bold text-[#1A2A4F]">
                          {gig.price.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[#1A2A4F]/50 mb-1 uppercase tracking-wide">
                          Seller
                        </p>
                        <p className="text-sm font-bold text-[#1A2A4F]">
                          {gig.sellerName}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {isOwner ? (
                      <div className="space-y-4">
                        <button
                          onClick={() => navigate(`/gigs/${gig._id}`)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-100 text-[#1A2A4F] rounded-2xl hover:bg-slate-200 transition-all duration-200 font-bold group/btn"
                        >
                          <Users className="h-5 w-5" />
                          View All Applicants
                          <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>

                        {applicants[gig._id] &&
                          applicants[gig._id].length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-[#1A2A4F]/50 uppercase tracking-wider">
                                  Recent Applicants
                                </p>
                                <span className="px-2.5 py-1 bg-[#1A2A4F] text-white rounded-full text-xs font-bold">
                                  {applicants[gig._id].length}
                                </span>
                              </div>
                              {applicants[gig._id].slice(0, 2).map((app) => (
                                <div
                                  key={app._id}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#1A2A4F]/20 transition-all duration-200"
                                >
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-[#1A2A4F] mb-1">
                                      {app.applicantName}
                                    </p>
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                                        app.status === "pending"
                                          ? "bg-amber-100 text-amber-700"
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
                                    <div className="flex gap-2 ml-3">
                                      <button
                                        onClick={() =>
                                          handleApplicationStatus(
                                            gig._id,
                                            app._id,
                                            "accepted"
                                          )
                                        }
                                        className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold"
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
                                        className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={() => navigate(`/gigs/${gig._id}`)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#1A2A4F] hover:bg-slate-50 rounded-2xl transition-all duration-200 font-bold border-2 border-slate-200 hover:border-[#1A2A4F]/20 group/btn"
                        >
                          View Full Details
                          <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>

                        {userApplication ? (
                          <div
                            className={`w-full px-4 py-3.5 text-center rounded-2xl font-bold ${
                              userApplication.status === "pending"
                                ? "bg-amber-100 text-amber-700 border-2 border-amber-200"
                                : userApplication.status === "accepted"
                                ? "bg-green-100 text-green-700 border-2 border-green-200"
                                : "bg-red-100 text-red-700 border-2 border-red-200"
                            }`}
                          >
                            {userApplication.status === "pending" && "⏳ "}
                            {userApplication.status === "accepted" && "✓ "}
                            {userApplication.status === "rejected" && "✗ "}
                            {userApplication.status.charAt(0).toUpperCase() +
                              userApplication.status.slice(1)}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(gig._id)}
                            disabled={isClosed || isApplying[gig._id]}
                            className={`w-full px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 transform ${
                              isClosed || isApplying[gig._id]
                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                : "bg-[#1A2A4F] text-white hover:bg-[#243654] hover:shadow-xl hover:shadow-[#1A2A4F]/30 hover:scale-105"
                            }`}
                          >
                            {isApplying[gig._id] ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Applying...
                              </span>
                            ) : (
                              "Apply Now"
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/60">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#1A2A4F] rounded-2xl font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1A2A4F] hover:text-white transition-all duration-200 shadow-md hover:shadow-xl border-2 border-[#1A2A4F]/20 hover:border-[#1A2A4F] disabled:hover:bg-white disabled:hover:text-[#1A2A4F] group"
            >
              <ChevronRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
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

                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-12 h-12 rounded-2xl font-bold transition-all duration-200 transform hover:scale-110 ${
                      page === pageNum
                        ? "bg-[#1A2A4F] text-white shadow-xl shadow-[#1A2A4F]/30 scale-110"
                        : "bg-white text-[#1A2A4F] hover:bg-slate-100 border-2 border-[#1A2A4F]/20"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && page < totalPages - 2 && (
                <>
                  <span className="text-[#1A2A4F]/50 font-bold px-2">...</span>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="w-12 h-12 rounded-2xl font-bold bg-white text-[#1A2A4F] hover:bg-slate-100 border-2 border-[#1A2A4F]/20 transition-all duration-200 hover:scale-110"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#1A2A4F] rounded-2xl font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1A2A4F] hover:text-white transition-all duration-200 shadow-md hover:shadow-xl border-2 border-[#1A2A4F]/20 hover:border-[#1A2A4F] disabled:hover:bg-white disabled:hover:text-[#1A2A4F] group"
            >
              Next
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Gigs;
