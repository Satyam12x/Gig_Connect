// src/pages/UserProfile.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User,
  Briefcase,
  Link as LinkIcon,
  Star,
  Award,
  Code,
  PenTool,
  BookOpen,
  Laptop,
  Shield,
  Zap,
  ArrowLeft,
  Linkedin,
  Github,
  Instagram,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

/* ---------- COLOR THEME ---------- */
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
  cyan: "#06B6D4",
  cyanLight: "#67E8F9",
};

/* ---------- MAIN COMPONENT ---------- */
const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id || id === "[object Object]") {
        setError("Invalid user ID");
        toast.error("Invalid user ID");
        navigate("/gigs");
        return;
      }

      try {
        const [userRes, gigsRes] = await Promise.all([
          axios.get(`${API_BASE}/users/${id}`),
          axios.get(`${API_BASE}/gigs/user/${id}`),
        ]);

        setUser(userRes.data);
        setGigs(gigsRes.data.slice(0, 6));
      } catch (err) {
        const message =
          err.response?.status === 404
            ? "User not found"
            : err.response?.data?.error || "Failed to load profile";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, navigate]);

  /* ---------- SCROLL ANIMATIONS ---------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document
      .querySelectorAll(".scroll-animate")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  /* ---------- RENDER STATES ---------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4"
            size={48}
            style={{ color: COLORS.cyan }}
          />
          <p className="font-medium" style={{ color: COLORS.navy }}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="font-medium text-lg text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/gigs")}
            className="px-6 py-3 rounded-lg text-white transition-all hover:scale-105"
            style={{ backgroundColor: COLORS.cyan }}
          >
            Back to Gigs
          </button>
        </div>
      </div>
    );
  }

  const formatINR = (amount) => {
    const n = typeof amount === "string" ? Number(amount) : amount;
    if (isNaN(n)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* BACKGROUND SHAPES */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${COLORS.cyan}, ${COLORS.navyLight})`,
          }}
        />
        <div
          className="absolute top-1/3 right-0 w-80 h-80 opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${COLORS.navy}, ${COLORS.cyan})`,
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          }}
        />
      </div>

      {/* STYLES */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(26, 42, 79, 0.15);
        }
        .glow-on-hover:hover {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
        }
      `}</style>

      {/* HEADER */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-lg font-medium transition-all hover:gap-3 scroll-animate"
            style={{ color: COLORS.navy }}
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {/* PROFILE HERO */}
          <div
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl hover-lift scroll-animate relative overflow-hidden"
            style={{
              border: `2px solid ${COLORS.gray100}`,
              boxShadow: "0 20px 50px rgba(26, 42, 79, 0.12)",
            }}
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.fullName}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 shadow-lg"
                    style={{ borderColor: COLORS.cyan }}
                  />
                ) : (
                  <div
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-5xl font-bold"
                    style={{
                      backgroundColor: `${COLORS.cyan}20`,
                      color: COLORS.cyan,
                      border: `4px solid ${COLORS.cyan}30`,
                    }}
                  >
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: COLORS.cyan }}
                >
                  <User size={24} className="text-white" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1
                  className="text-4xl md:text-5xl font-bold mb-3"
                  style={{ color: COLORS.navy }}
                >
                  {user.fullName}
                </h1>
                <p className="text-xl mb-2" style={{ color: COLORS.gray600 }}>
                  {user.college || "Student"}
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                  <span
                    className="px-4 py-2 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `${COLORS.cyan}20`,
                      color: COLORS.cyan,
                      border: `1px solid ${COLORS.cyan}40`,
                    }}
                  >
                    {user.role}
                  </span>
                  {user.badge && (
                    <span
                      className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1"
                      style={{
                        backgroundColor: "#8B5CF620",
                        color: "#8B5CF6",
                        border: `1px solid #8B5CF640`,
                      }}
                    >
                      <Award size={16} />
                      {user.badge}
                    </span>
                  )}
                </div>
                <p
                  className="text-lg leading-relaxed max-w-2xl"
                  style={{ color: COLORS.gray600 }}
                >
                  {user.bio || "No bio available."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS DASHBOARD */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-bold mb-10 scroll-animate"
            style={{ color: COLORS.navy }}
          >
            Performance Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Star,
                label: "Rating",
                value: user.rating?.toFixed(1) || "N/A",
                color: "#FCD34D",
              },
              {
                icon: Briefcase,
                label: "Completed",
                value: user.gigsCompleted || 0,
                color: COLORS.cyan,
              },
              {
                icon: CheckCircle,
                label: "On Time",
                value: `${(user.completionRate || 0).toFixed(0)}%`,
                color: "#10B981",
              },
              {
                icon: Award,
                label: "Total Gigs",
                value: user.totalGigs || 0,
                color: "#8B5CF6",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white hover-lift scroll-animate"
                  style={{
                    border: `2px solid ${COLORS.gray100}`,
                    boxShadow: "0 8px 24px rgba(26, 42, 79, 0.08)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: `${stat.color}20`,
                      border: `2px solid ${stat.color}30`,
                    }}
                  >
                    <Icon size={28} style={{ color: stat.color }} />
                  </div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: COLORS.gray600 }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.navy }}
                  >
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      {user.skills && user.skills.length > 0 && (
        <section
          className="py-16 px-4"
          style={{ backgroundColor: COLORS.gray50 }}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl font-bold mb-10 scroll-animate"
              style={{ color: COLORS.navy }}
            >
              Skills & Expertise
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {user.skills.map((skill, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white hover-lift scroll-animate"
                  style={{
                    border: `2px solid ${COLORS.gray100}`,
                    boxShadow: "0 8px 24px rgba(26, 42, 79, 0.08)",
                  }}
                >
                  <div className="flex justify-between mb-2">
                    <p className="font-semibold" style={{ color: COLORS.navy }}>
                      {skill.name}
                    </p>
                    <p className="text-sm" style={{ color: COLORS.gray600 }}>
                      {skill.endorsements} endorsements
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(skill.endorsements * 10, 100)}%`,
                        backgroundColor: COLORS.cyan,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CERTIFICATIONS */}
      {user.certifications && user.certifications.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl font-bold mb-10 scroll-animate"
              style={{ color: COLORS.navy }}
            >
              Certifications
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {user.certifications.map((cert, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white hover-lift glow-on-hover scroll-animate text-center"
                  style={{
                    border: `2px solid ${COLORS.gray100}`,
                    boxShadow: "0 8px 24px rgba(26, 42, 79, 0.08)",
                  }}
                >
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${COLORS.cyan}20`,
                      border: `2px solid ${COLORS.cyan}30`,
                    }}
                  >
                    <Award size={32} style={{ color: COLORS.cyan }} />
                  </div>
                  <h3 className="font-bold mb-1" style={{ color: COLORS.navy }}>
                    {cert.name}
                  </h3>
                  <p className="text-sm" style={{ color: COLORS.gray600 }}>
                    {cert.issuer}
                  </p>
                  {cert.date && (
                    <p
                      className="text-xs mt-2"
                      style={{ color: COLORS.gray500 }}
                    >
                      Issued: {new Date(cert.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SOCIAL LINKS */}
      {(user.socialLinks?.linkedin ||
        user.socialLinks?.github ||
        user.socialLinks?.instagram) && (
        <section
          className="py-16 px-4"
          style={{ backgroundColor: COLORS.gray50 }}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl font-bold mb-10 scroll-animate"
              style={{ color: COLORS.navy }}
            >
              Connect With Me
            </h2>
            <div className="flex flex-wrap gap-6 justify-center">
              {user.socialLinks.linkedin && (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 rounded-xl hover-lift transition-all scroll-animate"
                  style={{
                    backgroundColor: COLORS.white,
                    border: `2px solid ${COLORS.gray100}`,
                    boxShadow: "0 8px 24px rgba(26, 42, 79, 0.08)",
                  }}
                >
                  <Linkedin size={24} style={{ color: "#0A66C2" }} />
                  <span
                    className="font-semibold"
                    style={{ color: COLORS.navy }}
                  >
                    LinkedIn
                  </span>
                </a>
              )}
              {user.socialLinks.github && (
                <a
                  href={user.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 rounded-xl hover-lift transition-all scroll-animate"
                  style={{
                    backgroundColor: COLORS.white,
                    border: `2px solid ${COLORS.gray100}`,
                    boxShadow: "0 8px 24px rgba(26, 42, 79, 0.08)",
                  }}
                >
                  <Github size={24} style={{ color: COLORS.gray900 }} />
                  <span
                    className="font-semibold"
                    style={{ color: COLORS.navy }}
                  >
                    GitHub
                  </span>
                </a>
              )}
              {user.socialLinks.instagram && (
                <a
                  href={user.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 rounded-xl hover-lift transition-all scroll-animate"
                  style={{
                    backgroundColor: COLORS.white,
                    border: `2px solid ${COLORS.gray100}`,
                    boxShadow: "0 8px 24px rgba(26, 42, 79, 0.08)",
                  }}
                >
                  <Instagram size={24} style={{ color: "#E4405F" }} />
                  <span
                    className="font-semibold"
                    style={{ color: COLORS.navy }}
                  >
                    Instagram
                  </span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* USER'S GIGS */}
      {gigs.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-4xl font-bold mb-12 text-center scroll-animate"
              style={{ color: COLORS.navy }}
            >
              Active Gigs by {user.fullName.split(" ")[0]}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gigs.map((gig) => {
                const Icon =
                  {
                    "Web Development": Code,
                    "Graphic Design": PenTool,
                    Tutoring: BookOpen,
                  }[gig.category] || Laptop;

                return (
                  <Link
                    key={gig._id}
                    to={`/gigs/${gig._id}`}
                    className="group p-8 rounded-2xl bg-white hover-lift scroll-animate"
                    style={{
                      border: `2px solid ${COLORS.gray100}`,
                      boxShadow: "0 10px 30px rgba(26, 42, 79, 0.08)",
                    }}
                  >
                    <div
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${COLORS.cyan}20`,
                        border: `2px solid ${COLORS.cyan}30`,
                      }}
                    >
                      <Icon size={36} style={{ color: COLORS.cyan }} />
                    </div>
                    <h3
                      className="text-xl font-bold mb-2 text-center"
                      style={{ color: COLORS.navy }}
                    >
                      {gig.title}
                    </h3>
                    <p
                      className="text-center mb-3"
                      style={{ color: COLORS.gray600 }}
                    >
                      {gig.category}
                    </p>
                    <p
                      className="text-2xl font-bold text-center mb-4"
                      style={{ color: COLORS.cyan }}
                    >
                      {formatINR(gig.price)}
                    </p>
                    <div className="text-center">
                      <span
                        className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor:
                            gig.status === "open"
                              ? "#10B98120"
                              : COLORS.gray100,
                          color:
                            gig.status === "open" ? "#10B981" : COLORS.gray600,
                        }}
                      >
                        {gig.status === "open"
                          ? "Open for Applications"
                          : "Closed"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-12">
              <Link
                to={`/gigs?search=&seller=${user._id}`}
                className="inline-flex items-center gap-3 px-8 py-3 rounded-xl text-white font-bold transition-all hover:scale-105 scroll-animate"
                style={{
                  backgroundColor: COLORS.navy,
                  boxShadow: "0 8px 20px rgba(26, 42, 79, 0.3)",
                }}
              >
                View All Gigs <ArrowLeft className="rotate-180" size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default UserProfile;
