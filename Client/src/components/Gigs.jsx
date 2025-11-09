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
  Award,
  ArrowRight,
  Grid,
  List,
  SlidersHorizontal,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";
const NAVY = "#1A2A4F";
const CYAN = "#06B6D4";
const PLACEHOLDER_IMG = "/api/placeholder-gig.jpg";

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
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredGig, setHoveredGig] = useState(null);

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

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("animate-in");
          }, index * 50);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isLoading, gigs]);

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

  const categoryColors = useMemo(
    () =>
      categories.reduce((acc, category, index) => {
        const colors = [NAVY, "#2d3d63", "#3a4a7f", "#4a5a9f"];
        acc[category] = colors[index % colors.length];
        return acc;
      }, {}),
    [categories]
  );

  const GigCard = ({ gig, isFeatured = false, index = 0 }) => {
    const userApplication = userApplications.find(
      (app) => app.gigId === gig._id
    );
    const isOwner = gig.sellerId === userId;
    const isFavorited = favorites.includes(gig._id);
    const isHovered = hoveredGig === gig._id;

    return (
      <div
        className={`gig-card scroll-animate ${
          viewMode === "list" ? "list-view" : ""
        }`}
        onMouseEnter={() => setHoveredGig(gig._id)}
        onMouseLeave={() => setHoveredGig(null)}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className={`gig-card-inner ${viewMode === "list" ? "flex" : ""}`}>
          <div
            className={`gig-image-container ${
              viewMode === "list" ? "w-1/3" : ""
            }`}
          >
            <img
              src={gig.thumbnail || PLACEHOLDER_IMG}
              alt={gig.title}
              className="gig-image"
              onError={(e) => (e.target.src = PLACEHOLDER_IMG)}
            />
            <div className="gig-image-overlay"></div>

            {isFeatured && (
              <div className="featured-badge">
                <Sparkles className="h-3 w-3" /> Featured
              </div>
            )}

            <div
              className="category-badge"
              style={{ backgroundColor: categoryColors[gig.category] || NAVY }}
            >
              {gig.category}
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleFavorite(gig._id);
              }}
              className="favorite-btn"
            >
              <Heart
                className={`h-5 w-5 transition-all duration-300 ${
                  isFavorited
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-white"
                }`}
              />
            </button>
          </div>

          <div className={`gig-content ${viewMode === "list" ? "w-2/3" : ""}`}>
            <div className="gig-header">
              <h3 className="gig-title">{gig.title}</h3>
              <p className="gig-seller">
                by {gig.sellerName || "Unknown Seller"}
              </p>
            </div>

            <p className="gig-description">{gig.description}</p>

            <div className="gig-meta">
              <div className="gig-price">
                <span className="price-label">Budget</span>
                <span className="price-value">
                  ₹{gig.price.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="gig-time">
                <Clock className="h-4 w-4" />
                <span>Just posted</span>
              </div>
            </div>

            <div className="gig-actions">
              {isOwner ? (
                <Link
                  to={`/gigs/${gig._id}`}
                  className="btn-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Users className="h-4 w-4" />
                  View Applicants ({applicants[gig._id]?.length || 0})
                </Link>
              ) : (
                <div className="action-buttons">
                  <Link
                    to={`/gigs/${gig._id}`}
                    className="btn-secondary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  {userApplication ? (
                    <div
                      className={`status-badge status-${userApplication.status}`}
                    >
                      {userApplication.status.charAt(0).toUpperCase() +
                        userApplication.status.slice(1)}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleApply(gig._id);
                      }}
                      disabled={isApplying[gig._id]}
                      className="btn-apply"
                    >
                      {isApplying[gig._id] ? (
                        <>
                          <div className="spinner"></div>
                          Applying...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Apply Now
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {isHovered && <div className="gig-glow"></div>}
        </div>
      </div>
    );
  };

  return (
    <div className="gigs-page">
      {/* Background Shapes */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .gigs-page {
          min-height: 100vh;
          background: white;
          position: relative;
          overflow-x: hidden;
        }

        .background-shapes {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .shape {
          position: absolute;
          opacity: 0.1;
          filter: blur(60px);
        }

        .shape-1 {
          top: -10%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, ${CYAN}, ${NAVY});
          border-radius: 50%;
          animation: float 20s ease-in-out infinite;
        }

        .shape-2 {
          top: 30%;
          left: -15%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, ${NAVY}, ${CYAN});
          transform: rotate(45deg);
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: float 15s ease-in-out infinite 2s;
        }

        .shape-3 {
          bottom: 10%;
          right: 10%;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, ${CYAN}, transparent);
          border-radius: 70% 30% 50% 50% / 60% 40% 60% 40%;
          animation: float 18s ease-in-out infinite 4s;
        }

        .shape-4 {
          top: 50%;
          right: -5%;
          width: 0;
          height: 0;
          opacity: 0.05;
          border-left: 200px solid transparent;
          border-right: 200px solid ${NAVY};
          border-bottom: 200px solid transparent;
        }

        .shape-5 {
          bottom: -10%;
          left: -10%;
          width: 450px;
          height: 450px;
          background: linear-gradient(135deg, ${NAVY}, ${CYAN});
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          animation: float 22s ease-in-out infinite 1s;
        }

        .hero-section {
          position: relative;
          padding: 100px 20px 80px;
          text-align: center;
          z-index: 1;
        }

        .hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${NAVY}15, ${CYAN}10);
          opacity: 0.5;
        }

        .hero-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeInUp 0.8s ease-out;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: ${NAVY};
          margin-bottom: 20px;
          line-height: 1.2;
          background: linear-gradient(135deg, ${NAVY}, ${CYAN});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: #4B5563;
          max-width: 600px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }

        .main-content {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
          z-index: 1;
        }

        .search-filters-section {
          margin-bottom: 40px;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .search-container {
          position: relative;
          margin-bottom: 20px;
        }

        .search-input {
          width: 100%;
          padding: 18px 20px 18px 56px;
          font-size: 16px;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          background: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(26, 42, 79, 0.08);
        }

        .search-input:focus {
          outline: none;
          border-color: ${CYAN};
          box-shadow: 0 8px 24px rgba(6, 182, 212, 0.15);
          transform: translateY(-2px);
        }

        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
          pointer-events: none;
        }

        .filters-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .sort-select, .filter-btn, .view-toggle {
          padding: 12px 20px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          background: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-select:hover, .filter-btn:hover, .view-toggle:hover {
          border-color: ${NAVY};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(26, 42, 79, 0.1);
        }

        .filter-btn.active {
          background: ${NAVY};
          color: white;
          border-color: ${NAVY};
        }

        .filter-panel {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          padding: 24px;
          margin-top: 16px;
          animation: scaleIn 0.3s ease-out;
          box-shadow: 0 8px 24px rgba(26, 42, 79, 0.08);
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .price-input {
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .price-input:focus {
          outline: none;
          border-color: ${CYAN};
        }

        .categories-section {
          margin-bottom: 40px;
          animation: fadeInUp 0.8s ease-out 0.3s both;
        }

        .categories-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 12px;
          scrollbar-width: thin;
          scrollbar-color: ${CYAN} #E5E7EB;
        }

        .categories-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .categories-scroll::-webkit-scrollbar-track {
          background: #E5E7EB;
          border-radius: 3px;
        }

        .categories-scroll::-webkit-scrollbar-thumb {
          background: ${CYAN};
          border-radius: 3px;
        }

        .category-chip {
          padding: 12px 24px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          background: white;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .category-chip::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .category-chip:hover::before {
          left: 100%;
        }

        .category-chip:hover {
          border-color: ${CYAN};
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.2);
        }

        .category-chip.active {
          background: ${NAVY};
          color: white;
          border-color: ${NAVY};
          box-shadow: 0 6px 20px rgba(26, 42, 79, 0.3);
        }

        .featured-section {
          margin-bottom: 60px;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
        }

        .section-title {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 800;
          color: ${NAVY};
        }

        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .gigs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
        }

        .gigs-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .gig-card {
          position: relative;
          opacity: 0;
          transform: translateY(20px);
        }

        .gig-card.animate-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .gig-card-inner {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          position: relative;
        }

        .gig-card-inner:hover {
          transform: translateY(-8px);
          border-color: ${CYAN};
          box-shadow: 0 20px 40px rgba(6, 182, 212, 0.15);
        }

        .list-view .gig-card-inner {
          flex-direction: row;
        }

        .gig-image-container {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .list-view .gig-image-container {
          height: auto;
          min-height: 280px;
        }

        .gig-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gig-card-inner:hover .gig-image {
          transform: scale(1.1) rotate(2deg);
        }

        .gig-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7));
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .gig-card-inner:hover .gig-image-overlay {
          opacity: 1;
        }

        .featured-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #FCD34D, #F59E0B);
          color: white;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          z-index: 2;
          animation: float 3s ease-in-out infinite;
        }

        .category-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 8px 16px;
          color: white;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          backdrop-filter: blur(10px);
          z-index: 2;
        }

        .favorite-btn {
          position: absolute;
          bottom: 12px;
          right: 12px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .favorite-btn:hover {
          background: white;
          transform: scale(1.1);
        }

        .gig-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .gig-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gig-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: ${NAVY};
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .gig-seller {
          font-size: 0.875rem;
          color: #6B7280;
          font-weight: 500;
        }

        .gig-description {
          font-size: 0.875rem;
          color: #4B5563;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .gig-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 2px solid #F3F4F6;
        }

        .gig-price {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .price-label {
          font-size: 0.75rem;
          color: #9CA3AF;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .price-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: ${CYAN};
        }

        .gig-time {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6B7280;
          font-size: 0.875rem;
        }

        .gig-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .btn-primary, .btn-secondary, .btn-apply {
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          border: none;
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          width: 100%;
          background: #F3F4F6;
          color: #374151;
        }

        .btn-primary:hover {
          background: #E5E7EB;
          transform: translateY(-2px);
        }

        .btn-secondary {
          flex: 1;
          background: #F3F4F6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #E5E7EB;
          transform: translateY(-2px);
        }

        .btn-apply {
          flex: 1;
          background: ${NAVY};
          color: white;
          position: relative;
          overflow: hidden;
        }

        .btn-apply::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .btn-apply:hover::before {
          width: 300px;
          height: 300px;
        }

        .btn-apply:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26, 42, 79, 0.3);
        }

        .btn-apply:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
          transform: none;
        }

        .status-badge {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
        }

        .status-pending {
          background: #FEF3C7;
          color: #92400E;
        }

        .status-accepted {
          background: #D1FAE5;
          color: #065F46;
        }

        .status-rejected {
          background: #FEE2E2;
          color: #991B1B;
        }

        .gig-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, ${CYAN}, ${NAVY});
          border-radius: 20px;
          opacity: 0.15;
          filter: blur(20px);
          z-index: -1;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: white;
          border: 2px dashed #E5E7EB;
          border-radius: 20px;
          text-align: center;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          margin-bottom: 24px;
          color: #D1D5DB;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 12px;
        }

        .empty-subtitle {
          font-size: 1rem;
          color: #6B7280;
          margin-bottom: 24px;
        }

        .btn-clear-filters {
          padding: 12px 32px;
          background: ${NAVY};
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-clear-filters:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26, 42, 79, 0.3);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 60px;
        }

        .page-btn {
          padding: 12px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .page-btn:hover:not(:disabled) {
          border-color: ${CYAN};
          transform: translateY(-2px);
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-number {
          min-width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          background: white;
          color: #374151;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .page-number:hover {
          border-color: ${CYAN};
          transform: translateY(-2px);
        }

        .page-number.active {
          background: ${NAVY};
          color: white;
          border-color: ${NAVY};
          box-shadow: 0 6px 20px rgba(26, 42, 79, 0.3);
        }

        .skeleton {
          background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
        }

        .skeleton-card {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 20px;
          overflow: hidden;
          height: 100%;
        }

        .skeleton-image {
          height: 220px;
          background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .skeleton-line {
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 80px 20px 60px;
          }

          .gigs-grid {
            grid-template-columns: 1fr;
          }

          .filters-row {
            flex-direction: column;
          }

          .sort-select, .filter-btn {
            width: 100%;
            justify-content: center;
          }

          .categories-section {
            display: none;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-gradient"></div>
        <div className="hero-content">
          <h1 className="hero-title">Discover Your Next Opportunity</h1>
          <p className="hero-subtitle">
            Connect with top gigs, filter by category, and find the perfect
            match for your skills
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Search & Filters */}
        <div className="search-filters-section">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search gigs by title, category, or skills..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filters-row">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-btn ${showFilters ? "active" : ""}`}
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>

            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              <button
                onClick={() => setViewMode("grid")}
                className={`view-toggle ${viewMode === "grid" ? "active" : ""}`}
                style={
                  viewMode === "grid"
                    ? { background: NAVY, color: "white", borderColor: NAVY }
                    : {}
                }
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`view-toggle ${viewMode === "list" ? "active" : ""}`}
                style={
                  viewMode === "list"
                    ? { background: NAVY, color: "white", borderColor: NAVY }
                    : {}
                }
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="filter-panel">
              <div className="filter-header">
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: NAVY }}>
                  Price Range (₹)
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6B7280",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Math.max(0, +e.target.value), priceRange[1]])
                  }
                  className="price-input"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], +e.target.value])
                  }
                  className="price-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="categories-section">
          <div className="categories-scroll">
            <button
              onClick={() => handleCategoryChange("")}
              className={`category-chip ${
                selectedCategory === "" ? "active" : ""
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`category-chip ${
                  selectedCategory === category ? "active" : ""
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Gigs */}
        {featuredGigs.length > 0 && (
          <div className="featured-section">
            <div className="section-header">
              <TrendingUp size={32} style={{ color: "#F59E0B" }} />
              <h2 className="section-title">Featured Gigs</h2>
            </div>
            <div className="gigs-grid">
              {featuredGigs.map((gig, index) => (
                <GigCard
                  key={gig._id}
                  gig={gig}
                  isFeatured={true}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Gigs */}
        <div>
          <h2 className="section-title" style={{ marginBottom: "30px" }}>
            {selectedCategory
              ? `${selectedCategory} Gigs`
              : "All Available Gigs"}
          </h2>

          {isLoading ? (
            <div className="gigs-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div
                      className="skeleton-line"
                      style={{ width: "70%" }}
                    ></div>
                    <div
                      className="skeleton-line"
                      style={{ width: "50%" }}
                    ></div>
                    <div
                      className="skeleton-line"
                      style={{ width: "100%" }}
                    ></div>
                    <div
                      className="skeleton-line"
                      style={{ width: "100%" }}
                    ></div>
                    <div
                      className="skeleton-line"
                      style={{
                        width: "40%",
                        height: "40px",
                        marginTop: "16px",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="empty-state">
              <Briefcase className="empty-icon" />
              <h3 className="empty-title">No gigs found</h3>
              <p className="empty-subtitle">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchTerm("");
                  setPriceRange([0, 100000]);
                }}
                className="btn-clear-filters"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "gigs-grid" : "gigs-list"}>
              {gigs.map((gig, index) => (
                <GigCard key={gig._id} gig={gig} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="page-btn"
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
                  className={`page-number ${page === pageNum ? "active" : ""}`}
                >
                  {pageNum}
                </button>
              );
            }).filter(Boolean)}

            {totalPages > 5 && page < totalPages - 2 && (
              <span style={{ color: "#6B7280", fontWeight: 600 }}>...</span>
            )}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="page-btn"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gigs;
