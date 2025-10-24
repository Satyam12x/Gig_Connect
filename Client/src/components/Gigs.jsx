import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Search, Code, PenTool, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE = 'http://localhost:5000/api';

const Gigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const category = new URLSearchParams(location.search).get('category') || '';

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await axios.get(`${API_BASE}/gigs${category ? `?category=${encodeURIComponent(category)}` : ''}`);
        setGigs(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch gigs:', err);
        setLoading(false);
      }
    };
    fetchGigs();
  }, [category]);

  const categories = [
    { name: 'All', icon: Search },
    { name: 'Web Development', icon: Code },
    { name: 'Graphic Design', icon: PenTool },
    { name: 'Tutoring', icon: BookOpen },
    { name: 'Digital Marketing', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-5%] left-[-5%] w-1/3 h-1/3 bg-gradient-to-br from-navyBlue to-blue-800 opacity-15 filter blur-3xl transform rotate-12"
            style={{ clipPath: 'polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)' }}
          ></div>
          <div
            className="absolute bottom-[-10%] left-[-5%] w-1/4 h-1/4 bg-gradient-to-tr from-purple-600 to-navyBlue opacity-10 filter blur-3xl transform -rotate-6"
            style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)' }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-blue-800 to-purple-600 opacity-10 filter blur-3xl transform rotate-45"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          ></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-navyBlue mb-8 text-center font-sans" style={{ color: '#1A2A4F' }}>
            Browse Gigs
          </h1>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={index}
                  to={cat.name === 'All' ? '/gigs' : `/gigs?category=${encodeURIComponent(cat.name)}`}
                  className={`px-4 py-2 rounded-lg font-semibold font-sans ${
                    category === cat.name || (cat.name === 'All' && !category)
                      ? 'bg-navyBlue text-white'
                      : 'bg-white text-navyBlue border border-navyBlue hover:bg-blue-50 hover:text-navyBlueLight'
                  } transition-colors duration-300`}
                  style={{
                    backgroundColor: category === cat.name || (cat.name === 'All' && !category) ? '#1A2A4F' : '#FFFFFF',
                    color: category === cat.name || (cat.name === 'All' && !category) ? '#FFFFFF' : '#1A2A4F',
                    borderColor: '#1A2A4F',
                  }}
                >
                  <Icon size={20} className="inline-block mr-2" />
                  {cat.name}
                </Link>
              );
            })}
          </div>
          {loading ? (
            <div className="text-center text-navyBlueMedium font-sans" style={{ color: '#2A3A6F' }}>
              Loading gigs...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gigs.length === 0 ? (
                <p className="text-center text-navyBlueMedium font-sans col-span-full" style={{ color: '#2A3A6F' }}>
                  No gigs found in this category.
                </p>
              ) : (
                gigs.map((gig) => (
                  <div
                    key={gig._id}
                    className="bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100 hover:bg-blue-50 hover:border-navyBlueLight transition-colors duration-300 text-center"
                    style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}
                  >
                    {gig.thumbnail ? (
                      <img
                        src={gig.thumbnail}
                        alt={gig.title}
                        className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-navyBlue to-blue-800 mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold font-sans"
                        style={{ backgroundColor: '#1A2A4F' }}
                      >
                        {gig.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-navyBlue mb-2 font-sans" style={{ color: '#1A2A4F' }}>
                      {gig.title}
                    </h3>
                    <p className="text-navyBlueMedium mb-2 font-sans" style={{ color: '#2A3A6F' }}>
                      By <Link to={`/profile/${gig.sellerId}`} className="hover:underline">{gig.sellerName}</Link>
                    </p>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={i < Math.round(gig.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                          fill={i < Math.round(gig.rating || 0) ? '#FFD700' : 'none'}
                          size={14}
                        />
                      ))}
                    </div>
                    <p className="text-navyBlueMedium mb-2 font-sans" style={{ color: '#2A3A6F' }}>
                      From ${gig.price}
                    </p>
                    <p className="text-navyBlueMedium mb-4 font-sans line-clamp-2" style={{ color: '#2A3A6F' }}>
                      {gig.description}
                    </p>
                    <p className="text-sm text-navyBlueMedium mb-4 font-sans" style={{ color: '#2A3A6F' }}>
                      {gig.category}
                    </p>
                    <Link
                      to={`/gigs/${gig._id}`}
                      className="px-6 py-3 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans transition-colors duration-300"
                      style={{ backgroundColor: '#1A2A4F', color: '#FFFFFF' }}
                    >
                      View Details
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Gigs;