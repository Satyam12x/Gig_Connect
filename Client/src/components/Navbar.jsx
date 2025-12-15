"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Home,
  Briefcase,
  MessageCircle,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Zap,
  ChevronDown
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";
const NAVY = "#1A2A4F";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationCount] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", to: "/home", id: "home" },
    { icon: Briefcase, label: "Gigs", to: "/gigs", id: "gigs" },
    {
      icon: MessageCircle,
      label: "Messages",
      to: "/global-chat",
      id: "messages",
    },
    {
      icon: Zap,
      label: "Spotlight",
      to: "/spotlight",
      id: "spotlight",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          if (
            location.pathname !== "/" &&
            location.pathname !== "/login" &&
            location.pathname !== "/signup"
          ) {
            navigate("/");
          }
          return;
        }
        const res = await axios.get(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);

        if (location.pathname === "/") {
          navigate("/home");
        }
      } catch (err) {
        console.log("Profile fetch error:", err);
        localStorage.removeItem("token");
        if (
          location.pathname !== "/" &&
          location.pathname !== "/login" &&
          location.pathname !== "/signup"
        ) {
          navigate("/");
        }
      }
    };
    fetchProfile();
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    navigate("/");
  };

  const handleMobileMenuToggle = () => {
    if (!isMobileMenuOpen) {
      setIsAnimating(true);
    }
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setTimeout(() => setIsAnimating(false), 800);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest(".profile-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to={user ? "/home" : "/"}
              className="flex-shrink-0 group cursor-pointer"
            >
              <h1
                className="text-2xl font-bold font-sans transition-all duration-300 group-hover:scale-105"
                style={{ color: NAVY }}
              >
                Gig Connect
              </h1>
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      className={`relative flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-300 group ${
                        active
                          ? "bg-[#1A2A4F] text-white shadow-md"
                          : "text-gray-700 hover:bg-[#1A2A4F]/10"
                      }`}
                      aria-label={item.label}
                    >
                      <Icon size={20} className="mr-2" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-md">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#1A2A4F]/5 transition-all duration-300 group"
                  >
                    <Link to="/profile" className="flex-shrink-0">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#1A2A4F]/30 transition-all duration-300"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${NAVY}, #2d3d63)`,
                          }}
                        >
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>
                    <div className="text-left">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: NAVY }}
                      >
                        {user.fullName?.split(" ")[0]}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-amber-600 font-semibold">
                          🪙 {user.coins || 0}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {user.role || "User"}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 text-gray-500 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-200 overflow-hidden ${
                      isDropdownOpen
                        ? "opacity-100 translate-y-0 visible"
                        : "opacity-0 -translate-y-2 invisible"
                    }`}
                  >
                    <div
                      className="px-4 py-3 border-b border-gray-100"
                      style={{ backgroundColor: `${NAVY}05` }}
                    >
                      <p
                        className="text-sm font-semibold"
                        style={{ color: NAVY }}
                      >
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-full">
                          🪙 {user.coins || 0} coins
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm hover:bg-[#1A2A4F]/5 transition-colors duration-200 font-sans text-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={16} className="mr-3" />
                      View Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-3 text-sm hover:bg-[#1A2A4F]/5 transition-colors duration-200 font-sans text-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} className="mr-3" />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 font-sans border-t border-gray-100"
                    >
                      <LogOut size={16} className="mr-3" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 font-sans hover:bg-[#1A2A4F]/5"
                    style={{ color: NAVY }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-semibold px-6 py-2 bg-white text-white rounded-lg hover:bg-[#2d3d63] transition-all duration-300 font-sans shadow-md hover:shadow-lg hover:scale-105"
                    style={{ backgroundColor: NAVY }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={handleMobileMenuToggle}
              className="md:hidden p-2 rounded-lg transition-colors duration-300 hover:bg-[#1A2A4F]/10"
              style={{ color: NAVY }}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {isAnimating && (
        <>
          <div
            className={`fixed inset-0 bg-black z-40 md:hidden transition-opacity duration-500 ${
              isMobileMenuOpen ? "bg-opacity-50" : "bg-opacity-0"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            className={`fixed z-50 md:hidden pointer-events-none ${
              isMobileMenuOpen
                ? "animate-plane-fly-in"
                : "animate-plane-fly-out"
            }`}
            style={{
              top: "50%",
              left: isMobileMenuOpen ? "100%" : "-10%",
              transform: "translateY(-50%)",
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <path
                d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                fill={NAVY}
              />
            </svg>
          </div>
        </>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-in-out z-50 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          className="flex justify-between items-center px-4 py-4 border-b border-gray-100"
          style={{ backgroundColor: `${NAVY}05` }}
        >
          <h2 className="text-xl font-bold font-sans" style={{ color: NAVY }}>
            Menu
          </h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-[#1A2A4F]/10 transition-colors duration-300"
            style={{ color: NAVY }}
          >
            <X size={24} />
          </button>
        </div>

        {user && (
          <div className="flex items-center px-4 py-4 bg-gradient-to-r from-[#1A2A4F]/5 to-transparent border-b border-gray-100">
            <Link
              to="/profile"
              className="flex-shrink-0 mr-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#1A2A4F]/20 shadow-md"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${NAVY}, #2d3d63)`,
                  }}
                >
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div className="flex-1">
              <p
                className="text-sm font-semibold font-sans"
                style={{ color: NAVY }}
              >
                {user.fullName}
              </p>
              <p className="text-xs text-gray-600 font-sans truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                  🪙 {user.coins || 0} coins
                </span>
                <span className="text-xs text-gray-500 font-sans">
                  {user.role || "User"}
                </span>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 font-medium font-sans group ${
                    active
                      ? "bg-[#1A2A4F] text-white shadow-md"
                      : "text-gray-700 hover:bg-[#1A2A4F]/10"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon
                    size={20}
                    className={`mr-3 transition-transform duration-300 ${
                      !active && "group-hover:translate-x-1"
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {user && (
          <div className="px-2 py-4 border-t border-gray-100 space-y-1">
            <Link
              to="/profile"
              className="flex items-center px-4 py-3 rounded-lg hover:bg-[#1A2A4F]/10 transition-all duration-300 font-medium font-sans text-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={20} className="mr-3" />
              View Profile
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-4 py-3 rounded-lg hover:bg-[#1A2A4F]/10 transition-all duration-300 font-medium font-sans text-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings size={20} className="mr-3" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 font-medium font-sans"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        )}

        {!user && (
          <div className="px-2 py-4 space-y-2">
            <Link
              to="/login"
              className="flex items-center justify-center px-4 py-3 rounded-lg hover:bg-[#1A2A4F]/10 transition-all duration-300 font-medium font-sans"
              style={{ color: NAVY }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="flex items-center justify-center px-4 py-3 text-white rounded-lg hover:bg-[#2d3d63] transition-all duration-300 font-medium font-sans shadow-md"
              style={{ backgroundColor: NAVY }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      <div className="h-16" />

      <style jsx>{`
        @keyframes plane-fly-in {
          0% {
            left: -10%;
            transform: translateY(-50%) rotate(-10deg);
          }
          50% {
            left: 50%;
            transform: translateY(-50%) rotate(0deg);
          }
          100% {
            left: 100%;
            transform: translateY(-50%) rotate(10deg);
          }
        }

        @keyframes plane-fly-out {
          0% {
            left: 100%;
            transform: translateY(-50%) rotate(10deg);
          }
          50% {
            left: 50%;
            transform: translateY(-50%) rotate(0deg);
          }
          100% {
            left: -10%;
            transform: translateY(-50%) rotate(-10deg);
          }
        }

        .animate-plane-fly-in {
          animation: plane-fly-in 0.8s ease-in-out forwards;
        }

        .animate-plane-fly-out {
          animation: plane-fly-out 0.8s ease-in-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navbar;