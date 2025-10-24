import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE = 'http://localhost:5000/api';

const CreateGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('price', formData.price);
    if (thumbnail) data.append('thumbnail', thumbnail);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/gigs`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Gig created successfully!');
      navigate('/gigs');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create gig');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Toaster position="top-right" />
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
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-navyBlue mb-8 text-center font-sans" style={{ color: '#1A2A4F' }}>
            Create a New Gig
          </h1>
          <div className="bg-white bg-opacity-70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-blue-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-navyBlueMedium font-medium mb-2 font-sans" style={{ color: '#2A3A6F' }}>
                  Gig Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:outline-none focus:ring-2 focus:ring-navyBlueLight font-sans"
                  style={{ color: '#2A3A6F' }}
                  placeholder="e.g., Build a Responsive Website"
                />
              </div>
              <div>
                <label className="block text-navyBlueMedium font-medium mb-2 font-sans" style={{ color: '#2A3A6F' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:outline-none focus:ring-2 focus:ring-navyBlueLight font-sans"
                  style={{ color: '#2A3A6F' }}
                  rows="5"
                  placeholder="Describe your gig in detail..."
                ></textarea>
              </div>
              <div>
                <label className="block text-navyBlueMedium font-medium mb-2 font-sans" style={{ color: '#2A3A6F' }}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:outline-none focus:ring-2 focus:ring-navyBlueLight font-sans"
                  style={{ color: '#2A3A6F' }}
                >
                  <option value="">Select a category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Tutoring">Tutoring</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-navyBlueMedium font-medium mb-2 font-sans" style={{ color: '#2A3A6F' }}>
                  Starting Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-lg border border-blue-100 focus:outline-none focus:ring-2 focus:ring-navyBlueLight font-sans"
                  style={{ color: '#2A3A6F' }}
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <label className="block text-navyBlueMedium font-medium mb-2 font-sans" style={{ color: '#2A3A6F' }}>
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-lg border border-blue-100 font-sans"
                  style={{ color: '#2A3A6F' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans transition-colors duration-300 disabled:opacity-50"
                style={{ backgroundColor: '#1A2A4F', color: '#FFFFFF' }}
              >
                {loading ? 'Creating Gig...' : 'Create Gig'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateGig;