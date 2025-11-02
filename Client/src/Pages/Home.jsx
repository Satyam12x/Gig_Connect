"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

// Animation Hook for Scroll-Based Effects
const useIntersectionObserver = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
};

// Hero Section
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
    <section className="relative min-h-[90vh] bg-gradient-to-br from-white via-blue-50 to-indigo-50 overflow-hidden pt-24 pb-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300 to-indigo-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-indigo-200 to-blue-100 rounded-full opacity-15 blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-blue-100 rounded-full opacity-10 blur-2xl animate-float-slow"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-in-left">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Sparkles size={16} />
                Join 5,000+ Student Professionals
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Connect with
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Student Talent
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed mb-8">
                {message}
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gigs or talents..."
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-300"
                  aria-label="Search gigs"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                aria-label="Submit search"
              >
                <Search size={20} />
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
              >
                Get Started Free
              </Link>
              <Link
                to="/gigs"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold border-2 border-blue-200 hover:bg-blue-50 transition-all duration-300 text-center"
              >
                Browse Gigs
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
              <div>
                <p className="text-3xl font-bold text-gray-900">5,000+</p>
                <p className="text-gray-600">Active Students</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">10,000+</p>
                <p className="text-gray-600">Projects Done</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-gray-600">4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:flex items-center justify-center animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl opacity-10 blur-2xl"></div>
            <div className="relative w-96 h-96 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop"
                alt="Students collaborating"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white px-6 py-4 rounded-2xl shadow-xl border-2 border-blue-100 animate-bounce-slow">
              <p className="text-sm text-gray-600">Trusted by</p>
              <p className="text-2xl font-bold text-gray-900">50+ Colleges</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

