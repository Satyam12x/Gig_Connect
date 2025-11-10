"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Home,
  Briefcase,
  MessageCircle,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";
const NAVY = "#1A2A4F";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationCount] = useState(3);
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Home", to: "/", id: "home" },
    { icon: Briefcase, label: "Gigs", to: "/gigs", id: "gigs" },
    { icon: MessageCircle, label: "Messages", to: "/global-chat", id: "messages" },
    {
      icon: Bell,
      label: "Notifications",
      to: "/notifications",
      id: "notifications",
      badge: notificationCount,
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
        if (!token) return;
        const res = await axios.get(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.log("Profile fetch error:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Fixed Navbar */}
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-300 bg-white ${
          isScrolled ? "shadow-lg" : "shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group cursor-pointer">
              <h1
                className="text-2xl font-bold font-sans transition-colors duration-300 group-hover:text-[#2d3d63]"
                style={{ color: NAVY }}
              >
                Gig Connect
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="relative group">
                    <Link
                      to={item.to}
                      className="relative flex items-center justify-center w-10 h-10 text-white rounded-lg hover:bg-[#1A2A4F]/10 transition-all duration-300 p-2"
                      style={{ color: NAVY }}
                      aria-label={item.label}
                    >
                      <Icon size={24} />
                      {item.badge && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                    <span
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 text-sm text-white px-3 py-1 rounded-md shadow-md whitespace-nowrap font-sans transition-all duration-200 pointer-events-none"
                      style={{ backgroundColor: NAVY }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Desktop Profile & Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-[#1A2A4F]/5 transition-all duration-300 group"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#1A2A4F]/20 transition-all duration-300"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${NAVY}, #2d3d63)`,
                        }}
                      >
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden lg:block text-left">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: NAVY }}
                      >
                        {user.fullName?.split(" ")[0]}
                      </p>
                      <p className="text-xs text-gray-500">Profile</p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      style={{ color: NAVY }}
                    />
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 transition-all duration-200 z-50 ${
                      isDropdownOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: NAVY }}
                      >
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm hover:bg-[#1A2A4F]/5 transition-colors duration-200 font-sans"
                      style={{ color: NAVY }}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      View Profile
                    </Link>
                    <a
                      href="#settings"
                      className="block px-4 py-2 text-sm hover:bg-[#1A2A4F]/5 transition-colors duration-200 font-sans"
                      style={{ color: NAVY }}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
                    </a>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 font-sans flex items-center space-x-2 border-t border-gray-100"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-semibold transition-colors duration-300 font-sans"
                    style={{ color: NAVY }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-semibold px-4 py-2 bg-white text-white rounded-lg hover:bg-[#2d3d63] transition-all duration-300 font-sans shadow-md hover:shadow-lg"
                    style={{ backgroundColor: NAVY }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors duration-300"
              style={{ color: NAVY }}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-xl transform transition-transform duration-300 z-50 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold font-sans" style={{ color: NAVY }}>
            Menu
          </h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg transition-colors duration-300"
            style={{ color: NAVY }}
          >
            <X size={24} />
          </button>
        </div>

        {user && (
          <div className="flex items-center px-4 py-4 bg-[#1A2A4F]/5 border-b border-gray-100">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover mr-3 ring-2 ring-[#1A2A4F]/20"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3"
                style={{
                  background: `linear-gradient(135deg, ${NAVY}, #2d3d63)`,
                }}
              >
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
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
            </div>
          </div>
        )}

        <div className="px-2 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.to}
                className="flex items-center px-4 py-3 rounded-lg transition-all duration-300 font-medium font-sans group"
                style={{ color: NAVY }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon
                  size={20}
                  className="mr-3 group-hover:translate-x-1 transition-transform duration-300"
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {user && (
          <div className="px-2 py-4 border-t border-gray-100 space-y-2">
            <Link
              to="/profile"
              className="flex items-center px-4 py-3 rounded-lg transition-all duration-300 font-medium font-sans"
              style={{ color: NAVY }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              View Profile
            </Link>
            <a
              href="#settings"
              className="flex items-center px-4 py-3 rounded-lg transition-all duration-300 font-medium font-sans"
              style={{ color: NAVY }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </a>
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
          <div className="px-2 py-4 border-t border-gray-100 space-y-2">
            <Link
              to="/login"
              className="flex items-center px-4 py-3 rounded-lg transition-all duration-300 font-medium font-sans"
              style={{ color: NAVY }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="flex items-center px-4 py-3 text-white rounded-lg hover:bg-[#2d3d63] transition-all duration-300 font-medium font-sans"
              style={{ backgroundColor: NAVY }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
