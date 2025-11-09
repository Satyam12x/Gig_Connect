"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Code,
  PenTool,
  BookOpen,
  Users,
  CheckCircle,
  Award,
  Briefcase,
  Menu,
  X,
  LogOut,
  Plus,
  Heart,
  Star,
  ArrowRight,
  TrendingUp,
  Laptop,
  Lightbulb,
  Smile,
  Rocket,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [visibleSections, setVisibleSections] = useState({});
  const [favorites, setFavorites] = useState(new Set());

  // Mock data for authenticated user
  const mockUser = {
    name: "John Doe",
    role: "Seller",
    avatar: "👨‍💻",
    rating: 4.9,
    earnings: "₹15,000",
    completedGigs: 24,
  };

  const featuredGigs = [
    {
      id: 1,
      title: "React Website Development",
      category: "Web Development",
      price: "₹5,000",
      provider: "Sarah Tech",
      avatar: "👩‍💻",
      rating: 4.8,
      reviews: 156,
      icon: Laptop,
    },
    {
      id: 2,
      title: "Logo Design & Branding",
      category: "Graphic Design",
      price: "₹3,000",
      provider: "Alex Design",
      avatar: "🎨",
      rating: 4.9,
      reviews: 234,
      icon: PenTool,
    },
    {
      id: 3,
      title: "Physics Tutoring Session",
      category: "Tutoring",
      price: "₹500/hr",
      provider: "Priya Edutech",
      avatar: "👩‍🏫",
      rating: 5.0,
      reviews: 89,
      icon: BookOpen,
    },
    {
      id: 4,
      title: "Mobile App Development",
      category: "Web Development",
      price: "₹8,000",
      provider: "Dev Masters",
      avatar: "👨‍💼",
      rating: 4.7,
      reviews: 198,
      icon: Code,
    },
  ];

  const categories = [
    { name: "Web Development", icon: Code, count: 1240 },
    { name: "Graphic Design", icon: PenTool, count: 856 },
    { name: "Tutoring", icon: BookOpen, count: 2341 },
    { name: "Content Writing", icon: Lightbulb, count: 567 },
    { name: "Digital Marketing", icon: TrendingUp, count: 432 },
    { name: "Video Editing", icon: Smile, count: 234 },
  ];

  const stats = [
    { icon: TrendingUp, label: "Active Gigs", value: "2,450+" },
    { icon: Users, label: "Talented Students", value: "5,000+" },
    { icon: CheckCircle, label: "Projects Done", value: "10,000+" },
    { icon: Star, label: "Avg Rating", value: "4.9/5" },
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const handleLogin = () => {
    // Check for token
    const token = localStorage.getItem("token");
    if (token) {
      setUser(mockUser);
    }
  };

  useEffect(() => {
    handleLogin();
  }, []);

  return (
    <div className="w-full bg-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Rocket className="text-blue-600" size={28} />
              <span className="text-2xl font-bold text-blue-600">
                GigConnect
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#categories"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Categories
              </a>
              <a
                href="#gigs"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Browse Gigs
              </a>
              <a
                href="#stats"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Stats
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <Plus size={18} />
                Post a Gig
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <span className="text-2xl">{mockUser.avatar}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a
                href="#categories"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
              >
                Categories
              </a>
              <a
                href="#gigs"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
              >
                Browse Gigs
              </a>
              <button className="w-full text-left px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg flex items-center gap-2">
                <Plus size={18} />
                Post a Gig
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 font-semibold flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="max-w-6xl mx-auto">
          <div
            data-animate
            className={`text-center mb-12 transition-all duration-1000 ${
              visibleSections["hero"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            id="hero"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Welcome Back,{" "}
              <span className="text-blue-600">
                {mockUser.name.split(" ")[0]}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Discover amazing gigs or manage your services. Let's grow
              together!
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto flex gap-3">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search for gigs, skills, or services..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
                Search
              </button>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Star, label: "Rating", value: mockUser.rating },
              {
                icon: Briefcase,
                label: "Completed",
                value: mockUser.completedGigs,
              },
              { icon: TrendingUp, label: "Earnings", value: mockUser.earnings },
              { icon: Award, label: "Badge", value: "Top Rated" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  data-animate
                  className={`p-4 bg-white border-2 border-gray-100 rounded-xl transition-all duration-1000 ${
                    visibleSections["hero"]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="text-blue-600" size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section id="categories" data-animate className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div
            className={`mb-16 transition-all duration-1000 ${
              visibleSections["categories"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-gray-600">
              Browse thousands of gigs across different categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  data-animate
                  className={`group p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                    visibleSections["categories"]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-center mb-1 group-hover:text-blue-600">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-gray-500 text-center">
                    {cat.count} gigs
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED GIGS SECTION */}
      <section
        id="gigs"
        data-animate
        className="py-20 px-4 bg-gradient-to-br from-blue-50 to-cyan-50"
      >
        <div className="max-w-6xl mx-auto">
          <div
            className={`flex justify-between items-start mb-16 transition-all duration-1000 ${
              visibleSections["gigs"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured Gigs
              </h2>
              <p className="text-lg text-gray-600">
                Top opportunities tailored for you
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition">
              View All
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredGigs.map((gig, idx) => {
              const Icon = gig.icon;
              const isFavorited = favorites.has(gig.id);
              return (
                <div
                  key={gig.id}
                  data-animate
                  className={`group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    visibleSections["gigs"]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                        <Icon className="text-blue-600" size={28} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {gig.title}
                        </h3>
                        <p className="text-sm text-gray-500">{gig.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(gig.id)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Heart
                        size={24}
                        className={`transition ${
                          isFavorited
                            ? "fill-red-500 text-red-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    {gig.price}
                  </p>

                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{gig.avatar}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {gig.provider}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star
                            className="text-yellow-400 fill-yellow-400"
                            size={14}
                          />
                          <span className="text-sm text-gray-600">
                            {gig.rating} ({gig.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all transform hover:scale-105">
                    View Details
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12 md:hidden">
            <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
              View All Gigs
            </button>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section id="stats" data-animate className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleSections["stats"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Platform Statistics
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by thousands of students and clients
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  data-animate
                  className={`p-8 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all duration-500 text-center transform hover:scale-105 ${
                    visibleSections["stats"]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-white" size={32} />
                  </div>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-lg text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center">
          <div
            data-animate
            className={`transition-all duration-1000 ${
              visibleSections["cta"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            id="cta"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Post Your First Gig?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Share your skills and start earning with GigConnect today. It
              takes just 5 minutes to get started.
            </p>
            <button className="px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg">
              Post Your First Gig
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="text-blue-400" size={24} />
                <span className="text-xl font-bold">GigConnect</span>
              </div>
              <p className="text-gray-400">
                Connecting student talent with opportunities.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">Post a Gig</li>
                <li className="hover:text-white cursor-pointer">My Gigs</li>
                <li className="hover:text-white cursor-pointer">Earnings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">Browse Gigs</li>
                <li className="hover:text-white cursor-pointer">My Orders</li>
                <li className="hover:text-white cursor-pointer">Messages</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">About Us</li>
                <li className="hover:text-white cursor-pointer">Contact</li>
                <li className="hover:text-white cursor-pointer">Blog</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2025 GigConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
