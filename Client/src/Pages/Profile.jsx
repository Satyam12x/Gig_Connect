import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Star,
  CheckCircle,
  Linkedin,
  Github,
  Instagram,
  Trophy,
  Award,
  Target,
  Edit2,
  X,
  Check,
  Plus,
  Trash2,
  Share2,
  Camera,
  Upload,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";

const API_BASE = "http://localhost:5000/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [nameForm, setNameForm] = useState({ fullName: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "", otp: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [certForm, setCertForm] = useState({ name: "", issuer: "" });
  const [showNameForm, setShowNameForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [showShareCard, setShowShareCard] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const [profileRes, reviewsRes] = await Promise.all([
          axios.get(`${API_BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUser(profileRes.data);
        setReviews(reviewsRes.data);
        setNameForm({ fullName: profileRes.data.fullName });
      } catch (err) {
        setError("Failed to fetch profile data");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleNameChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/users/profile`,
        { fullName: nameForm.fullName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser({ ...user, fullName: nameForm.fullName });
      setShowNameForm(false);
      toast.success("Name updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update name");
      toast.error(err.response?.data?.error || "Failed to update name");
    }
  };

  const handleEmailRequest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/users/request-email-otp`,
        { newEmail: emailForm.newEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowOtpForm(true);
      toast.success("OTP sent to new email");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
      toast.error(err.response?.data?.error || "Failed to send OTP");
    }
  };

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/users/verify-email-otp`,
        {
          newEmail: emailForm.newEmail,
          otp: emailForm.otp,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser({ ...user, email: emailForm.newEmail });
      setShowEmailForm(false);
      setShowOtpForm(false);
      setEmailForm({ newEmail: "", otp: "" });
      toast.success("Email updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to verify OTP");
      toast.error(err.response?.data?.error || "Failed to verify OTP");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match");
      toast.error("New password and confirmation do not match");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/users/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
      toast.error(err.response?.data?.error || "Failed to update password");
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/users/skills`,
        { skill: newSkill },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser({
        ...user,
        skills: [...user.skills, { name: newSkill }],
      });
      setNewSkill("");
      setShowSkillForm(false);
      toast.success("Skill added successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add skill");
      toast.error(err.response?.data?.error || "Failed to add skill");
    }
  };

  const handleDeleteSkill = async (skillName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/users/skills/${skillName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({
        ...user,
        skills: user.skills.filter((s) => s.name !== skillName),
      });
      toast.success("Skill removed successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove skill");
      toast.error(err.response?.data?.error || "Failed to remove skill");
    }
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    if (!certForm.name.trim() || !certForm.issuer.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/users/certifications`, certForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({
        ...user,
        certifications: [...(user.certifications || []), certForm],
      });
      setCertForm({ name: "", issuer: "" });
      setShowCertForm(false);
      toast.success("Certification added successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add certification");
      toast.error(err.response?.data?.error || "Failed to add certification");
    }
  };

  const handleDeleteCertification = async (certName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/users/certifications/${certName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({
        ...user,
        certifications: user.certifications.filter((c) => c.name !== certName),
      });
      toast.success("Certification removed successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove certification");
      toast.error(
        err.response?.data?.error || "Failed to remove certification"
      );
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/users/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUser({ ...user, profilePicture: response.data.profilePicture });
      setProfilePic(null);
      fileInputRef.current.value = null;
      toast.success("Profile picture updated successfully");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to update profile picture";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setProfilePic(file);
      handleProfilePicUpload({ target: { files: [file] } });
    }
  };

  const handleShareProfile = () => {
    setShowShareCard(true);
  };

  const downloadProfileCard = () => {
    toast.success("Profile card downloaded!");
    setShowShareCard(false);
  };

  if (!user)
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-xl font-medium text-[#1A2A4F]">Loading...</div>
      </div>
    );

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1
      )
    : 0;

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden">
      <Toaster position="top-right" />
      <Navbar />

      {/* Header Banner with Margin */}
      <div className="bg-navyBlue relative overflow-hidden mt-16">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center">
          <div className="text-[#1A2A4F] hidden sm:block">
            <p className="text-sm opacity-90">Welcome back,</p>
            <p className="text-lg font-semibold">{user.fullName}</p>
          </div>
          <button
            onClick={handleShareProfile}
            className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-[#1A2A4F] transition-all duration-300 hover:scale-110"
            title="Share Profile"
          >
            <Share2 size={20} className="text-[#1A2A4F]" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-300">
              <div className="p-8 text-center">
                <div
                  className={`relative inline-block w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg transition-all duration-300 ${
                    isDragging ? "bg-blue-50" : ""
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-navyBlue to-navyBlueLight flex items-center justify-center text-[#1A2A4F] text-5xl font-bold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-navyBlue rounded-full flex items-center justify-center cursor-pointer hover:bg-navyBlueLight transition-all duration-200 shadow-lg">
                    {isUploading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-[#1A2A4F] border-t-transparent rounded-full"></div>
                    ) : (
                      <Camera size={18} className="text-[#1A2A4F]" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleProfilePicUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-center gap-2">
                    <h1 className="text-2xl font-bold text-[#1A2A4F]">
                      {user.fullName}
                    </h1>
                    {user.isVerified && (
                      <CheckCircle className="text-[#1A2A4F]" size={22} />
                    )}
                  </div>
                  <span className="inline-block mt-3 px-4 py-1.5 bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F] text-sm font-medium rounded-full">
                    {user.role}
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3 text-[#1A2A4F]">
                    <Mail size={18} className="text-[#1A2A4F]" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#1A2A4F]">
                    <Target size={18} className="text-[#1A2A4F]" />
                    <span className="text-sm">{user.college}</span>
                  </div>
                </div>

                {user.bio && (
                  <p className="mt-6 text-[#1A2A4F] text-sm leading-relaxed">
                    {user.bio}
                  </p>
                )}

                <div className="flex gap-3 mt-8 justify-center">
                  {user.socialLinks?.linkedin && (
                    <a
                      href={user.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-300 hover:bg-navyBlue text-[#1A2A4F] hover:text-[#1A2A4F] flex items-center justify-center transition-all duration-300"
                    >
                      <Linkedin size={18} className="text-[#1A2A4F]" />
                    </a>
                  )}
                  {user.socialLinks?.github && (
                    <a
                      href={user.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-300 hover:bg-navyBlue text-[#1A2A4F] hover:text-[#1A2A4F] flex items-center justify-center transition-all duration-300"
                    >
                      <Github size={18} className="text-[#1A2A4F]" />
                    </a>
                  )}
                  {user.socialLinks?.instagram && (
                    <a
                      href={user.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-300 hover:bg-navyBlue text-[#1A2A4F] hover:text-[#1A2A4F] flex items-center justify-center transition-all duration-300"
                    >
                      <Instagram size={18} className="text-[#1A2A4F]" />
                    </a>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-300 grid grid-cols-3 divide-x divide-gray-300">
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#1A2A4F]">
                    {user.totalGigs || 0}
                  </div>
                  <div className="text-xs text-[#1A2A4F] mt-1">Orders</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#1A2A4F]">
                    {averageRating}
                  </div>
                  <div className="text-xs text-[#1A2A4F] mt-1">Rating</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#1A2A4F]">
                    {reviews.length}
                  </div>
                  <div className="text-xs text-[#1A2A4F] mt-1">Reviews</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-[#1A2A4F] flex items-center gap-2 mb-6">
                <Trophy size={22} className="text-[#1A2A4F]" />
                Achievements
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} className="text-[#1A2A4F]" />
                    <span className="text-sm font-semibold text-[#1A2A4F]">
                      Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="text-[#1A2A4F]"
                          fill={
                            i < Math.round(averageRating) ? "#1A2A4F" : "none"
                          }
                          size={18}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[#1A2A4F]">
                      {averageRating}/5
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={16} className="text-[#1A2A4F]" />
                    <span className="text-sm font-semibold text-[#1A2A4F]">
                      Completion
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#1A2A4F]">
                      {user.completionRate || 0}% rate
                    </span>
                    <span className="text-[#1A2A4F]">
                      {user.gigsCompleted || 0}/{user.totalGigs || 0}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-300 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-navyBlue to-navyBlueLight h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${user.completionRate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings, Skills, Certifications */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-300">
              <div className="px-8 py-6 border-b border-gray-300">
                <h2 className="text-xl font-bold text-[#1A2A4F]">
                  Account Settings
                </h2>
              </div>

              <div className="p-8 space-y-8">
                <div className="border-b border-gray-300 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <User size={18} className="text-[#1A2A4F]" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#1A2A4F]">
                          Full Name
                        </h3>
                        <p className="text-sm text-[#1A2A4F]">
                          Update your display name
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowNameForm(!showNameForm)}
                      className="px-4 py-2 text-sm font-medium text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      {showNameForm ? (
                        <X size={16} className="text-[#1A2A4F]" />
                      ) : (
                        <Edit2 size={16} className="text-[#1A2A4F]" />
                      )}
                      {showNameForm ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      showNameForm
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <form
                      onSubmit={handleNameChange}
                      className="mt-4 space-y-4"
                    >
                      <input
                        type="text"
                        value={nameForm.fullName}
                        onChange={(e) =>
                          setNameForm({ fullName: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 text-[#1A2A4F]"
                        placeholder="Enter your full name"
                        required
                      />
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F] font-medium rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <Check size={16} className="text-[#1A2A4F]" />
                        Save Changes
                      </button>
                    </form>
                  </div>
                </div>

                <div className="border-b border-gray-300 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Mail size={18} className="text-[#1A2A4F]" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#1A2A4F]">
                          Email Address
                        </h3>
                        <p className="text-sm text-[#1A2A4F]">
                          Change your email with OTP verification
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEmailForm(!showEmailForm)}
                      className="px-4 py-2 text-sm font-medium text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      {showEmailForm ? (
                        <X size={16} className="text-[#1A2A4F]" />
                      ) : (
                        <Edit2 size={16} className="text-[#1A2A4F]" />
                      )}
                      {showEmailForm ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      showEmailForm
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <form
                      onSubmit={
                        showOtpForm ? handleEmailVerify : handleEmailRequest
                      }
                      className="mt-4 space-y-4"
                    >
                      <input
                        type="email"
                        value={emailForm.newEmail}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            newEmail: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 text-[#1A2A4F]"
                        placeholder="Enter new email address"
                        disabled={showOtpForm}
                        required
                      />
                      {showOtpForm && (
                        <input
                          type="text"
                          value={emailForm.otp}
                          onChange={(e) =>
                            setEmailForm({ ...emailForm, otp: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 text-[#1A2A4F]"
                          placeholder="Enter OTP"
                          required
                        />
                      )}
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F] font-medium rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <Check size={16} className="text-[#1A2A4F]" />
                        {showOtpForm ? "Verify OTP" : "Send OTP"}
                      </button>
                    </form>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Lock size={18} className="text-[#1A2A4F]" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#1A2A4F]">
                          Password
                        </h3>
                        <p className="text-sm text-[#1A2A4F]">
                          Update your account password
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="px-4 py-2 text-sm font-medium text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      {showPasswordForm ? (
                        <X size={16} className="text-[#1A2A4F]" />
                      ) : (
                        <Edit2 size={16} className="text-[#1A2A4F]" />
                      )}
                      {showPasswordForm ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      showPasswordForm
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    <form
                      onSubmit={handlePasswordChange}
                      className="mt-4 space-y-4"
                    >
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 text-[#1A2A4F]"
                        placeholder="Current password"
                        required
                      />
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 text-[#1A2A4F]"
                        placeholder="New password"
                        required
                      />
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 text-[#1A2A4F]"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F] font-medium rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <Check size={16} className="text-[#1A2A4F]" />
                        Update Password
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-300">
              <div className="px-8 py-6 border-b border-gray-300 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1A2A4F]">Skills</h2>
                <button
                  onClick={() => setShowSkillForm(!showSkillForm)}
                  className="px-4 py-2 text-sm font-medium text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  {showSkillForm ? (
                    <X size={16} className="text-[#1A2A4F]" />
                  ) : (
                    <Plus size={16} className="text-[#1A2A4F]" />
                  )}
                  {showSkillForm ? "Cancel" : "Add Skill"}
                </button>
              </div>

              <div className="p-8">
                <div
                  className={`transition-all duration-300 ${
                    showSkillForm
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <form onSubmit={handleAddSkill} className="mb-6">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 text-[#1A2A4F]"
                        placeholder="Enter skill name"
                        required
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F] font-medium rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <Plus size={16} className="text-[#1A2A4F]" />
                        Add
                      </button>
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="group p-4 border border-gray-300 rounded-xl hover:border-navyBlue hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#1A2A4F] mb-1">
                            {skill.name}
                          </h4>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleDeleteSkill(skill.name)}
                            className="p-1.5 text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 size={16} className="text-[#1A2A4F]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-300">
              <div className="px-8 py-6 border-b border-gray-300 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1A2A4F]">
                  Certifications
                </h2>
                <button
                  onClick={() => setShowCertForm(!showCertForm)}
                  className={`px-4 py-2 text-sm font-medium text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    user.certifications?.length >= 2
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={user.certifications?.length >= 2}
                >
                  {showCertForm ? (
                    <X size={16} className="text-[#1A2A4F]" />
                  ) : (
                    <Plus size={16} className="text-[#1A2A4F]" />
                  )}
                  {showCertForm ? "Cancel" : "Add Certification"}
                </button>
              </div>

              <div className="p-8">
                <div
                  className={`transition-all duration-300 ${
                    showCertForm
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <form
                    onSubmit={handleAddCertification}
                    className="mb-6 space-y-4"
                  >
                    <input
                      type="text"
                      value={certForm.name}
                      onChange={(e) =>
                        setCertForm({ ...certForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 text-[#1A2A4F]"
                      placeholder="Certification name"
                      required
                    />
                    <input
                      type="text"
                      value={certForm.issuer}
                      onChange={(e) =>
                        setCertForm({ ...certForm, issuer: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 text-[#1A2A4F]"
                      placeholder="Issuing organization"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F] font-medium rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <Plus size={16} className="text-[#1A2A4F]" />
                      Add
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.certifications?.map((cert, index) => (
                    <div
                      key={index}
                      className="group p-4 border border-gray-300 rounded-xl hover:border-navyBlue hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#1A2A4F] mb-1">
                            {cert.name}
                          </h4>
                          <p className="text-sm text-[#1A2A4F]">
                            {cert.issuer}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCertification(cert.name)}
                          className="p-1.5 text-[#1A2A4F] hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} className="text-[#1A2A4F]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showShareCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShareCard(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-navyBlue to-navyBlueLight p-6 text-[#1A2A4F]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#1A2A4F]">
                  Share Profile
                </h3>
                <button
                  onClick={() => setShowShareCard(false)}
                  className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
                >
                  <X size={18} className="text-[#1A2A4F]" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-blue-50 to-navyBlueLight rounded-xl p-6 mb-6 border-2 border-blue-50">
                <div className="flex items-center gap-4 mb-4">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navyBlue to-navyBlueLight flex items-center justify-center text-[#1A2A4F] text-2xl font-bold border-2 border-white shadow-lg">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[#1A2A4F] text-lg">
                      {user.fullName}
                    </h4>
                    <p className="text-sm text-[#1A2A4F]">{user.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-[#1A2A4F]">
                      {user.totalGigs || 0}
                    </div>
                    <div className="text-xs text-[#1A2A4F]">Orders</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-[#1A2A4F]">
                      {averageRating}
                    </div>
                    <div className="text-xs text-[#1A2A4F]">Rating</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-[#1A2A4F]">
                      {user.completionRate || 0}%
                    </div>
                    <div className="text-xs text-[#1A2A4F]">Complete</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-50">
                  <p className="text-xs text-[#1A2A4F] text-center">
                    {user.email} • {user.college}
                  </p>
                </div>
              </div>

              <button
                onClick={downloadProfileCard}
                className="w-full px-6 py-3 bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F] font-medium rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Upload size={18} className="text-[#1A2A4F]" />
                Download Profile Card
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-[#1A2A4F] px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default Profile;
