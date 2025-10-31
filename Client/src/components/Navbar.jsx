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

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationCount] = useState(3);
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Home", href: "#home", id: "home" },
    { icon: Briefcase, label: "Gigs", href: "#gigs", id: "gigs" },
    {
      icon: MessageCircle,
      label: "Messages",
      href: "#messages",
      id: "messages",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "#notifications",
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
        className={`fixed w-full top-0 z-40 transition-all duration-300 bg-white ${
          isScrolled ? "shadow-lg" : "shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group cursor-pointer">
              <h1 className="text-2xl font-bold text-[#1A2A4F] font-sans transition-colors duration-300 group-hover:text-blue-600">
                Gig Connect
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="relative group">
                    <a
                      href={item.href}
                      className="relative flex items-center justify-center w-10 h-10 text-[#1A2A4F] rounded-lg hover:bg-blue-50 transition-all duration-300 p-2"
                      aria-label={item.label}
                    >
                      <Icon size={24} />
                      {item.badge && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </a>
                    {/* Tooltip */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 text-sm text-white bg-[#1A2A4F] px-3 py-1 rounded-md shadow-md whitespace-nowrap font-sans transition-all duration-200 pointer-events-none">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Desktop Profile & Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300 group"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture || "/placeholder.svg"}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold font-sans text-sm">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-[#1A2A4F]">
                        {user.fullName?.split(" ")[0]}
                      </p>
                      <p className="text-xs text-gray-500">Profile</p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 transition-all duration-200 z-50 ${
                      isDropdownOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-[#1A2A4F]">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-[#1A2A4F] hover:bg-blue-50 transition-colors duration-200 font-sans"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      View Profile
                    </Link>
                    <a
                      href="#settings"
                      className="block px-4 py-2 text-sm text-[#1A2A4F] hover:bg-blue-50 transition-colors duration-200 font-sans"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
                    </a>

                    {/* Logout Button */}
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
                    className="text-sm font-semibold text-[#1A2A4F] hover:text-blue-600 transition-colors duration-300 font-sans"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-semibold px-4 py-2 bg-[#1A2A4F] text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-sans shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-[#1A2A4F] hover:bg-blue-50 p-2 rounded-lg transition-colors duration-300"
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
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-xl transform transition-transform duration-300 z-40 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#1A2A4F] font-sans">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-[#1A2A4F] hover:bg-blue-50 p-2 rounded-lg transition-colors duration-300"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile User Info */}
        {user && (
          <div className="flex items-center px-4 py-4 bg-blue-50 border-b border-gray-100">
            {user.profilePicture ? (
              <img
                src={user.profilePicture || "/placeholder.svg"}
                alt={user.fullName}
                className="w-12 h-12 rounded-full object-cover mr-3 ring-2 ring-blue-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold font-sans mr-3">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A2A4F] font-sans">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-600 font-sans truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Mobile Navigation Items */}
        <div className="px-2 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center px-4 py-3 text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-300 font-medium font-sans group"
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
              </a>
            );
          })}
        </div>

        {/* Mobile Profile Links */}
        {user && (
          <div className="px-2 py-4 border-t border-gray-100 space-y-2">
            <Link
              to="/profile"
              className="flex items-center px-4 py-3 text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-300 font-medium font-sans"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              View Profile
            </Link>
            <a
              href="#settings"
              className="flex items-center px-4 py-3 text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-300 font-medium font-sans"
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

        {/* Mobile Auth Links (if not logged in) */}
        {!user && (
          <div className="px-2 py-4 border-t border-gray-100 space-y-2">
            <Link
              to="/login"
              className="flex items-center px-4 py-3 text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-300 font-medium font-sans"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="flex items-center px-4 py-3 bg-[#1A2A4F] text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium font-sans"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
