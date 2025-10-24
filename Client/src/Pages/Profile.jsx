import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, CheckCircle, Linkedin, Github, Instagram, Lock } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const [profileRes, reviewsRes] = await Promise.all([
          axios.get(`${API_BASE}/users/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/reviews`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUser(profileRes.data);
        setReviews(reviewsRes.data);
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/users/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswordError('');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password updated successfully');
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    }
  };

  if (!user) return <div className="text-center py-10 text-navyBlue">Loading...</div>;

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen font-sans antialiased relative overflow-hidden bg-gray-100">
      {/* Irregular Gradient Backgrounds */}
      <svg className="absolute top-0 left-0 w-full h-1/2 opacity-30" viewBox="0 0 1440 600" preserveAspectRatio="none">
        <path
          d="M0,0 C300,100 600,50 900,200 1200,350 1440,300 1440,600 L1440,0 Z"
          className="fill-current text-navyBlue"
          style={{ fill: '#1A2A4F' }}
        />
      </svg>
      <svg className="absolute bottom-0 right-0 w-full h-1/2 opacity-30" viewBox="0 0 1440 600" preserveAspectRatio="none">
        <path
          d="M0,600 C300,500 600,550 900,400 1200,250 1440,300 1440,0 L0,0 Z"
          className="fill-current text-navyBlueLight"
          style={{ fill: '#3A4A7F' }}
        />
      </svg>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        {/* Hero Section */}
        <div className="relative text-center mb-12">
          <div className="inline-block relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-navyBlue transition-transform duration-300 hover:scale-105"
                style={{ borderColor: '#1A2A4F' }}
              />
            ) : (
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-navyBlue flex items-center justify-center text-white text-4xl sm:text-5xl font-sans transition-transform duration-300 hover:scale-105"
                style={{ backgroundColor: '#1A2A4F' }}
              >
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute top-0 right-0 bg-navyBlue text-white text-xs px-2 py-1 rounded-full transform translate-x-1/4 -translate-y-1/4">
              {user.role}
            </span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-navyBlue" style={{ color: '#1A2A4F' }}>
            {user.fullName}
          </h1>
          <p className="text-navyBlueMedium text-lg sm:text-xl" style={{ color: '#2A3A6F' }}>
            {user.email}
          </p>
          <p className="text-navyBlueMedium text-lg sm:text-xl" style={{ color: '#2A3A6F' }}>
            {user.college}
          </p>
          {user.isVerified && (
            <div className="flex items-center justify-center mt-2">
              <CheckCircle className="text-green-500" size={20} />
              <span className="ml-1 text-navyBlue text-sm" style={{ color: '#1A2A4F' }}>Verified</span>
            </div>
          )}
          <p className="mt-3 text-navyBlueMedium max-w-md mx-auto" style={{ color: '#2A3A6F' }}>
            {user.bio || 'No bio provided'}
          </p>
          <div className="flex gap-4 mt-4 justify-center">
            {user.socialLinks?.linkedin && (
              <a
                href={user.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navyBlue hover:text-navyBlueLight transition-transform duration-300 hover:scale-110"
              >
                <Linkedin size={28} />
              </a>
            )}
            {user.socialLinks?.github && (
              <a
                href={user.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navyBlue hover:text-navyBlueLight transition-transform duration-300 hover:scale-110"
              >
                <Github size={28} />
              </a>
            )}
            {user.socialLinks?.instagram && (
              <a
                href={user.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navyBlue hover:text-navyBlueLight transition-transform duration-300 hover:scale-110"
              >
                <Instagram size={28} />
              </a>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="space-y-12">
          {/* Change Password */}
          <div className="relative">
            <div
              className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl max-w-lg mx-auto transition-all duration-500"
              style={{
                clipPath: 'polygon(0% 0%, 95% 0%, 100% 20%, 100% 80%, 90% 100%, 10% 100%, 0% 80%)',
              }}
            >
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center text-navyBlue font-semibold mb-4 hover:text-navyBlueLight transition-colors duration-300"
                style={{ color: '#1A2A4F' }}
              >
                <Lock size={20} className="mr-2" />
                Change Password
              </button>
              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="space-y-4 animate-slide-in">
                  <div>
                    <label className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="w-full border border-blue-100 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-navyBlueLight"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full border border-blue-100 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-navyBlueLight"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-navyBlue font-semibold" style={{ color: '#1A2A4F' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="w-full border border-blue-100 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-navyBlueLight"
                      required
                    />
                  </div>
                  {passwordError && <p className="text-red-700">{passwordError}</p>}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight transition-colors duration-300"
                    style={{ backgroundColor: '#1A2A4F' }}
                  >
                    Update Password
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Overall Rating */}
          <div className="relative">
            <div
              className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl max-w-lg mx-auto transition-all duration-500 hover:scale-105"
              style={{
                clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 95%)',
              }}
            >
              <h2 className="text-2xl font-bold text-navyBlue mb-4" style={{ color: '#1A2A4F' }}>
                Rating
              </h2>
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`transition-transform duration-300 hover:scale-125 ${
                        i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill={i < Math.round(averageRating) ? '#FFD700' : 'none'}
                      size={24}
                    />
                  ))}
                </div>
                <p className="ml-2 text-navyBlue" style={{ color: '#1A2A4F' }}>
                  {averageRating}/5 ({reviews.length} reviews)
                </p>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="relative">
            <div
              className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl max-w-lg mx-auto transition-all duration-500 hover:scale-105"
              style={{
                clipPath: 'polygon(0% 5%, 90% 0%, 100% 90%, 10% 100%)',
              }}
            >
              <h2 className="text-2xl font-bold text-navyBlue mb-4" style={{ color: '#1A2A4F' }}>
                Orders
              </h2>
              <p className="text-navyBlue" style={{ color: '#1A2A4F' }}>
                Total Orders: {user.totalGigs || 0}
              </p>
              <p className="text-navyBlue mt-2" style={{ color: '#1A2A4F' }}>
                Completion Rate: {user.completionRate || 0}% ({user.gigsCompleted || 0}/{user.totalGigs || 0})
              </p>
            </div>
          </div>

          {/* Skills Endorsements */}
          <div className="relative">
            <div
              className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl max-w-lg mx-auto transition-all duration-500"
              style={{
                clipPath: 'polygon(10% 0%, 100% 5%, 90% 100%, 0% 90%)',
              }}
            >
              <h2 className="text-2xl font-bold text-navyBlue mb-4" style={{ color: '#1A2A4F' }}>
                Skills
              </h2>
              {user.skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <p className="text-navyBlue" style={{ color: '#1A2A4F' }}>
                    {skill.name} ({skill.endorsements || 0} endorsements)
                  </p>
                  <button
                    onClick={() => handleEndorseSkill(skill.name)}
                    className="text-navyBlue hover:text-navyBlueLight text-sm transition-colors duration-300 hover:scale-110"
                    style={{ color: '#1A2A4F' }}
                  >
                    Endorse
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {error && <p className="text-red-700 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Profile;