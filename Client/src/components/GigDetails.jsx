import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE = 'http://localhost:5000/api';

const GigDetails = () => {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await axios.get(`${API_BASE}/gigs/${id}`);
        setGig(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch gig:', err);
        setLoading(false);
      }
    };
    fetchGig();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <div className="relative py-16 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-navyBlueMedium font-sans" style={{ color: '#2A3A6F' }}>
            Loading gig details...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <div className="relative py-16 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-navyBlueMedium font-sans" style={{ color: '#2A3A6F' }}>
            Gig not found.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

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
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-blue-100">
            <h1 className="text-3xl sm:text-4xl font-bold text-navyBlue mb-4 font-sans" style={{ color: '#1A2A4F' }}>
              {gig.title}
            </h1>
            <div className="flex items-center mb-4">
              <User size={24} className="text-navyBlueLight mr-2" style={{ color: '#3A4A7F' }} />
              <p className="text-navyBlueMedium font-sans" style={{ color: '#2A3A6F' }}>
                By <Link to={`/profile/${gig.sellerId}`} className="hover:underline">{gig.sellerName}</Link>
              </p>
            </div>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={i < Math.round(gig.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                  fill={i < Math.round(gig.rating || 0) ? '#FFD700' : 'none'}
                  size={20}
                />
              ))}
              <span className="ml-2 text-navyBlueMedium font-sans" style={{ color: '#2A3A6F' }}>
                ({gig.rating || 0}/5)
              </span>
            </div>
            {gig.thumbnail && (
              <img
                src={gig.thumbnail}
                alt={gig.title}
                className="w-full max-w-md rounded-lg mb-6 object-cover"
              />
            )}
            <p className="text-navyBlueMedium mb-4 font-sans" style={{ color: '#2A3A6F' }}>
              <strong>Category:</strong> {gig.category}
            </p>
            <p className="text-navyBlueMedium mb-4 font-sans" style={{ color: '#2A3A6F' }}>
              <strong>Starting Price:</strong> ${gig.price}
            </p>
            <p className="text-navyBlueMedium mb-6 font-sans" style={{ color: '#2A3A6F' }}>
              <strong>Description:</strong> {gig.description}
            </p>
            <button
              className="px-8 py-4 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans transition-colors duration-300"
              style={{ backgroundColor: '#1A2A4F', color: '#FFFFFF' }}
            >
              Contact Seller
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GigDetails;