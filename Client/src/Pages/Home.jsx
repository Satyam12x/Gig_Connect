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
  ChevronLeft,
  ChevronRight,
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
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
    {/* Glowing Cyan Blob 1 */}
    <div className="absolute top-[-10%] right-[-10%] w-96 h-96">
      <div
        className="w-full h-full bg-gradient-to-br from-cyan-500 via-cyan-400 to-teal-600 blur-3xl animate-pulse"
        style={{
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(80px)",
          animation: "blob 8s infinite",
        }}
      />
    </div>

    {/* Glowing Cyan Blob 2 */}
    <div className="absolute bottom-[-15%] left-[-8%] w-80 h-80">
      <div
        className="w-full h-full bg-gradient-to-tr from-teal-500 via-cyan-400 to-cyan-600 blur-3xl animate-pulse animation-delay-2000"
        style={{
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          filter: "blur(80px)",
          animation: "blob 10s infinite",
        }}
      />
    </div>

    {/* Glowing Cyan Blob 3 */}
    <div className="absolute top-1/3 left-1/4 w-72 h-72">
      <div
        className="w-full h-full bg-gradient-to-bl from-cyan-400 via-teal-500 to-cyan-700 blur-3xl animate-pulse animation-delay-4000"
        style={{
          borderRadius: "70% 30% 50% 50% / 40% 60% 30% 70%",
          filter: "blur(80px)",
          animation: "blob 12s infinite",
        }}
      />
    </div>
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
            fill="currentColor"
            className="text-cyan-900/20"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative h-px my-12 mx-auto max-w-4xl">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30" />
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
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden pt-16">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
            <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 backdrop-blur-md rounded-full text-cyan-300 text-sm font-medium mb-4 border border-cyan-500/30">
                <Sparkles size={16} className="text-cyan-400" />
                <span>Welcome to Gig Connect</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Connect with
                <span className="block text-cyan-400 mt-2 drop-shadow-lg">
                  Student Talent
                </span>
              </h1>

              <p className="text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0">
                {message}
              </p>

              <form
                onSubmit={handleSearch}
                className="relative max-w-md mx-auto lg:mx-0 group"
              >
                <div className="absolute -inset-1 bg-cyan-500 rounded-lg blur-xl opacity-30 group-hover:opacity-60 transition duration-500" />
                <div className="relative flex backdrop-blur-md bg-white/5 border border-cyan-500/30 rounded-lg overflow-hidden">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for gigs..."
                    className="flex-grow p-4 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-4 bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all duration-300 flex items-center gap-2"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="group relative px-8 py-4 bg-cyan-500 text-black font-bold rounded-lg overflow-hidden transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started Free
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition"
                    />
                  </span>
                  <div className="absolute inset-0 bg-cyan-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </Link>
                <Link
                  to="/gigs"
                  className="px-8 py-4 bg-transparent text-cyan-400 font-bold rounded-lg border-2 border-cyan-500 hover:bg-cyan-500/10 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
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
                    <p className="text-3xl font-bold text-cyan-400 drop-shadow">
                      {stat.number}
                    </p>
                    <p className="text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-cyan-500 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition duration-700" />
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-8 border-gray-800">
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
      <div className="relative bg-gradient-to-b from-black via-gray-900 to-black py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 backdrop-blur-md rounded-full text-cyan-300 text-sm font-medium mb-4 border border-cyan-500/30">
              <Sparkles size={16} className="text-cyan-400" />
              <span>Top Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Featured Gigs
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Discover top services offered by talented students in your campus
              community.
            </p>
          </div>

          {error && (
            <div className="text-center text-red-400 flex items-center justify-center gap-2 mb-6">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/20 animate-pulse"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-700 mx-auto mb-4" />
                  <div className="h-6 bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-700 rounded mb-4" />
                  <div className="h-10 bg-gray-700 rounded-lg" />
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="text-center text-gray-500">
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
                    className="group relative bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-400 transition-all duration-500 shadow-xl hover:shadow-cyan-500/20"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                    <div className="relative">
                      {gig.thumbnail ? (
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-cyan-500/30 group-hover:ring-cyan-400 transition-all duration-300">
                          <img
                            src={gig.thumbnail}
                            alt={gig.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-cyan-500 mx-auto mb-4 flex items-center justify-center text-black text-xl font-bold group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          {gig.title.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <h3 className="text-xl font-semibold text-cyan-300 mb-2 group-hover:text-cyan-200 transition-colors">
                        {gig.title}
                      </h3>

                      <p className="text-gray-400 mb-2">
                        By{" "}
                        <Link
                          to={`/profile/${gig.sellerId}`}
                          className="hover:text-cyan-400 hover:underline transition-colors"
                        >
                          {gig.sellerName}
                        </Link>
                      </p>

                      <p className="text-cyan-400 font-bold mb-2">
                        From {formatINR(gig.price)}
                      </p>

                      <p
                        className={`mb-2 font-semibold ${
                          isClosed ? "text-red-400" : "text-cyan-300"
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
                              ? "text-green-400"
                              : applicationStatus === "rejected"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }`}
                        >
                          Application:{" "}
                          {applicationStatus.charAt(0).toUpperCase() +
                            applicationStatus.slice(1)}
                        </p>
                      )}

                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {gig.description}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {gig.category}
                      </p>

                      {isClosed ? (
                        <span className="block w-full px-6 py-3 bg-gray-800 text-gray-400 font-semibold rounded-lg text-center">
                          Applications Closed
                        </span>
                      ) : hasApplied ? (
                        <span className="block w-full px-6 py-3 bg-gray-800 text-gray-400 font-semibold rounded-lg text-center">
                          Application Submitted
                        </span>
                      ) : (
                        <Link
                          to={`/gigs/${gig._id}`}
                          className="group/btn relative block w-full px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg overflow-hidden text-center transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            View Details
                            <ArrowRight
                              size={16}
                              className="group-hover/btn:translate-x-1 transition-transform duration-300"
                            />
                          </span>
                          <div className="absolute inset-0 bg-cyan-400 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />
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
      <SectionDivider />
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
      <div className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 backdrop-blur-md rounded-full text-teal-300 text-sm font-medium mb-4 border border-teal-500/30">
              <TrendingUp size={16} className="text-teal-400" />
              <span>Fresh Opportunities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Recently Uploaded Gigs
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Check out the latest services posted by talented students.
            </p>
          </div>

          {error && (
            <div className="text-center text-red-400 flex items-center justify-center gap-2 mb-6">
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
                  <div className="w-3 h-3 bg-gray-700 rounded-full mt-2" />
                  <div className="flex-1 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/20">
                    <div className="h-6 bg-gray-700 rounded mb-2" />
                    <div className="h-4 bg-gray-700 rounded mb-2" />
                    <div className="h-4 bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="text-center text-gray-500">
              No recent gigs available.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/30 via-cyan-400/50 to-cyan-500/30" />
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
                        <div className="w-3 h-3 bg-cyan-400 rounded-full mt-8 ring-4 ring-gray-900 shadow-lg shadow-cyan-500/50" />
                      </div>

                      <div className="group flex-1 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-400 transition-all duration-500 shadow-xl hover:shadow-cyan-500/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                        <div className="relative flex items-start gap-4">
                          {gig.thumbnail ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-cyan-500/30 group-hover:ring-cyan-400 transition-all duration-300 flex-shrink-0">
                              <img
                                src={gig.thumbnail}
                                alt={gig.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center text-black text-xl font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              {gig.title.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-cyan-300 mb-2 group-hover:text-cyan-200 transition-colors">
                              {gig.title}
                            </h3>

                            <p className="text-gray-400 mb-2 text-sm">
                              By{" "}
                              <Link
                                to={`/profile/${gig.sellerId}`}
                                className="font-medium hover:text-cyan-300 hover:underline transition-colors"
                              >
                                {gig.sellerName}
                              </Link>
                            </p>

                            <div className="flex flex-wrap gap-3 mb-3">
                              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-semibold border border-cyan-500/30">
                                {formatINR(gig.price)}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                                  isClosed
                                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                                    : "bg-green-500/20 text-green-300 border-green-500/30"
                                }`}
                              >
                                {gig.status.charAt(0).toUpperCase() +
                                  gig.status.slice(1)}
                              </span>
                              <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm font-medium border border-gray-700">
                                {gig.category}
                              </span>
                            </div>

                            {hasApplied && (
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 border ${
                                  applicationStatus === "accepted"
                                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                                    : applicationStatus === "rejected"
                                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                                    : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                }`}
                              >
                                Application:{" "}
                                {applicationStatus.charAt(0).toUpperCase() +
                                  applicationStatus.slice(1)}
                              </span>
                            )}

                            <p className="text-gray-400 mb-4 line-clamp-2">
                              {gig.description}
                            </p>

                            {isClosed ? (
                              <span className="inline-block px-6 py-2 bg-gray-800 text-gray-400 font-semibold rounded-lg">
                                Applications Closed
                              </span>
                            ) : hasApplied ? (
                              <span className="inline-block px-6 py-2 bg-gray-800 text-gray-400 font-semibold rounded-lg">
                                Application Submitted
                              </span>
                            ) : (
                              <Link
                                to={`/gigs/${gig._id}`}
                                className="group/btn relative inline-flex items-center gap-2 px-6 py-2 bg-cyan-500 text-black font-bold rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/50"
                              >
                                <span className="relative z-10 flex items-center gap-2">
                                  View Details
                                  <ArrowRight
                                    size={16}
                                    className="group-hover/btn:translate-x-1 transition-transform duration-300"
                                  />
                                </span>
                                <div className="absolute inset-0 bg-cyan-400 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />
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
      <SectionDivider />
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
      <div className="relative bg-gradient-to-b from-black via-gray-900 to-black py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 backdrop-blur-md rounded-full text-cyan-300 text-sm font-medium mb-4 border border-cyan-500/30">
              <Users size={16} className="text-cyan-400" />
              <span>Browse by Category</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Find the perfect service for your needs from a variety of student
              talent categories.
            </p>
          </div>

          {error && (
            <div className="text-center text-red-400 flex items-center justify-center gap-2 mb-6">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-wrap justify-center gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="w-40 h-40 bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/20 flex flex-col items-center justify-center animate-pulse"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-full mb-2" />
                  <div className="w-24 h-4 bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-500">
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
                    className="group relative w-40 h-40 bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/20 flex flex-col items-center justify-center hover:border-cyan-400 transition-all duration-500 overflow-hidden shadow-xl hover:shadow-cyan-500/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                    <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-300">
                      <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3 group-hover:bg-cyan-500/40 group-hover:scale-110 transition-all duration-300 border border-cyan-500/30">
                        <Icon
                          size={28}
                          className="text-cyan-300 group-hover:text-cyan-200"
                        />
                      </div>
                      <span className="text-sm font-semibold text-center text-cyan-300 group-hover:text-cyan-200 transition-colors px-2">
                        {category}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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
      <div className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 backdrop-blur-md rounded-full text-teal-300 text-sm font-medium mb-4 border border-teal-500/30">
              <CheckCircle size={16} className="text-teal-400" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Getting started with Gig Connect is easy and seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-cyan-500/30 via-cyan-400/50 to-cyan-500/30" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="group relative"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-cyan-500/20 hover:border-cyan-400 transition-all duration-500 shadow-xl hover:shadow-cyan-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                    <div className="relative">
                      <div className="absolute -top-4 -right-4 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-500/50">
                        {index + 1}
                      </div>

                      <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-cyan-500/30">
                        <Icon
                          size={36}
                          className="text-cyan-300 group-hover:text-cyan-200"
                        />
                      </div>

                      <h3 className="text-xl font-bold text-cyan-300 mb-3 text-center group-hover:text-cyan-200 transition-colors">
                        {step.title}
                      </h3>

                      <p className="text-gray-400 text-center leading-relaxed">
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
      <SectionDivider />
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

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div className="relative bg-gradient-to-b from-black via-gray-900 to-black py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 backdrop-blur-md rounded-full text-yellow-300 text-sm font-medium mb-4 border border-yellow-500/30">
              <Quote size={16} className="text-yellow-400" />
              <span>Success Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Hear from students and clients who have transformed their projects
              through Gig Connect.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="group relative bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-cyan-500/20 hover:border-cyan-400 transition-all duration-500 shadow-2xl hover:shadow-cyan-500/30">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Quote className="text-black" size={32} />
                        </div>

                        <p className="text-xl text-gray-300 mb-8 italic leading-relaxed text-center">
                          "{testimonial.quote}"
                        </p>

                        <div className="text-center">
                          <p className="text-cyan-300 font-bold text-lg mb-1">
                            {testimonial.author}
                          </p>
                          <p className="text-gray-500">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all duration-300 shadow-lg"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all duration-300 shadow-lg"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>

            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-cyan-400"
                      : "w-2 bg-gray-600 hover:bg-cyan-500"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
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
      <div className="relative bg-gradient-to-r from-cyan-900 via-teal-900 to-cyan-900 py-20 sm:py-28 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium mb-6 border border-white/20">
            <Sparkles size={16} className="text-cyan-300" />
            <span>Start Your Journey</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Start?
          </h2>

          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-10">
            {ctaMessage}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/gigs"
              className="group relative px-10 py-4 bg-cyan-400 text-black font-bold rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-400/50 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Find a Gig
                <Search
                  size={20}
                  className="group-hover:translate-x-1 group-hover:rotate-12 transition-transform duration-300"
                />
              </span>
              <div className="absolute inset-0 bg-cyan-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>

            {userRole !== "Buyer" && (
              <Link
                to="/create-gig"
                className="group relative px-10 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-cyan-400 overflow-hidden hover:shadow-2xl hover:shadow-cyan-400/50 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Post a Gig
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </span>
                <div className="absolute inset-0 bg-cyan-400 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-black font-bold">
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4"
            size={48}
            style={{ color: "#06b6d4" }}
          />
          <p className="text-cyan-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased bg-black">
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
          .animation-delay-4000 { animation-delay: 4s; }
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