// Premium Card Component
const PremiumCard = ({
  children,
  className = "",
  animated = true,
  delay = 0,
}) => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 overflow-hidden ${
        animated && isVisible ? "animate-card-in" : "opacity-0"
      } ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Featured Gigs Section
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
    <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Featured Gigs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover top services offered by talented students in your campus
            community.
          </p>
        </div>

        {error && (
          <div className="text-center text-red-600 font-medium flex items-center justify-center gap-2 mb-8">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-gray-200 rounded-2xl animate-pulse"
              ></div>
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
              const hasApplied = !!applicationStatus;
              const isClosed = gig.status === "closed";

              return (
                <PremiumCard key={gig._id} delay={idx * 100}>
                  <div className="p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      {gig.thumbnail ? (
                        <img
                          src={gig.thumbnail || "/placeholder.svg"}
                          alt={gig.title}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                          {gig.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {gig.category}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {gig.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {gig.description}
                    </p>

                    {/* Seller Info */}
                    <p className="text-sm text-gray-700 mb-4">
                      By{" "}
                      <Link
                        to={`/profile/${gig.sellerId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {gig.sellerName}
                      </Link>
                    </p>

                    {/* Status and Price */}
                    <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          ${gig.price}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            isClosed ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isClosed ? "Closed" : "Open"}
                        </p>
                      </div>
                    </div>

                    {/* Button */}
                    <div className="mt-auto">
                      {isClosed || hasApplied ? (
                        <button className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold cursor-not-allowed">
                          {isClosed ? "Closed" : "Applied"}
                        </button>
                      ) : (
                        <Link
                          to={`/gigs/${gig._id}`}
                          className="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-center transform hover:scale-105"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes card-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-card-in {
          animation: card-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </section>
  );
};

// Recent Gigs Timeline Section
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
        setGigs(gigsResponse.data.slice(0, 5));
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
    <section className="relative py-20 bg-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-100 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Recently Uploaded
          </h2>
          <p className="text-xl text-gray-600">
            Check out the latest services posted by talented students.
          </p>
        </div>

        {error && (
          <div className="text-center text-red-600 font-medium flex items-center justify-center gap-2 mb-8">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center text-gray-600">
            No recent gigs available.
          </div>
        ) : (
          <div className="space-y-4">
            {gigs.map((gig, idx) => {
              const applicationStatus = getApplicationStatus(gig._id);
              const hasApplied = !!applicationStatus;
              const isClosed = gig.status === "closed";

              return (
                <PremiumCard
                  key={gig._id}
                  delay={idx * 80}
                  className="!shadow-sm hover:shadow-md"
                >
                  <div className="p-6 flex items-center gap-6">
                    {/* Icon */}
                    {gig.thumbnail ? (
                      <img
                        src={gig.thumbnail || "/placeholder.svg"}
                        alt={gig.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {gig.title.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {gig.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        By{" "}
                        <Link
                          to={`/profile/${gig.sellerId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {gig.sellerName}
                        </Link>{" "}
                        • ${gig.price}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {gig.description}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      {isClosed || hasApplied ? (
                        <button className="px-6 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed">
                          {isClosed ? "Closed" : "Applied"}
                        </button>
                      ) : (
                        <Link
                          to={`/gigs/${gig._id}`}
                          className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                        >
                          View <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// Categories Section
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
    <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Explore Categories
          </h2>
          <p className="text-xl text-gray-600">
            Find the perfect service for your needs.
          </p>
        </div>

        {error && (
          <div className="text-center text-red-600 font-medium flex items-center justify-center gap-2 mb-8">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-gray-300 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => {
              const Icon = categoryIcons[category] || Users;
              return (
                <Link
                  key={idx}
                  to={`/gigs?category=${encodeURIComponent(category)}`}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <PremiumCard
                    delay={idx * 50}
                    className="h-40 flex flex-col items-center justify-center text-center group-hover:scale-105"
                  >
                    <Icon className="w-10 h-10 text-blue-600 mb-3 group-hover:text-indigo-600 transition-colors" />
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category}
                    </h3>
                  </PremiumCard>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: "Browse Gigs",
      description:
        "Explore services offered by talented students in your community.",
    },
    {
      icon: Briefcase,
      title: "Hire or Apply",
      description:
        "Hire skilled students or apply to gigs that match your expertise.",
    },
    {
      icon: CheckCircle,
      title: "Complete & Earn",
      description: "Get projects delivered through our secure platform.",
    },
  ];

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Getting started is easy and seamless.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <PremiumCard key={idx} delay={idx * 100} className="relative">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/3 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></div>
                )}
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
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
        "As a student, I showcased my portfolio and landed my first freelance gig within a week.",
      author: "Apoorva Sharma",
      role: "Computer Science Student",
    },
    {
      quote:
        "The platform made collaboration seamless and trustworthy. Highly recommended!",
      author: "Priya Gupta",
      role: "Marketing Coordinator",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const goToPrev = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      );
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            What Users Say
          </h2>
          <p className="text-xl text-gray-600">
            Hear from students and clients who transformed their projects.
          </p>
        </div>

        <div className="relative">
          <PremiumCard className="!border-0 !shadow-xl p-12">
            <div className="flex flex-col items-center text-center animate-fade-in">
              <Quote className="w-12 h-12 text-blue-600 mb-6" />
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </p>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {testimonials[currentIndex].author}
                </p>
                <p className="text-sm text-gray-600">
                  {testimonials[currentIndex].role}
                </p>
              </div>
            </div>
          </PremiumCard>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goToPrev}
              className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-300"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "bg-blue-600 w-8" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-300"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </section>
  );
};

// CTA Section
const CTASection = ({ userRole, userId }) => {
  return (
    <section className="relative py-24 bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Join thousands of students and clients transforming their projects on
          Gig Connect.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/gigs"
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Find a Gig
          </Link>
          {userRole !== "Buyer" && (
            <Link
              to="/create-gig"
              className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-all duration-300"
            >
              Post a Gig
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

// Main Home Component
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
        setError(err.response?.data?.error || "Failed to fetch profile");
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <AlertTriangle className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white">
      <HeroSection userRole={user?.role} />
      <FeaturedGigsSection userId={user?._id} />
      <RecentGigsSection userId={user?._id} />
      <CategoriesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection userRole={user?.role} userId={user?._id} />
    </div>
  );
};

export default Home;
