import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Home,
  Briefcase,
  MessageCircle,
  Bell,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', href: '#home' },
    { icon: Briefcase, label: 'Gigs', href: '#gigs' },
    { icon: MessageCircle, label: 'Messages', href: '#messages' },
    { icon: Bell, label: 'Notifications', href: '#notifications' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.log('Profile fetch error:', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-navyBlue font-sans" style={{ color: '#1A2A4F' }}>
              Gig Connect
            </h1>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  className="relative group text-navyBlue hover:text-blue-800 transition-colors duration-300 p-2 rounded-lg hover:bg-blue-50"
                  aria-label={item.label}
                >
                  <Icon size={24} />
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-[-30px] opacity-0 group-hover:opacity-100 group-hover:translate-y-1 text-sm text-white bg-navyBlue px-2 py-1 rounded shadow-md font-sans transition-all duration-200">
                    {item.label}
                  </span>
                </a>
              );
            })}
            {user ? (
              <div className="relative group">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-navyBlue flex items-center justify-center text-white font-sans">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-navyBlue font-sans" style={{ color: '#1A2A4F' }}>
                    {user.fullName}
                  </span>
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-blue-100 transition-all duration-200 ${
                    isDropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-navyBlue hover:bg-blue-50 font-sans"
                    style={{ color: '#1A2A4F' }}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-navyBlue hover:bg-blue-50 font-sans flex items-center space-x-2"
                    style={{ color: '#1A2A4F' }}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-navyBlue hover:text-blue-800 font-sans transition-colors duration-300"
                  style={{ color: '#1A2A4F' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-navyBlue hover:text-blue-800 font-sans transition-colors duration-300"
                  style={{ color: '#1A2A4F' }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-navyBlue hover:text-blue-800 transition-colors duration-300 p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div
          className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-lg transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-2 border-l border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-navyBlue font-sans" style={{ color: '#1A2A4F' }}>
                Menu
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-navyBlue hover:text-blue-800"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            {user && (
              <div className="flex items-center px-4 py-3 border-b border-blue-100">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-12 h-12 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-navyBlue flex items-center justify-center text-white font-sans mr-3">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-navyBlue font-semibold font-sans" style={{ color: '#1A2A4F' }}>
                    {user.fullName}
                  </p>
                  <p className="text-navyBlueMedium text-sm font-sans" style={{ color: '#2A3A6F' }}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-navyBlue hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-all duration-300 font-medium font-sans"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} className="mr-2" />
                  {item.label}
                </a>
              );
            })}
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-navyBlue hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-all duration-300 font-medium font-sans"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 text-navyBlue hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-all duration-300 font-medium font-sans w-full"
                >
                  <LogOut size={20} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center px-4 py-3 text-navyBlue hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-all duration-300 font-medium font-sans"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center px-4 py-3 text-navyBlue hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-all duration-300 font-medium font-sans"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
