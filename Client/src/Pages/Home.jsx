import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Code,
  PenTool,
  BookOpen,
  Laptop,
  Heart,
  Star,
  Briefcase,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowRight,
  Users,
  Zap,
  Shield,
  CheckCircle,
  MessageSquare,
  Clock,
  Activity,
  Sparkles,
  Globe,
  Layers,
  Terminal,
  Palette,
  Calculator,
  Filter,
  SortDesc,
  TrendingDown,
  Eye,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const COLORS = {
  navy: "#1A2A4F",
  navyLight: "#2A3A6F",
  navyDark: "#0F1729",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray600: "#4B5563",
  gray900: "#111827",
};

const formatINR = (amount) => {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

// --- COMPONENTS ---

const StatCard = ({ icon: Icon, label, value, sublabel }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-xl bg-blue-50 text-[#1A2A4F] group-hover:bg-[#1A2A4F] group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      {sublabel && (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
          {sublabel}
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-sm text-gray-500 font-medium">{label}</p>
  </div>
);

const CategoryPill = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-full shadow-sm hover:shadow-md hover:border-[#1A2A4F]/30 hover:bg-[#1A2A4F] hover:text-white transition-all duration-300 active:scale-95 group/pill"
  >
    <Icon
      size={18}
      className="text-gray-400 group-hover/pill:text-white transition-colors duration-300"
    />
    <span className="font-medium text-gray-700 group-hover/pill:text-white transition-colors duration-300">
      {label}
    </span>
  </button>
);

const BentoItem = ({ title, desc, icon: Icon, className }) => (
  <div
    className={`relative overflow-hidden rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group ${className}`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
    <div className="relative z-10 h-full flex flex-col justify-between">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 text-[#1A2A4F] group-hover:bg-[#1A2A4F] group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#1A2A4F] mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      try {
        const [categoriesRes, gigsRes] = await Promise.all([
          axios.get(`${API_BASE}/categories`),
          axios.get(`${API_BASE}/gigs/recent`),
        ]);

        setCategories(categoriesRes.data.categories || []);
        setGigs(gigsRes.data.slice(0, 6));

        if (token) {
          try {
            const userRes = await axios.get(`${API_BASE}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const userId = userRes.data._id;
            setUser(userRes.data);
            const [appsRes, ticketsRes] = await Promise.all([
              axios.get(`${API_BASE}/users/${userId}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get(`${API_BASE}/users/${userId}/tickets`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);
            setApplications(appsRes.data);
            setTickets(ticketsRes.data);
          } catch (e) {
            localStorage.removeItem("token");
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim())
      navigate(`/gigs?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const toggleFavorite = (gigId) => {
    const newFavs = new Set(favorites);
    newFavs.has(gigId) ? newFavs.delete(gigId) : newFavs.add(gigId);
    setFavorites(newFavs);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // Filter and sort gigs
  const filteredGigs = gigs
    .filter((gig) => {
      if (filterCategory === "all") return true;
      return gig.category === filterCategory;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#1A2A4F] selection:text-white">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fade-in-up { 
          animation: fadeInUp 0.8s ease-out forwards; 
        }
        .animate-fade-in { 
          animation: fadeIn 0.6s ease-out forwards; 
        }
        .animate-slide-in { 
          animation: slideIn 0.7s ease-out forwards; 
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>

      <Navbar user={user} onLogout={handleLogout} />

      {/* --- HERO SECTION (Redesigned with Smooth Animations) --- */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-white via-gray-50/30 to-white">
        {/* Animated Gradient Orbs - Smoother movement */}
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-[100px] animate-[float_20s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-purple-50/30 to-blue-50/30 rounded-full blur-[90px] animate-[float_25s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-indigo-50/20 to-gray-50/20 rounded-full blur-[70px] animate-[float_15s_ease-in-out_infinite]"></div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust Badge with smoother entrance */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/60 text-[#1A2A4F] text-sm font-semibold mb-8 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 animate-fade-in">
              <Sparkles size={16} className="text-[#1A2A4F] animate-pulse" />
              <span>Trusted by 10,000+ Students & Clients</span>
            </div>

            {/* Main Headline with staggered animation */}
            <h1 
              className="text-5xl md:text-7xl font-extrabold text-[#1A2A4F] tracking-tight mb-6 leading-[1.1] animate-fade-in-up" 
              style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
            >
              Hire Expert Student
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A2A4F] via-blue-600 to-indigo-600 animate-gradient">
                Freelancers Instantly
              </span>
            </h1>

            {/* Subheadline with delay */}
            <p 
              className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" 
              style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}
            >
              Access a curated network of verified student talent. High quality work, secure payments, and lightning-fast delivery.
            </p>

            {/* Enhanced Search Bar with better hover effects */}
            <div 
              className="max-w-2xl mx-auto relative group z-20 mb-10 animate-slide-in" 
              style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <form
                onSubmit={handleSearch}
                className="relative flex items-center bg-white rounded-[20px] shadow-2xl shadow-gray-900/5 p-2 border border-gray-200/50 hover:border-gray-300/80 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-900/10"
              >
                <div className="pl-5 pr-2 text-gray-400 transition-colors duration-300 group-hover:text-[#1A2A4F]">
                  <Search size={22} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for any service..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 px-3 py-4 text-base font-medium transition-all duration-300 focus:placeholder-gray-300"
                />
                <button
                  type="submit"
                  className="bg-[#1A2A4F] text-white px-8 py-3.5 rounded-[16px] font-bold hover:bg-[#2A3A6F] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-900/30 active:scale-95 hover:scale-[1.02] flex items-center gap-2 group/btn"
                >
                  <span>Search</span>
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>
              </form>
            </div>

            {/* Category Pills with staggered entrance */}
            <div 
              className="flex flex-wrap justify-center items-center gap-3 animate-fade-in" 
              style={{ animationDelay: '0.7s', opacity: 0, animationFillMode: 'forwards' }}
            >
              <span className="text-sm font-semibold text-gray-500 py-3">
                Popular:
              </span>
              {[
                { icon: Terminal, label: "Development", category: "Web%20Development" },
                { icon: Palette, label: "Design", category: "Graphic%20Design" },
                { icon: Calculator, label: "Finance", category: "Finance" },
                { icon: Layers, label: "All Categories", category: "" }
              ].map((item, idx) => (
                <div
                  key={item.label}
                  style={{ 
                    animationDelay: `${0.8 + idx * 0.1}s`, 
                    opacity: 0, 
                    animationFillMode: 'forwards' 
                  }}
                  className="animate-fade-in"
                >
                  <CategoryPill
                    icon={item.icon}
                    label={item.label}
                    onClick={() => navigate(item.category ? `/gigs?category=${item.category}` : "/gigs")}
                  />
                </div>
              ))}
            </div>

            {/* Quick Stats Section */}
            <div 
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-fade-in" 
              style={{ animationDelay: '1.2s', opacity: 0, animationFillMode: 'forwards' }}
            >
              {[
                { label: "Active Gigs", value: "2,500+", icon: Briefcase },
                { label: "Students", value: "10,000+", icon: Users },
                { label: "Completed", value: "15,000+", icon: CheckCircle },
                { label: "Avg Rating", value: "4.8★", icon: Star }
              ].map((stat, idx) => (
                <div 
                  key={stat.label} 
                  className="text-center group hover:scale-105 transition-transform duration-300"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-[#1A2A4F] mb-3 group-hover:bg-[#1A2A4F] group-hover:text-white transition-colors">
                    <stat.icon size={20} />
                  </div>
                  <div className="text-2xl font-bold text-[#1A2A4F] mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- USER DASHBOARD (If Logged In) --- */}
      {user && (
        <section className="relative px-4 lg:px-8 pb-16 z-20 bg-gray-50 pt-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#1A2A4F]">Dashboard</h2>
                <p className="text-gray-500 mt-1">
                  Welcome back, {user.fullName}
                </p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <Link
                  to="/gigs/create"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A2A4F] text-white font-semibold hover:bg-[#2A3A6F] transition-colors shadow-lg shadow-blue-900/20"
                >
                  <Zap size={18} /> Create Gig
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={TrendingUp}
                label="Total Earnings"
                value={formatINR(user.earnings || 0)}
                sublabel="+12%"
              />
              <StatCard
                icon={Briefcase}
                label="Completed Orders"
                value={user.completedGigs || 0}
              />
              <StatCard
                icon={Star}
                label="Average Rating"
                value={user.rating?.toFixed(1) || "N/A"}
              />
              <StatCard
                icon={MessageSquare}
                label="Active Tickets"
                value={tickets.length}
              />
            </div>

            {/* Dashboard Split View */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Applications */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-[#1A2A4F]">
                    <Briefcase size={20} /> Recent Activity
                  </h3>
                </div>
                <div className="space-y-4">
                  {applications.length > 0 ? (
                    applications.slice(0, 3).map((app) => (
                      <div
                        key={app._id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-[#1A2A4F]">
                            <Clock size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#1A2A4F]">
                              {app.gigId?.title || "Gig"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            app.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : app.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats / Tickets */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-[#1A2A4F]">
                    <MessageSquare size={20} /> Negotiations
                  </h3>
                </div>
                <div className="space-y-4">
                  {tickets.length > 0 ? (
                    tickets.slice(0, 3).map((ticket) => (
                      <Link
                        to={`/tickets/${ticket._id}`}
                        key={ticket._id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-[#1A2A4F]">
                            <Shield size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#1A2A4F]">
                              {ticket.gigId?.title || "Ticket"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Status:{" "}
                              <span className="capitalize">
                                {ticket.status}
                              </span>
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          size={16}
                          className="text-gray-300 group-hover:text-[#1A2A4F]"
                        />
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No active negotiations
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- TRENDING GIGS --- */}
      <section className="py-24 px-4 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#1A2A4F]">
                Trending Services
              </h2>
              <p className="text-gray-500 mt-2">
                Highest rated gigs by students
              </p>
            </div>
            <Link
              to="/gigs"
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 font-semibold text-gray-600 hover:bg-[#1A2A4F] hover:text-white hover:border-[#1A2A4F] transition-all"
            >
              Explore All <ArrowRight size={16} />
            </Link>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1A2A4F]/20 transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <SortDesc size={18} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1A2A4F]/20 transition-all"
              >
                <option value="recent">Most Recent</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-96 bg-gray-50 rounded-3xl animate-pulse"
                  ></div>
                ))
              : filteredGigs.map((gig) => {
                  const isFav = favorites.has(gig._id);
                  return (
                    <Link
                      to={`/gigs/${gig._id}`}
                      key={gig._id}
                      className="group bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full"
                    >
                      {/* Image Container */}
                      <div className="relative h-56 bg-gray-100 rounded-2xl overflow-hidden mb-4">
                        {gig.thumbnail ? (
                          <img
                            src={gig.thumbnail}
                            alt={gig.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50">
                            <Laptop size={40} className="text-[#1A2A4F]/30" />
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#1A2A4F] text-xs font-bold px-3 py-1.5 rounded-lg">
                          {gig.category}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(gig._id);
                          }}
                          className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
                        >
                          <Heart
                            size={16}
                            className={
                              isFav
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }
                          />
                        </button>
                        <div className="absolute bottom-3 right-3 bg-[#1A2A4F] text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                          {formatINR(gig.price)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="px-2 pb-2 flex flex-col flex-1">
                        <h3 className="font-bold text-lg text-[#1A2A4F] line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                          {gig.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                          {gig.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-[#1A2A4F] flex items-center justify-center text-xs font-bold border border-gray-200">
                              {gig.sellerName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {gig.sellerName}
                            </span>
                          </div>
                          {gig.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                              <Star
                                size={14}
                                className="fill-yellow-400 text-yellow-400"
                              />{" "}
                              {gig.rating}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>

          {/* View All Button for Mobile */}
          <div className="flex justify-center mt-12 md:hidden">
            <Link
              to="/gigs"
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#1A2A4F] text-white font-semibold hover:bg-[#2A3A6F] transition-all shadow-lg"
            >
              Explore All Gigs <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURES (Bento Grid) --- */}
      <section className="py-24 px-4 lg:px-8 bg-[#F8F9FC] border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-[#1A2A4F] mb-4">
              Why Gig Connect?
            </h2>
            <p className="text-gray-500 text-lg">
              Designed to protect your work and your wallet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Left */}
            <div className="md:col-span-2 bg-white rounded-3xl p-10 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-[#1A2A4F]">
                  <Shield size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#1A2A4F] mb-3">
                  Secure Escrow Payments
                </h3>
                <p className="text-gray-500 max-w-md leading-relaxed">
                  Funds are held safely until the work is approved. This ensures
                  sellers get paid for their effort and buyers get exactly what
                  they ordered.
                </p>
              </div>
            </div>

            {/* Small Right Top */}
            <BentoItem
              title="Verified IDs"
              desc="Students are verified via college emails."
              icon={CheckCircle}
              className="bg-white"
            />

            {/* Small Left Bottom */}
            <BentoItem
              title="Fast Withdrawals"
              desc="Get paid directly to your Bank Account."
              icon={Zap}
              className="bg-white"
            />

            {/* Large Right Bottom */}
            <div className="md:col-span-2 bg-[#1A2A4F] rounded-3xl p-10 border border-[#1A2A4F] relative overflow-hidden group text-white shadow-xl shadow-blue-900/10">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2A3A6F] rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-white">
                    <Globe size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Community First</h3>
                  <p className="text-blue-100 max-w-md">
                    Connect with peers, build your portfolio, and launch your
                    freelance career while still in college.
                  </p>
                </div>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white text-[#1A2A4F] rounded-xl font-bold hover:bg-blue-50 transition-colors shrink-0"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="py-24 px-4 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-[#1A2A4F] mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 text-lg">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                desc: "Sign up with your college email, showcase your skills, and build your portfolio.",
                icon: Users,
                color: "blue"
              },
              {
                step: "02",
                title: "Browse & Apply",
                desc: "Find gigs that match your expertise. Apply with proposals and negotiate terms.",
                icon: Search,
                color: "indigo"
              },
              {
                step: "03",
                title: "Deliver & Get Paid",
                desc: "Complete the work, get it approved, and receive secure payment to your account.",
                icon: TrendingUp,
                color: "purple"
              }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Connector Line (hidden on last item) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-200 to-transparent"></div>
                )}
                
                <div className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute -top-6 left-8 w-12 h-12 bg-[#1A2A4F] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  
                  <div className={`w-16 h-16 rounded-2xl bg-${item.color}-50 flex items-center justify-center mb-6 mt-4 text-[#1A2A4F] group-hover:bg-[#1A2A4F] group-hover:text-white transition-colors`}>
                    <item.icon size={32} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#1A2A4F] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-24 px-4 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-[#1A2A4F] mb-4">
              What Students Say
            </h2>
            <p className="text-gray-500 text-lg">
              Real stories from our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Graphic Designer",
                college: "IIT Delhi",
                rating: 5,
                text: "I've earned over ₹50,000 while studying! The escrow system makes me feel secure about getting paid.",
                avatar: "P"
              },
              {
                name: "Rahul Verma",
                role: "Web Developer",
                college: "BITS Pilani",
                rating: 5,
                text: "Amazing platform for building my portfolio. Got my first 3 clients within a week of signing up!",
                avatar: "R"
              },
              {
                name: "Ananya Singh",
                role: "Content Writer",
                college: "DU",
                rating: 5,
                text: "The community is super supportive. I've learned so much and made great connections.",
                avatar: "A"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-[#1A2A4F] text-white flex items-center justify-center font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-[#1A2A4F]">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role} • {testimonial.college}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-24 px-4 lg:px-8 bg-[#1A2A4F] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { label: "Total Earnings Distributed", value: "₹1.2 Cr+", icon: TrendingUp },
              { label: "Success Rate", value: "96%", icon: CheckCircle },
              { label: "Avg. Response Time", value: "< 2 hours", icon: Clock },
              { label: "Active Categories", value: "50+", icon: Layers }
            ].map((stat, idx) => (
              <div key={idx} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4 group-hover:bg-white/20 transition-colors">
                  <stat.icon size={28} />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      {!user && (
        <section className="py-24 px-4 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto bg-white rounded-[3rem] p-12 md:p-20 text-center border border-gray-100 shadow-2xl shadow-blue-900/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1A2A4F] to-transparent opacity-20"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-gray-50 rounded-full blur-3xl opacity-50"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A2A4F] mb-6">
                Ready to launch?
              </h2>
              <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
                Stop waiting for graduation. Start building your career and
                earning money on your own terms today.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/signup"
                  className="px-10 py-4 bg-[#1A2A4F] text-white rounded-xl font-bold text-lg hover:bg-[#2A3A6F] hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-10 py-4 bg-white border border-gray-200 text-[#1A2A4F] rounded-xl font-bold text-lg hover:border-[#1A2A4F] transition-all"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;