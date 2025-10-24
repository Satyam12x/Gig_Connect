import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {jwtDecode} from 'jwt-decode';

const API_BASE = 'http://localhost:5000/api';

const Gigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const currentPage = parseInt(params.get('page') || '1');
  const selectedCategory = params.get('category') || '';
  const currentSearch = params.get('search') || '';

  // Decode JWT token to get userId
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch (err) {
        console.error('Token decode error:', err);
        toast.error('Invalid session. Please log in again.');
      }
    }
  }, []);

  // Fetch gigs
  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE}/gigs?category=${encodeURIComponent(selectedCategory)}&search=${encodeURIComponent(currentSearch)}&page=${currentPage}`
        );
        console.log('API Response:', response.data);
        setGigs(Array.isArray(response.data.gigs) ? response.data.gigs : []);
        setTotalPages(response.data.pages || 1);
      } catch (err) {
        console.error('Failed to fetch gigs:', err);
        toast.error('Failed to load gigs. Please try again.');
        setGigs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, [selectedCategory, currentSearch, currentPage]);

  // Handle gig deletion
  const handleDeleteGig = async (gigId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to delete a gig.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        await axios.delete(`${API_BASE}/gigs/${gigId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGigs(gigs.filter((gig) => gig._id !== gigId));
        toast.success('Gig deleted successfully.');
      } catch (err) {
        console.error('Delete gig error:', err);
        toast.error(err.response?.data?.error || 'Failed to delete gig.');
      }
    }
  };

  // Handle contact seller (placeholder)
  const handleContactSeller = (sellerId) => {
    toast.success(`Contacting seller ${sellerId} (placeholder functionality)`);
    // Implement actual contact logic (e.g., navigate to messaging page)
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/gigs?category=${encodeURIComponent(category)}&search=${encodeURIComponent(searchQuery)}&page=1`);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    navigate(`/gigs?category=${encodeURIComponent(e.target.value)}&search=${encodeURIComponent(searchQuery)}&page=1`);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans" style={{ backgroundColor: '#F7FAFC' }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-navyBlue mb-8 text-center" style={{ color: '#1A2A4F' }}>
          Find Gigs
        </h1>

        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gigs..."
              className="px-4 py-2 rounded-l-lg border border-blue-100 focus:outline-none focus:ring-2 focus:ring-navyBlueLight w-full sm:w-64"
              style={{ color: '#2A3A6F' }}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-navyBlue text-white rounded-r-lg hover:bg-navyBlueLight transition-colors duration-300"
              style={{ backgroundColor: '#1A2A4F' }}
            >
              <Search size={20} />
            </button>
          </form>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="px-4 py-2 rounded-lg border border-blue-100 focus:outline-none focus:ring-2 focus:ring-navyBlueLight"
            style={{ color: '#2A3A6F' }}
          >
            <option value="">All Categories</option>
            <option value="Web Development">Web Development</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Tutoring">Tutoring</option>
            <option value="Digital Marketing">Digital Marketing</option>
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center text-navyBlueMedium" style={{ color: '#2A3A6F' }}>
            Loading gigs...
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center text-navyBlueMedium" style={{ color: '#2A3A6F' }}>
            No gigs found.
          </div>
        ) : (
          <>
            {/* Gigs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <div
                  key={gig._id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)',
                  }}
                >
                  <img
                    src={gig.thumbnail || 'https://via.placeholder.com/300x200'}
                    alt={gig.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3
                    className="text-xl font-semibold text-navyBlue mb-2 cursor-pointer hover:underline"
                    style={{ color: '#1A2A4F' }}
                    onClick={() => navigate(`/gigs/${gig._id}`)}
                  >
                    {gig.title}
                  </h3>
                  <p className="text-navyBlueMedium mb-2" style={{ color: '#2A3A6F' }}>
                    {gig.description.substring(0, 100)}...
                  </p>
                  <p className="text-sm text-navyBlueLight mb-2" style={{ color: '#3A4A7F' }}>
                    Category: {gig.category}
                  </p>
                  <p className="text-lg font-bold text-navyBlue mb-4" style={{ color: '#1A2A4F' }}>
                    ${gig.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-navyBlueLight mb-4" style={{ color: '#3A4A7F' }}>
                    Seller: {gig.sellerName}
                  </p>
                  {userId === gig.sellerId ? (
                    <button
                      onClick={() => handleDeleteGig(gig._id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={20} />
                      Delete Gig
                    </button>
                  ) : (
                    <button
                      onClick={() => handleContactSeller(gig.sellerId)}
                      className="w-full px-4 py-2 bg-navyBlue text-white rounded-lg hover:bg-navyBlueLight transition-colors duration-300"
                      style={{ backgroundColor: '#1A2A4F' }}
                    >
                      Contact Seller
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() =>
                  navigate(
                    `/gigs?category=${encodeURIComponent(category)}&search=${encodeURIComponent(
                      searchQuery
                    )}&page=${Math.max(1, currentPage - 1)}`
                  )
                }
                disabled={currentPage <= 1}
                className="px-4 py-2 bg-navyBlue text-white rounded-lg hover:bg-navyBlueLight disabled:opacity-50 transition-colors duration-300"
                style={{ backgroundColor: '#1A2A4F' }}
              >
                Previous
              </button>
              <span className="text-navyBlueMedium" style={{ color: '#2A3A6F' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  navigate(
                    `/gigs?category=${encodeURIComponent(category)}&search=${encodeURIComponent(
                      searchQuery
                    )}&page=${currentPage + 1}`
                  )
                }
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-navyBlue text-white rounded-lg hover:bg-navyBlueLight disabled:opacity-50 transition-colors duration-300"
                style={{ backgroundColor: '#1A2A4F' }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Gigs;