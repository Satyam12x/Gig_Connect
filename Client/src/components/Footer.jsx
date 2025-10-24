import React from 'react';
import { Linkedin, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Gigs', href: '#gigs' },
    { label: 'Profile', href: '#profile' },
    { label: 'Contact', href: '#contact' },
  ];

  const socialLinks = [
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className="bg-navyBlue py-16 shadow-lg" style={{ backgroundColor: '#1A2A4F' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white font-sans">
              Gig Connect
            </h1>
            <p className="text-gray-300 text-sm max-w-xs font-sans">
              Connecting students and opportunities within campus communities.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-semibold text-white mb-4 font-sans">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-white hover:text-blue-300 font-medium font-sans transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-xl font-semibold text-white mb-4 font-sans">
              Follow Us
            </h3>
            <div className="flex gap-4 mb-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="text-gray-300 hover:text-blue-300 transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <Icon size={24} />
                  </a>
                );
              })}
            </div>
            <p className="text-gray-300 text-sm font-sans">
              © 2025 Gig Connect. All rights reserved.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 text-center">
          <p className="text-gray-300 text-sm font-sans">
            Built with passion for student success.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;