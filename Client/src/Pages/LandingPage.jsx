import React, { useState } from 'react';
import { Home, Briefcase, MessageCircle, User, Bell, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', href: '#home' },
    { icon: Briefcase, label: 'Gigs', href: '#gigs' },
    { icon: MessageCircle, label: 'Messages', href: '#messages' },
    { icon: Bell, label: 'Notifications', href: '#notifications' },
    { icon: User, label: 'Profile', href: '#profile' },
  ];

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold test-tailwind" style={{ color: '#1B263B' }}>
              CampusHire
            </h1>
          </div>

          {/* Desktop/Tablet Navigation - Icons Only */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  className="text-navyBlue hover:text-blue-800 transition-colors duration-300 p-2 rounded-lg hover:bg-blue-50"
                  aria-label={item.label}
                >
                  <Icon size={24} />
                </a>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
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

      {/* Mobile Side Menu */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        {/* Side Menu */}
        <div
          className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-lg transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-2 border-l border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-navyBlue" style={{ color: '#1B263B' }}>
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
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block px-4 py-3 text-navyBlue hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-all duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden pt-16">
      {/* Debug Tailwind */}
      <div className="test-tailwind mb-4 text-center">Test Tailwind CSS</div>

      {/* Irregular Gradient Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-gradient-to-br from-navyBlue to-blue-800 opacity-20 filter blur-3xl transform rotate-12"
          style={{ clipPath: 'polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)' }}
        ></div>
        <div
          className="absolute bottom-[-15%] left-[-10%] w-2/5 h-2/5 bg-gradient-to-tr from-purple-600 to-navyBlue opacity-15 filter blur-3xl transform -rotate-6"
          style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)' }}
        ></div>
        <div
          className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-gradient-to-bl from-blue-800 to-purple-600 opacity-10 filter blur-3xl transform rotate-45"
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navyBlue" style={{ color: '#1B263B' }}>
                Connect with
                <span className="block bg-gradient-to-r from-navyBlue to-purple-600 bg-clip-text text-transparent">
                  Student Talent
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Discover skilled designers, developers, and tutors right in your campus community. Hire services or showcase your expertise—all in one platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-8 py-4 bg-navyBlue text-white font-semibold rounded-lg shadow-lg hover:bg-blue-800 hover:shadow-xl hover:scale-105 transition-all duration-300">
                Get Started Free
              </button>
              <button className="px-8 py-4 bg-white text-navyBlue font-semibold rounded-lg border-2 border-navyBlue hover:bg-blue-50 hover:shadow-lg hover:scale-105 transition-all duration-300">
                Browse Services
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
              <div className="text-center lg:text-left">
                <p className="text-3xl font-bold text-navyBlue" style={{ color: '#1B263B' }}>
                  5,000+
                </p>
                <p className="text-gray-600">Active Students</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-3xl font-bold text-navyBlue" style={{ color: '#1B263B' }}>
                  10,000+
                </p>
                <p className="text-gray-600">Projects Completed</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-3xl font-bold text-navyBlue" style={{ color: '#1B263B' }}>
                  4.9/5
                </p>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Decorative Ring */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-navyBlue via-purple-600 to-blue-800 rounded-full opacity-20 blur-md animate-spin-slow"
              ></div>

              {/* Main Circular Image */}
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-2xl border-8 border-white transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop"
                  alt="Students collaborating"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 bg-white px-6 py-4 rounded-2xl shadow-xl border-2 border-blue-100 transform hover:scale-110 transition-transform duration-300">
                <p className="text-sm text-gray-600">Trusted by</p>
                <p className="text-2xl font-bold text-navyBlue" style={{ color: '#1B263B' }}>
                  50+ Colleges
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="font-sans antialiased">
      <div className="test-tailwind mb-4 text-center">App Component Test</div>
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default LandingPage;