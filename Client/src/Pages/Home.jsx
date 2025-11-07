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
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Light-blob – subtle cyan accent */}
    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 opacity-15">
      <div
        className="w-full h-full bg-gradient-to-br from-cyan-300 via-cyan-200 to-cyan-400 blur-3xl animate-pulse"
        style={{
          borderRadius: "50%",
          clipPath:
            "path('M 0.5 0.3 Q 0.7 0.1, 0.9 0.3 T 1 0.7 Q 0.8 0.9, 0.5 0.8 T 0 0.7 Q 0.2 0.5, 0.3 0.3 Z')",
          transform: "scale(1.2) rotate(12deg)",
        }}
      />
    </div>
    <div className="absolute bottom-[-15%] left-[-8%] w-80 h-80 opacity-10">
      <div
        className="w-full h-full bg-gradient-to-tr from-cyan-200 via-cyan-300 to-cyan-500 blur-3xl animate-pulse animation-delay-2000"
        style={{
          borderRadius: "50%",
          clipPath:
            "path('M 0.4 0.2 Q 0.6 0.05, 0.8 0.25 T 0.95 0.6 Q 0.85 0.85, 0.6 0.9 T 0.3 0.8 Q 0.15 0.6, 0.2 0.4 Z')",
          transform: "scale(1.3) rotate(-6deg)",
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
            fill="#f0f9ff"
            fillOpacity="0.6"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className="relative h-1 my-12 mx-auto max-w-4xl">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40" />
    </div>
  );
};

/* ---------- HERO ---------- */
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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Connect with
                <span className="block text-cyan-600 mt-2">Student Talent</span>
              </h1>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
                {message}
              </p>

              <form
                onSubmit={handleSearch}
                className="relative max-w-md mx-auto lg:mx-0 group"
              >
                <div className="absolute -inset-0.5 bg-cyan-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300" />
                <div className="relative flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for gigs..."
                    className="flex-grow p-4 rounded-l-lg border-2 border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white shadow-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-4 bg-cyan-500 text-white rounded-r-lg hover:bg-cyan-600 transition-all duration-300"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/gigs"
                  className="px-8 py-4 bg-white text-cyan-600 font-semibold rounded-lg border-2 border-cyan-500 hover:bg-cyan-50 transition-all duration-300 flex items-center justify-center gap-2"
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
                    <p className="text-3xl font-bold text-cyan-600">
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

