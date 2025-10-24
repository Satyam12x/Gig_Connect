import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Briefcase, BookOpen, PenTool, MessageCircle, Edit, CheckCircle, Linkedin, Github, Instagram } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE = 'http://localhost:5000/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('public');
  const [reviews, setReviews] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [credits, setCredits] = useState({ balance: 0, transactions: [], earnings: 0 });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', bio: '', skills: [], socialLinks: {} });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const [profileRes, reviewsRes, gigsRes, creditsRes] = await Promise.all([
          axios.get(`${API_BASE}/users/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/reviews`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/gigs`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/credits`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUser(profileRes.data);
        setReviews(reviewsRes.data);
        setGigs(gigsRes.data);
        setCredits(creditsRes.data);
        setFormData({
          fullName: profileRes.data.fullName,
          bio: profileRes.data.bio,
          skills: profileRes.data.skills || [],
          socialLinks: profileRes.data.socialLinks || {},
        });
      } catch (err) {
        setError('Failed to fetch profile data');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, ...formData });
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/users/profile/picture`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setUser({ ...user, profilePicture: res.data.profilePicture });
    } catch (err) {
      setError('Failed to upload profile picture');
    }
  };

  const handleEndorseSkill = async (skill) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/users/endorse`, { skill }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({
        ...user,
        skills: user.skills.map((s) =>
          s.name === skill ? { ...s, endorsements: (s.endorsements || 0) + 1 } : s
        ),
      });
    } catch (err) {
      setError('Failed to endorse skill');
    }
  };

  if (!user) return <div className="text-center py-10">Loading...</div>;

  const ratingData = {
    labels: ['5★', '4★', '3★', '2★', '1★'],
    datasets: [
      {
        label: 'Reviews',
        data: [
          reviews.filter((r) => r.rating === 5).length,
          reviews.filter((r) => r.rating === 4).length,
          reviews.filter((r) => r.rating === 3).length,
          reviews.filter((r) => r.rating === 2).length,
          reviews.filter((r) => r.rating === 1).length,
        ],
        backgroundColor: '#FFD700',
      },
    ],
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-6 mb-8 flex flex-col md:flex-row items-center md:items-start">
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-navyBlue flex items-center justify-center text-white text-4xl font-sans">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            {activeTab === 'private' && (
              <label className="absolute bottom-0 right-0 bg-navyBlue text-white p-2 rounded-full cursor-pointer">
                <Edit size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                />
              </label>
            )}
          </div>
          <div className="ml-0 md:ml-6 mt-4 md:mt-0 text-center md:text-left">
            <h1 className="text-3xl font-bold text-navyBlue" style={{ color: '#1A2A4F' }}>
              {user.fullName}
            </h1>
            <p className="text-navyBlueMedium" style={{ color: '#2A3A6F' }}>
              {user.college}
            </p>
            <div className="flex items-center justify-center md:justify-start mt-2">
              <span className="bg-navyBlue text-white px-3 py-1 rounded-full text-sm font-sans">
                {user.role}
              </span>
              {user.isVerified && (
                <CheckCircle className="ml-2 text-green-500" size={20} />
              )}
            </div>
            <p className="text-navyBlueMedium mt-2 max-w-md" style={{ color: '#2A3A6F' }}>
              {user.bio}
            </p>
            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              {user.socialLinks?.linkedin && (
                <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="text-navyBlue hover:text-navyBlueLight" size={24} />
                </a>
              )}
              {user.socialLinks?.github && (
                <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer">
                  <Github className="text-navyBlue hover:text-navyBlueLight" size={24} />
                </a>
              )}
              {user.socialLinks?.instagram && (
                <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="text-navyBlue hover:text-navyBlueLight" size={24} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-blue-100 mb-8">
          <button
            className={`px-4 py-2 font-semibold ${activeTab === 'public' ? 'border-b-2 border-navyBlue text-navyBlue' : 'text-gray-500'}`}
            style={{ color: activeTab === 'public' ? '#1A2A4F' : '#6B7280' }}
            onClick={() => setActiveTab('public')}
          >
            Public Profile
          </button>
          <button
            className={`px-4 py-2 font-semibold ${activeTab === 'private' ? 'border-b-2 border-navyBlue text-navyBlue' : 'text-gray-500'}`}
            style={{ color: activeTab === 'private' ? '#1A2A4F' : '#6B7280' }}
            onClick={() => setActiveTab('private')}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Overview/Ratings */}
          <div className="space-y-8">
            {/* Praise Elements */}
            <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-6">
              <h2 className="text-2xl font-bold text-navyBlue mb-4" style={{ color: '#1A2A4F' }}>
                Reputation
              </h2>
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}
                      fill={i < Math.round(averageRating) ? '#FFD700' : 'none'}
                      size={24}
                    />
                  ))}
                </div>
                <p className="ml-2 text-navyBlue" style={{ color: '#1A2A4F' }}>
                  {averageRating}/5 ({reviews.length} reviews)
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-navyBlue" style={{ color: '#1A2A4F' }}>
                  Review Summary
                </h3>
                <Bar
                  data={ratingData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navyBlue mb-2" style={{ color: '#1A2A4F' }}>
                  Recent Reviews
                </h3>
                {reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="border-t border-blue-100 pt-4 mt-4">
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="text-yellow-400" fill="#FFD700" size={16} />
                        ))}
                      </div>
                      <p className="ml-2 text-sm text-navyBlueMedium" style={{ color: '#2A3A6F' }}>
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-navyBlueMedium mt-2" style={{ color: '#2A3A6F' }}>
                      "{review.text}"
                    </p>
                    <p className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                      - {review.reviewerName}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-navyBlue mb-2" style={{ color: '#1A2A4F' }}>
                  Skills
                </h3>
                {user.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <p className="text-navyBlue" style={{ color: '#1A2A4F' }}>
                      {skill.name} ({skill.endorsements || 0} endorsements)
                    </p>
                    {activeTab === 'public' && (
                      <button
                        onClick={() => handleEndorseSkill(skill.name)}
                        className="text-navyBlue hover:text-navyBlueLight text-sm"
                        style={{ color: '#1A2A4F' }}
                      >
                        Endorse
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-navyBlue mb-2" style={{ color: '#1A2A4F' }}>
                  Achievements
                </h3>
                <div className="flex gap-4">
                  {user.gigsCompleted >= 100 && (
                    <span className="bg-navyBlue text-white px-3 py-1 rounded-full text-sm font-sans">
                      100+ Gigs
                    </span>
                  )}
                  {averageRating >= 4.5 && (
                    <span className="bg-navyBlue text-white px-3 py-1 rounded-full text-sm font-sans">
                      Top Rated
                    </span>
                  )}
                  {user.isVerified && (
                    <span className="bg-navyBlue text-white px-3 py-1 rounded-full text-sm font-sans">
                      Verified Student
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Credits System */}
            <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-6">
              <h2 className="text-2xl font-bold text-navyBlue mb-4" style={{ color: '#1A2A4F' }}>
                Credits & Earnings
              </h2>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-navyBlue" style={{ color: '#1A2A4F' }}>
                  Credit Balance
                </h3>
                <p className="text-navyBlue" style={{ color: '#1A2A4F' }}>
                  {credits.balance} Credits
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-navyBlue h-2.5 rounded-full"
                    style={{ width: `${(credits.balance / 500) * 100}%`, backgroundColor: '#1A2A4F' }}
                  ></div>
                </div>
                <p className="text-sm text-navyBlueMedium mt-1" style={{ color: '#2A3A6F' }}>
                  {500 - credits.balance} credits to Silver Tier
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-navyBlue" style={{ color: '#1A2A4F' }}>
                  Lifetime Earnings
                </h3>
                <p className="text-navyBlue" style={{ color: '#1A2A4F' }}>
                  ${credits.earnings.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navyBlue mb-2" style={{ color: '#1A2A4F' }}>
                  Recent Transactions
                </h3>
                {credits.transactions.slice(0, 3).map((txn, index) => (
                  <div key={index} className="border-t border-blue-100 pt-4 mt-4">
                    <p className="text-navyBlue" style={{ color: '#1A2A4F' }}>
                      {txn.amount > 0 ? '+' : ''}{txn.amount} Credits - {txn.description}
                    </p>
                    <p className="text-sm text-navyBlueMedium" style={{ color: '#2A3A6F' }}>
                      {new Date(txn.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Portfolio/Activity */}
          {activeTab === 'public' ? (
            <div className="space-y-8">
              {/* Portfolio */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-6">
                <h2 className="text-2xl font-bold text-navyBlue mb-4" style={{ color: '#1A2A4F' }}>
                  Portfolio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.portfolio?.map((item, index) => (
                    <div key={index} className="border border-blue-100 rounded-lg p-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                      <h3 className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                        {item.title}
                      </h3>
                      <p className="text-navyBlueMedium text-sm" style={{ color: '#2A3A6F' }}>
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Gigs */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-6">
                <h2 className="text-2xl font-bold text-navyBlue mb-4" style={{ color: '#1A2A4F' }}>
                  Active Gigs
                </h2>
                {gigs.map((gig, index) => (
                  <div key={index} className="border-t border-blue-100 pt-4 mt-4">
                    <div className="flex items-center">
                      {gig.category === 'Web Development' && <Laptop className="text-navyBlueLight mr-2" size={24} />}
                      {gig.category === 'Graphic Design' && <PenTool className="text-navyBlueLight mr-2" size={24} />}
                      {gig.category === 'Tutoring' && <BookOpen className="text-navyBlueLight mr-2" size={24} />}
                      <div>
                        <h3 className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                          {gig.title}
                        </h3>
                        <p className="text-navyBlueMedium" style={{ color: '#2A3A6F' }}>
                          ${gig.price}/hr
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/gig/${gig._id}`}
                      className="text-navyBlue hover:text-navyBlueLight mt-2 inline-block"
                      style={{ color: '#1A2A4F' }}
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>

              {/* Activity */}
              <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-6">
                <h2 className="text-2xl font-bold text-navyBlue mb-4" style={{ color: '#1A2A4F' }}>
                  Activity
                </h2>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-navyBlue" style={{ color: '#1A2A4F' }}>
                    Completion Rate
                  </h3>
                  <p className="text-navyBlue" style={{ color: '#1A2A4F' }}>
                    {user.completionRate || 0}% ({user.gigsCompleted || 0}/{user.totalGigs || 0})
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navyBlue mb-2" style={{ color: '#1A2A4F' }}>
                    Order History
                  </h3>
                  {user.orderHistory?.slice(0, 3).map((order, index) => (
                    <div key={index} className="border-t border-blue-100 pt-4 mt-4">
                      <p className="text-navyBlue" style={{ color: '#1A2A4F' }}>
                        {order.title} - {order.status}
                      </p>
                      <p className="text-navyBlueMedium text-sm" style={{ color: '#2A3A6F' }}>
                        ${order.earnings} - {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-6">
              <h2 className="text-2xl font-bold text-navyBlue mb-4" style={{ color: '#1A2A4F' }}>
                Edit Profile
              </h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full border border-blue-100 rounded-lg p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                    Bio
                  </label>
                  <ReactQuill
                    value={formData.bio}
                    onChange={(value) => setFormData({ ...formData, bio: value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills.join(', ')}
                    onChange={(e) =>
                      setFormData({ ...formData, skills: e.target.value.split(',').map((s) => ({ name: s.trim(), endorsements: 0 })) })
                    }
                    className="w-full border border-blue-100 rounded-lg p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                    Social Links
                  </label>
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={formData.socialLinks.linkedin || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })
                    }
                    className="w-full border border-blue-100 rounded-lg p-2 mt-1"
                  />
                  <input
                    type="text"
                    placeholder="GitHub URL"
                    value={formData.socialLinks.github || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })
                    }
                    className="w-full border border-blue-100 rounded-lg p-2 mt-1"
                  />
                  <input
                    type="text"
                    placeholder="Instagram URL"
                    value={formData.socialLinks.instagram || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })
                    }
                    className="w-full border border-blue-100 rounded-lg p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                    Profile Visibility
                  </label>
                  <select
                    value={user.isPublic ? 'public' : 'private'}
                    onChange={(e) =>
                      axios.put(
                        `${API_BASE}/users/profile`,
                        { isPublic: e.target.value === 'public' },
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                      ).then(() => setUser({ ...user, isPublic: e.target.value === 'public' }))
                    }
                    className="w-full border border-blue-100 rounded-lg p-2 mt-1"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight"
                  style={{ backgroundColor: '#1A2A4F' }}
                >
                  Save Changes
                </button>
              </form>
              {error && <p className="text-red-700 mt-4">{error}</p>}
            </div>
          )}
        </div>

        {/* Contact Button */}
        {activeTab === 'public' && (
          <div className="mt-8 text-center">
            <button
              className="px-6 py-3 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight flex items-center mx-auto"
              style={{ backgroundColor: '#1A2A4F' }}
            >
              <MessageCircle size={20} className="mr-2" />
              Message {user.fullName}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;