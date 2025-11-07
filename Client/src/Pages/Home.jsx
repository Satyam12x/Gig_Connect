import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Code,
  PenTool,
  BookOpen,
  Users,
  Briefcase,
  CheckCircle,
  Quote,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const formatINR = (amount) => {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const BackgroundShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      className="absolute top-[-5%] right-[-5%] w-1/3 h-1/3 bg-gradient-to-br from-[#1A2A4F] to-[#3A4A7F] opacity-15 blur-3xl transform rotate-12"
      style={{
        clipPath:
          "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
      }}
    />
    <div
      className="absolute bottom-[-10%] right-[-5%] w-1/4 h-1/4 bg-gradient-to-tr from-purple-600 to-[#1A2A4F] opacity-10 blur-3xl transform -rotate-6"
      style={{
        clipPath:
          "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
      }}
    />
    <div
      className="absolute top-1/2 right-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-[#3A4A7F] to-purple-600 opacity-10 blur-3xl transform rotate-45"
      style={{
        clipPath:
          "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      }}
    />
  </div>
);

const SectionDivider = ({ variant = "default" }) => {
  if (variant === "wave") {
    return (
      <div className="relative h-16 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-16"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="#1A2A4F"
            fillOpacity="0.08"
          />
        </svg>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="relative h-12 flex items-center justify-center">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#1A2A4F] animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                opacity: 0.3 + i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-1 my-8 mx-auto max-w-xs">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1A2A4F] to-transparent opacity-30" />
    </div>
  );
};

const HeroSection = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gigs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const message =
    userRole === "Seller"
      ? "Showcase your skills and start earning with gigs!"
      : userRole === "Buyer"
      ? "Hire talented students for your projects!"
      : "Discover or offer services in your campus community!";

  return (
    <>
      <div className="relative min-h-screen bg-white overflow-hidden pt-16">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
            <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2A4F]/10 rounded-full text-[#1A2A4F] text-sm font-medium mb-4">
                <Sparkles size={16} />
                <span>Welcome to Gig Connect</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A2A4F] leading-tight">
                Connect with
                <span className="block text-[#1A2A4F] mt-2">
                  Student Talent
                </span>
              </h1>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
                {message}
              </p>

              <form
                onSubmit={handleSearch}
                className="relative max-w-md mx-auto lg:mx-0 group"
              >
                <div className="absolute -inset-0.5 bg-[#1A2A4F] rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300" />
                <div className="relative flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for gigs..."
                    className="flex-grow p-4 rounded-l-lg border-2 border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#1A2A4F] bg-white shadow-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-4 bg-[#1A2A4F] text-white rounded-r-lg hover:bg-[#2A3A6F] transition-all duration-300"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-[#1A2A4F] text-white font-semibold rounded-lg hover:bg-[#2A3A6F] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/gigs"
                  className="px-8 py-4 bg-white text-[#1A2A4F] font-semibold rounded-lg border-2 border-[#1A2A4F] hover:bg-[#1A2A4F]/5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Browse Gigs
                  <TrendingUp size={18} />
                </Link>
              </div>

              <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
                {[
                  { number: "5,000+", label: "Active Students" },
                  { number: "10,000+", label: "Projects Completed" },
                  { number: "4.9/5", label: "Average Rating" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center lg:text-left">
                    <p className="text-3xl font-bold text-[#1A2A4F]">
                      {stat.number}
                    </p>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative group">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-8 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop"
                    alt="Students collaborating"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SectionDivider variant="wave" />
    </>
  );
};

const FeaturedGigsSection = ({ userId }) => {
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [gigsResponse, applicationsResponse] = await Promise.all([
          axios.get(`${API_BASE}/gigs/recent`),
          token
            ? axios.get(`${API_BASE}/users/${userId}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : { data: [] },
        ]);
        setGigs(gigsResponse.data.slice(0, 4));
        setApplications(applicationsResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch gigs");
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const getApplicationStatus = (gigId) => {
    const application = applications.find((app) => app.gigId._id === gigId);
    return application ? application.status : null;
  };

  return (
    <>
      <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2A4F]/10 rounded-full text-[#1A2A4F] text-sm font-medium mb-4">
              <Sparkles size={16} />
              <span>Top Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2A4F] mb-4">
              Featured Gigs
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover top services offered by talented students in your campus
              community.
            </p>
          </div>

          {error && (
            <div className="text-center text-red-500 flex items-center justify-center gap-2 mb-6">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 animate-pulse"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4" />
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-4" />
                  <div className="h-10 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="text-center text-gray-600">
              No gigs available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gigs.map((gig, idx) => {
                const applicationStatus = getApplicationStatus(gig._id);
                const isClosed = gig.status === "closed";
                const hasApplied = !!applicationStatus;

                return (
                  <div
                    key={gig._id}
                    className="group relative bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-2xl transition-all duration-500"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-[#1A2A4F]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative">
                      {gig.thumbnail ? (
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-transparent group-hover:ring-[#1A2A4F]/20 transition-all duration-300">
                          <img
                            src={gig.thumbnail}
                            alt={gig.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#1A2A4F] mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                          {gig.title.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <h3 className="text-xl font-semibold text-[#1A2A4F] mb-2 group-hover:text-[#2A3A6F] transition-colors">
                        {gig.title}
                      </h3>

                      <p className="text-gray-600 mb-2">
                        By{" "}
                        <Link
                          to={`/profile/${gig.sellerId}`}
                          className="hover:underline hover:text-[#1A2A4F] transition-colors"
                        >
                          {gig.sellerName}
                        </Link>
                      </p>

                      <p className="text-[#1A2A4F] font-bold mb-2">
                        From {formatINR(gig.price)}
                      </p>

                      <p
                        className={`mb-2 font-semibold ${
                          isClosed ? "text-red-600" : "text-[#1A2A4F]"
                        }`}
                      >
                        Status:{" "}
                        {gig.status.charAt(0).toUpperCase() +
                          gig.status.slice(1)}
                      </p>

                      {hasApplied && (
                        <p
                          className={`text-sm font-semibold mb-2 ${
                            applicationStatus === "accepted"
                              ? "text-green-600"
                              : applicationStatus === "rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          Application:{" "}
                          {applicationStatus.charAt(0).toUpperCase() +
                            applicationStatus.slice(1)}
                        </p>
                      )}

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {gig.description}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {gig.category}
                      </p>

                      {isClosed ? (
                        <span className="block w-full px-6 py-3 bg-gray-200 text-gray-600 font-semibold rounded-lg text-center">
                          Applications Closed
                        </span>
                      ) : hasApplied ? (
                        <span className="block w-full px-6 py-3 bg-gray-200 text-gray-600 font-semibold rounded-lg text-center">
                          Application Submitted
                        </span>
                      ) : (
                        <Link
                          to={`/gigs/${gig._id}`}
                          className="group/btn relative block w-full px-6 py-3 bg-[#1A2A4F] text-white font-semibold rounded-lg overflow-hidden text-center"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            View Details
                            <ArrowRight
                              size={16}
                              className="group-hover/btn:translate-x-1 transition-transform duration-300"
                            />
                          </span>
                          <div className="absolute inset-0 bg-[#2A3A6F] translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <SectionDivider variant="dots" />
    </>
  );
};

const RecentGigsSection = ({ userId }) => {
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [gigsResponse, applicationsResponse] = await Promise.all([
          axios.get(`${API_BASE}/gigs/recent`),
          token
            ? axios.get(`${API_BASE}/users/${userId}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : { data: [] },
        ]);
        setGigs(gigsResponse.data.slice(0, 6));
        setApplications(applicationsResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch recent gigs");
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const getApplicationStatus = (gigId) => {
    const application = applications.find((app) => app.gigId._id === gigId);
    return application ? application.status : null;
  };

  return (
    <>
      <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-4">
              <TrendingUp size={16} />
              <span>Fresh Opportunities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2A4F] mb-4">
              Recently Uploaded Gigs
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Check out the latest services posted by talented students.
            </p>
          </div>

          {error && (
            <div className="text-center text-red-500 flex items-center justify-center gap-2 mb-6">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 animate-pulse"
                >
                  <div className="w-3 h-3 bg-gray-200 rounded-full mt-2" />
                  <div className="flex-1 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="text-center text-gray-600">
              No recent gigs available.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1A2A4F]/20 via-[#1A2A4F]/40 to-[#1A2A4F]/20" />
              <div className="space-y-6">
                {gigs.map((gig, index) => {
                  const applicationStatus = getApplicationStatus(gig._id);
                  const isClosed = gig.status === "closed";
                  const hasApplied = !!applicationStatus;

                  return (
                    <div
                      key={gig._id}
                      className="flex items-start gap-6 opacity-0 animate-slideInLeft"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <div className="relative z-10">
                        <div className="w-3 h-3 bg-[#1A2A4F] rounded-full mt-8 ring-4 ring-white shadow-md" />
                      </div>

                      <div className="group flex-1 bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-500">
                        <div className="absolute inset-0 bg-[#1A2A4F]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative flex items-start gap-4">
                          {gig.thumbnail ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-[#1A2A4F]/20 transition-all duration-300 flex-shrink-0">
                              <img
                                src={gig.thumbnail}
                                alt={gig.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-[#1A2A4F] flex items-center justify-center text-white text-xl font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              {gig.title.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-[#1A2A4F] mb-2 group-hover:text-[#2A3A6F] transition-colors">
                              {gig.title}
                            </h3>

                            <p className="text-gray-600 mb-2 text-sm">
                              By{" "}
                              <Link
                                to={`/profile/${gig.sellerId}`}
                                className="font-medium hover:underline hover:text-[#1A2A4F] transition-colors"
                              >
                                {gig.sellerName}
                              </Link>
                            </p>

                            <div className="flex flex-wrap gap-3 mb-3">
                              <span className="px-3 py-1 bg-[#1A2A4F]/10 text-[#1A2A4F] rounded-full text-sm font-semibold">
                                {formatINR(gig.price)}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  isClosed
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {gig.status.charAt(0).toUpperCase() +
                                  gig.status.slice(1)}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                {gig.category}
                              </span>
                            </div>

                            {hasApplied && (
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${
                                  applicationStatus === "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : applicationStatus === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                Application:{" "}
                                {applicationStatus.charAt(0).toUpperCase() +
                                  applicationStatus.slice(1)}
                              </span>
                            )}

                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {gig.description}
                            </p>

                            {isClosed ? (
                              <span className="inline-block px-6 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg">
                                Applications Closed
                              </span>
                            ) : hasApplied ? (
                              <span className="inline-block px-6 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg">
                                Application Submitted
                              </span>
                            ) : (
                              <Link
                                to={`/gigs/${gig._id}`}
                                className="group/btn relative inline-flex items-center gap-2 px-6 py-2 bg-[#1A2A4F] text-white font-semibold rounded-lg overflow-hidden"
                              >
                                <span className="relative z-10 flex items-center gap-2">
                                  View Details
                                  <ArrowRight
                                    size={16}
                                    className="group-hover/btn:translate-x-1 transition-transform duration-300"
                                  />
                                </span>
                                <div className="absolute inset-0 bg-[#2A3A6F] translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <SectionDivider variant="dots" />
    </>
  );
};

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryIcons = {
    "Web Development": Code,
    "Graphic Design": PenTool,
    Tutoring: BookOpen,
    "Digital Marketing": Search,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE}/categories`);
        setCategories(response.data.categories || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch categories");
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2A4F]/10 rounded-full text-[#1A2A4F] text-sm font-medium mb-4">
              <Users size={16} />
              <span>Browse by Category</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2A4F] mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find the perfect service for your needs from a variety of student
              talent categories.
            </p>
          </div>

          {error && (
            <div className="text-center text-red-500 flex items-center justify-center gap-2 mb-6">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-wrap justify-center gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="w-40 h-40 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center justify-center animate-pulse"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full mb-2" />
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-600">
              No categories available.
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {categories.map((category, index) => {
                const Icon = categoryIcons[category] || Users;
                return (
                  <Link
                    key={index}
                    to={`/gigs?category=${encodeURIComponent(category)}`}
                    className="group relative w-40 h-40 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col items-center justify-center hover:shadow-xl transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[#1A2A4F]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-300">
                      <div className="w-16 h-16 rounded-full bg-[#1A2A4F]/10 flex items-center justify-center mb-3 group-hover:bg-[#1A2A4F]/20 group-hover:scale-110 transition-all duration-300">
                        <Icon size={28} className="text-[#1A2A4F]" />
                      </div>
                      <span className="text-sm font-semibold text-center text-[#1A2A4F] group-hover:text-[#2A3A6F] transition-colors px-2">
                        {category}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A2A4F] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <SectionDivider />
    </>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: "Browse Gigs",
      description:
        "Explore a variety of services offered by talented students in your campus community.",
    },
    {
      icon: Briefcase,
      title: "Hire or Apply",
      description:
        "Hire skilled students or apply to gigs that match your expertise.",
    },
    {
      icon: CheckCircle,
      title: "Complete Project",
      description:
        "Get your project delivered or complete gigs through our secure platform.",
    },
  ];

  return (
    <>
      <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-4">
              <CheckCircle size={16} />
              <span>Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2A4F] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Getting started with Gig Connect is easy and seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#1A2A4F]/20 via-[#1A2A4F]/40 to-[#1A2A4F]/20" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="group relative"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-2xl transition-all duration-500">
                    <div className="absolute inset-0 bg-[#1A2A4F]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative">
                      <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#1A2A4F] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {index + 1}
                      </div>

                      <div className="w-20 h-20 rounded-full bg-[#1A2A4F]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Icon size={36} className="text-[#1A2A4F]" />
                      </div>

                      <h3 className="text-xl font-bold text-[#1A2A4F] mb-3 text-center group-hover:text-[#2A3A6F] transition-colors">
                        {step.title}
                      </h3>

                      <p className="text-gray-600 text-center leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <SectionDivider variant="dots" />
    </>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
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
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = (index) => setCurrentIndex(index);

  return (
    <>
      <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full text-yellow-800 text-sm font-medium mb-4">
              <Quote size={16} />
              <span>Success Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2A4F] mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from students and clients who have transformed their projects
              through Gig Connect.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div className="transition-opacity duration-500 ease-in-out">
                <div className="flex justify-center">
                  <div className="group relative bg-white p-10 rounded-3xl shadow-xl border border-gray-200 w-full max-w-2xl hover:shadow-2xl transition-all duration-500">
                    <div className="absolute inset-0 bg-[#1A2A4F]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-[#1A2A4F] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Quote className="text-white" size={32} />
                      </div>

                      <p className="text-xl text-gray-700 mb-8 italic leading-relaxed text-center">
                        "{testimonials[currentIndex].quote}"
                      </p>

                      <div className="text-center">
                        <p className="text-[#1A2A4F] font-bold text-lg mb-1">
                          {testimonials[currentIndex].author}
                        </p>
                        <p className="text-gray-600">
                          {testimonials[currentIndex].role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-10 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-[#1A2A4F]"
                      : "w-2 bg-gray-300 hover:bg-[#1A2A4F]/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <SectionDivider />
    </>
  );
};

const CTABanner = ({ userRole }) => {
  const ctaMessage =
    userRole === "Seller"
      ? "Post your first gig and reach clients today!"
      : userRole === "Buyer"
      ? "Find the perfect student talent for your project!"
      : "Join Gig Connect to find or post gigs in your campus!";

  return (
    <>
      <div className="relative bg-[#1A2A4F] py-20 sm:py-28 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
            <Sparkles size={16} />
            <span>Start Your Journey</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Start?
          </h2>

          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
            {ctaMessage}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/gigs"
              className="group relative px-10 py-4 bg-white text-[#1A2A4F] font-bold rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Find a Gig
                <Search
                  size={20}
                  className="group-hover:translate-x-1 group-hover:rotate-12 transition-transform duration-300"
                />
              </span>
              <div className="absolute inset-0 bg-[#1A2A4F]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>

            {userRole !== "Buyer" && (
              <Link
                to="/create-gig"
                className="group relative px-10 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Post a Gig
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </span>
                <div className="absolute inset-0 bg-white translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#1A2A4F] font-bold">
                  Post a Gig
                  <ArrowRight size={20} className="ml-2" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
      <SectionDivider variant="wave" />
    </>
  );
};

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch user profile");
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4"
            size={48}
            style={{ color: "#1A2A4F" }}
          />
          <p className="text-[#1A2A4F] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-600" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased bg-white">
      <style>
        {`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes slideInLeft {
            0% { opacity: 0; transform: translateX(-30px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animate-slideInLeft { animation: slideInLeft 0.6s ease-out; }
        `}
      </style>

      <Navbar user={user} onLogout={handleLogout} />
      <HeroSection userRole={user?.role} />
      <FeaturedGigsSection userId={user?._id} />
      <RecentGigsSection userId={user?._id} />
      <CategoriesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTABanner userRole={user?.role} />
      <Footer />
    </div>
  );
};

export default Home;