/* ---------- FEATURED GIGS ---------- */
const FeaturedGigsSection = ({ userId }) => {
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [gigsRes, appsRes] = await Promise.all([
          axios.get(`${API_BASE}/gigs/recent`),
          token
            ? axios.get(`${API_BASE}/users/${userId}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : { data: [] },
        ]);
        setGigs(gigsRes.data.slice(0, 4));
        setApplications(appsRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch gigs");
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const getApplicationStatus = (gigId) =>
    applications.find((a) => a.gigId._id === gigId)?.status || null;

  return (
    <>
      <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Clean centered title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 relative inline-block">
              Featured Gigs
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-cyan-500 rounded-full"></span>
            </h2>
          </div>

          {error && (
            <div className="text-center text-red-600 flex items-center justify-center gap-2 mb-6">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-6 rounded-2xl shadow animate-pulse"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4" />
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-10 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <p className="text-center text-gray-600">
              No gigs available at the moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gigs.map((gig, idx) => {
                const appStatus = getApplicationStatus(gig._id);
                const closed = gig.status === "closed";
                const applied = !!appStatus;

                return (
                  <div
                    key={gig._id}
                    className="group relative bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:border-cyan-400 transition-all duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {gig.thumbnail ? (
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-transparent group-hover:ring-cyan-200 transition-all">
                        <img
                          src={gig.thumbnail}
                          alt={gig.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-cyan-500 mx-auto mb-4 flex items-center justify-center text-white font-bold">
                        {gig.title[0].toUpperCase()}
                      </div>
                    )}

                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-cyan-700 transition-colors">
                      {gig.title}
                    </h3>

                    <p className="text-gray-600 mb-2">
                      By{" "}
                      <Link
                        to={`/profile/${gig.sellerId}`}
                        className="hover:text-cyan-600 hover:underline"
                      >
                        {gig.sellerName}
                      </Link>
                    </p>

                    <p className="text-cyan-600 font-bold mb-2">
                      From {formatINR(gig.price)}
                    </p>

                    <p
                      className={`mb-2 font-semibold ${
                        closed ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </p>

                    {applied && (
                      <p
                        className={`text-sm font-semibold mb-2 ${
                          appStatus === "accepted"
                            ? "text-green-600"
                            : appStatus === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Application:{" "}
                        {appStatus.charAt(0).toUpperCase() + appStatus.slice(1)}
                      </p>
                    )}

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {gig.description}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">{gig.category}</p>

                    {closed ? (
                      <span className="block w-full px-6 py-3 bg-gray-200 text-gray-600 font-semibold rounded-lg text-center">
                        Applications Closed
                      </span>
                    ) : applied ? (
                      <span className="block w-full px-6 py-3 bg-gray-200 text-gray-600 font-semibold rounded-lg text-center">
                        Application Submitted
                      </span>
                    ) : (
                      <Link
                        to={`/gigs/${gig._id}`}
                        className="group/btn relative block w-full px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg overflow-hidden text-center"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          View Details
                          <ArrowRight
                            size={16}
                            className="group-hover/btn:translate-x-1 transition"
                          />
                        </span>
                        <div className="absolute inset-0 bg-cyan-600 translate-x-full group-hover/btn:translate-x-0 transition-transform" />
                      </Link>
                    )}
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

/* ---------- RECENT GIGS ---------- */
const RecentGigsSection = ({ userId }) => {
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [gigsRes, appsRes] = await Promise.all([
          axios.get(`${API_BASE}/gigs/recent`),
          token
            ? axios.get(`${API_BASE}/users/${userId}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : { data: [] },
        ]);
        setGigs(gigsRes.data.slice(0, 6));
        setApplications(appsRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch recent gigs");
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const getApplicationStatus = (gigId) =>
    applications.find((a) => a.gigId._id === gigId)?.status || null;

  return (
    <>
      <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 relative inline-block">
              Recently Uploaded Gigs
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-cyan-500 rounded-full"></span>
            </h2>
          </div>

          {error && (
            <div className="text-center text-red-600 flex items-center justify-center gap-2 mb-6">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 animate-pulse">
                  <div className="w-3 h-3 bg-gray-200 rounded-full mt-2" />
                  <div className="flex-1 bg-gray-50 p-6 rounded-2xl shadow">
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <p className="text-center text-gray-600">
              No recent gigs available.
            </p>
          ) : (
            <div className="relative">
              <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400/30 via-cyan-400/60 to-cyan-400/30" />
              <div className="space-y-6">
                {gigs.map((gig, idx) => {
                  const appStatus = getApplicationStatus(gig._id);
                  const closed = gig.status === "closed";
                  const applied = !!appStatus;

                  return (
                    <div
                      key={gig._id}
                      className="flex items-start gap-6 opacity-0 animate-slideInLeft"
                      style={{
                        animationDelay: `${idx * 100}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <div className="relative z-10">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full mt-8 ring-4 ring-white shadow-md" />
                      </div>

                      <div className="group flex-1 bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:border-cyan-400 transition-all duration-300">
                        <div className="absolute inset-0 bg-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative flex items-start gap-4">
                          {gig.thumbnail ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-cyan-200 transition-all flex-shrink-0">
                              <img
                                src={gig.thumbnail}
                                alt={gig.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                              {gig.title[0].toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-700 transition-colors">
                              {gig.title}
                            </h3>

                            <p className="text-gray-600 mb-2 text-sm">
                              By{" "}
                              <Link
                                to={`/profile/${gig.sellerId}`}
                                className="font-medium hover:text-cyan-600 hover:underline"
                              >
                                {gig.sellerName}
                              </Link>
                            </p>

                            <div className="flex flex-wrap gap-3 mb-3">
                              <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-semibold">
                                {formatINR(gig.price)}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  closed
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                Status:{" "}
                                {gig.status.charAt(0).toUpperCase() +
                                  gig.status.slice(1)}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                {gig.category}
                              </span>
                            </div>

                            {applied && (
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${
                                  appStatus === "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : appStatus === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                Application:{" "}
                                {appStatus.charAt(0).toUpperCase() +
                                  appStatus.slice(1)}
                              </span>
                            )}

                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {gig.description}
                            </p>

                            {closed ? (
                              <span className="inline-block px-6 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg">
                                Applications Closed
                              </span>
                            ) : applied ? (
                              <span className="inline-block px-6 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg">
                                Application Submitted
                              </span>
                            ) : (
                              <Link
                                to={`/gigs/${gig._id}`}
                                className="group/btn relative inline-flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white font-semibold rounded-lg overflow-hidden"
                              >
                                <span className="relative z-10 flex items-center gap-2">
                                  View Details
                                  <ArrowRight
                                    size={16}
                                    className="group-hover/btn:translate-x-1 transition"
                                  />
                                </span>
                                <div className="absolute inset-0 bg-cyan-600 translate-x-full group-hover/btn:translate-x-0 transition-transform" />
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

/* ---------- CATEGORIES ---------- */
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
        const res = await axios.get(`${API_BASE}/categories`);
        setCategories(res.data.categories || []);
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
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 relative inline-block">
              Explore Categories
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-cyan-500 rounded-full"></span>
            </h2>
          </div>

          {error && (
            <div className="text-center text-red-600 flex items-center justify-center gap-2 mb-6">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-wrap justify-center gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-40 h-40 bg-gray-50 rounded-2xl shadow animate-pulse flex flex-col items-center justify-center"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full mb-2" />
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-600">
              No categories available.
            </p>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {categories.map((cat, i) => {
                const Icon = categoryIcons[cat] || Users;
                return (
                  <Link
                    key={i}
                    to={`/gigs?category=${encodeURIComponent(cat)}`}
                    className="group relative w-40 h-40 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col items-center justify-center hover:border-cyan-400 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 transform group-hover:-translate-y-1 transition-transform">
                      <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mb-3 group-hover:bg-cyan-200 group-hover:scale-110 transition-all">
                        <Icon
                          size={28}
                          className="text-cyan-600 group-hover:text-cyan-800"
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-cyan-700 transition-colors px-2">
                        {cat}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
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

/* ---------- HOW IT WORKS ---------- */
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
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 relative inline-block">
              How It Works
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-cyan-500 rounded-full"></span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-cyan-300/30 via-cyan-400/60 to-cyan-300/30" />
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="group relative"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="relative bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:border-cyan-400 hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative">
                      <div className="absolute -top-4 -right-4 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {i + 1}
                      </div>

                      <div className="w-20 h-20 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <Icon
                          size={36}
                          className="text-cyan-600 group-hover:text-cyan-800"
                        />
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 text-center group-hover:text-cyan-700 transition-colors">
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
      <SectionDivider />
    </>
  );
};

/* ---------- TESTIMONIALS ---------- */
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

  const [idx, setIdx] = useState(0);
  const goPrev = () =>
    setIdx((p) => (p === 0 ? testimonials.length - 1 : p - 1));
  const goNext = () =>
    setIdx((p) => (p === testimonials.length - 1 ? 0 : p + 1));
  const goTo = (i) => setIdx(i);

  return (
    <>
      <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 relative inline-block">
              What Our Users Say
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-cyan-500 rounded-full"></span>
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${idx * 100}%)` }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4">
                    <div className="group relative bg-white p-10 rounded-3xl shadow-xl border border-gray-200 hover:border-cyan-400 transition-all duration-300">
                      <div className="absolute inset-0 bg-cyan-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                          <Quote className="text-white" size={32} />
                        </div>

                        <p className="text-xl text-gray-700 mb-8 italic leading-relaxed text-center">
                          "{t.quote}"
                        </p>

                        <div className="text-center">
                          <p className="text-cyan-600 font-bold text-lg mb-1">
                            {t.author}
                          </p>
                          <p className="text-gray-600">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all"
            >
              <ChevronRight size={24} />
            </button>

            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === idx
                      ? "w-8 bg-cyan-500"
                      : "w-2 bg-gray-300 hover:bg-cyan-400"
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

/* ---------- CTA ---------- */
const CTABanner = ({ userRole }) => {
  const cta =
    userRole === "Seller"
      ? "Post your first gig and reach clients today!"
      : userRole === "Buyer"
      ? "Find the perfect student talent for your project!"
      : "Join Gig Connect to find or post gigs in your campus!";

  return (
    <>
      <div className="relative bg-gradient-to-r from-cyan-500 to-cyan-600 py-20 sm:py-28 overflow-hidden">
        <BackgroundShapes />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Start?
          </h2>

          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">{cta}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/gigs"
              className="group relative px-10 py-4 bg-white text-cyan-600 font-bold rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Find a Gig
                <Search
                  size={20}
                  className="group-hover:translate-x-1 group-hover:rotate-12 transition-transform"
                />
              </span>
              <div className="absolute inset-0 bg-cyan-100 translate-y-full group-hover:translate-y-0 transition-transform" />
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
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
                <div className="absolute inset-0 bg-white translate-x-full group-hover:translate-x-0 transition-transform" />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-cyan-600 font-bold">
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

/* ---------- HOME PAGE ---------- */
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
        const res = await axios.get(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
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
            className="animate-spin mx-auto mb-4 text-cyan-500"
            size={48}
          />
          <p className="text-cyan-600 font-medium">Loading...</p>
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
          @keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(.9)} }
          @keyframes slideInLeft { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          .animate-slideInLeft { animation: slideInLeft .6s ease-out; }
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
