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
  ArrowRight,
  Zap,
  Briefcase,
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-medium text-[#1A2A4F]">Loading...</div>
      </div>
    );

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1
      )
    : 0;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Toaster position="top-right" />
      <Navbar />

      {/* Modern Hero Section with Profile */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-start">
            {/* Left: Profile Image */}
            <div className="md:col-span-1 flex justify-center md:justify-start">
              <div className="relative group">
                <div
                  className={`relative inline-block w-40 h-40 rounded-2xl overflow-hidden transition-all duration-300 ${
                    isDragging
                      ? "ring-4 ring-[#1A2A4F] scale-105"
                      : "ring-2 ring-[#1A2A4F]/10"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F] flex items-center justify-center text-white text-6xl font-bold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300 cursor-pointer">
                    {isUploading ? (
                      <div className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Camera
                        size={24}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
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
              </div>
            </div>

            {/* Middle: Profile Info */}
            <div className="md:col-span-1 space-y-4">
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-[#1A2A4F]">
                    {user.fullName}
                  </h1>
                  {user.isVerified && (
                    <CheckCircle
                      className="text-[#1A2A4F] flex-shrink-0"
                      size={24}
                    />
                  )}
                </div>
                <p className="text-lg text-[#1A2A4F]/70">{user.role}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-[#1A2A4F]/5 text-[#1A2A4F] text-sm font-medium rounded-full">
                  {user.college}
                </span>
              </div>

              {user.bio && (
                <p className="text-[#1A2A4F]/80 leading-relaxed text-sm mt-4">
                  {user.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex gap-3 pt-2">
                {user.socialLinks?.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 rounded-lg bg-[#1A2A4F]/5 hover:bg-[#1A2A4F] text-[#1A2A4F] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Linkedin size={18} />
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-10 h-10 rounded-lg bg-[#1A2A4F]/5 hover:bg-[#1A2A4F] text-[#1A2A4F] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Github size={18} />
                  </a>
                )}
                {user.socialLinks?.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-10 h-10 rounded-lg bg-[#1A2A4F]/5 hover:bg-[#1A2A4F] text-[#1A2A4F] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Instagram size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Right: Stats */}
            <div className="md:col-span-1 grid grid-cols-3 gap-4">
              {[
                { label: "Orders", value: user.totalGigs || 0 },
                { label: "Rating", value: averageRating },
                { label: "Reviews", value: reviews.length },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-[#1A2A4F]/5 to-[#1A2A4F]/10 hover:from-[#1A2A4F]/10 hover:to-[#1A2A4F]/15 transition-all duration-300"
                >
                  <div className="text-2xl font-bold text-[#1A2A4F]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#1A2A4F]/60 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#1A2A4F]/20 to-transparent my-12"></div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Achievements & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Achievement Card */}
              <div className="group rounded-2xl p-6 bg-gradient-to-br from-[#1A2A4F]/5 to-[#1A2A4F]/10 hover:from-[#1A2A4F]/10 hover:to-[#1A2A4F]/15 transition-all duration-300 border border-[#1A2A4F]/10 hover:border-[#1A2A4F]/20">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="text-[#1A2A4F]" size={24} />
                  <h2 className="text-lg font-bold text-[#1A2A4F]">
                    Achievements
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Rating */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star size={16} className="text-[#1A2A4F]" />
                      <span className="text-sm font-semibold text-[#1A2A4F]">
                        Ratings
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(averageRating)
                                ? "text-[#1A2A4F] fill-[#1A2A4F]"
                                : "text-[#1A2A4F]/20"
                            }`}
                            size={14}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-[#1A2A4F]">
                        {averageRating}/5
                      </span>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-[#1A2A4F]" />
                        <span className="text-sm font-semibold text-[#1A2A4F]">
                          Completion Rate
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#1A2A4F]">
                        {user.completionRate || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1A2A4F]/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1A2A4F] to-[#2A3A5F] rounded-full transition-all duration-500"
                        style={{ width: `${user.completionRate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Settings, Skills, Certifications */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Settings Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#1A2A4F] flex items-center gap-2">
                  <Briefcase size={24} />
                  Account Settings
                </h2>

                {/* Settings Items */}
                <div className="space-y-4">
                  {[
                    {
                      icon: User,
                      title: "Full Name",
                      desc: "Update your display name",
                      show: showNameForm,
                      setShow: setShowNameForm,
                    },
                    {
                      icon: Mail,
                      title: "Email",
                      desc: "Change your email with OTP",
                      show: showEmailForm,
                      setShow: setShowEmailForm,
                    },
                    {
                      icon: Lock,
                      title: "Password",
                      desc: "Update your password",
                      show: showPasswordForm,
                      setShow: setShowPasswordForm,
                    },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="group rounded-xl p-4 bg-[#1A2A4F]/5 hover:bg-[#1A2A4F]/10 border border-[#1A2A4F]/10 hover:border-[#1A2A4F]/20 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#1A2A4F]/10 flex items-center justify-center">
                              <Icon size={18} className="text-[#1A2A4F]" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-[#1A2A4F]">
                                {item.title}
                              </h3>
                              <p className="text-xs text-[#1A2A4F]/60">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => item.setShow(!item.show)}
                            className="p-2 rounded-lg hover:bg-[#1A2A4F]/10 text-[#1A2A4F] transition-all duration-200"
                          >
                            {item.show ? <X size={18} /> : <Edit2 size={18} />}
                          </button>
                        </div>

                        {item.show && (
                          <div className="mt-4 pt-4 border-t border-[#1A2A4F]/10 space-y-3 animate-fade-in">
                            {idx === 0 && (
                              <form
                                onSubmit={handleNameChange}
                                className="space-y-3"
                              >
                                <input
                                  type="text"
                                  value={nameForm.fullName}
                                  onChange={(e) =>
                                    setNameForm({ fullName: e.target.value })
                                  }
                                  className="w-full px-3 py-2 border border-[#1A2A4F]/20 rounded-lg focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent text-[#1A2A4F] text-sm transition-all duration-200"
                                  placeholder="Enter your full name"
                                  required
                                />
                                <button
                                  type="submit"
                                  className="w-full px-4 py-2 bg-[#1A2A4F] text-white text-sm font-medium rounded-lg hover:bg-[#2A3A5F] transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                  <Check size={16} />
                                  Save
                                </button>
                              </form>
                            )}

                            {idx === 1 && (
                              <form
                                onSubmit={
                                  showOtpForm
                                    ? handleEmailVerify
                                    : handleEmailRequest
                                }
                                className="space-y-3"
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
                                  disabled={showOtpForm}
                                  className="w-full px-3 py-2 border border-[#1A2A4F]/20 rounded-lg focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent text-[#1A2A4F] text-sm transition-all duration-200 disabled:opacity-50"
                                  placeholder="Enter new email"
                                  required
                                />
                                {showOtpForm && (
                                  <input
                                    type="text"
                                    value={emailForm.otp}
                                    onChange={(e) =>
                                      setEmailForm({
                                        ...emailForm,
                                        otp: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-[#1A2A4F]/20 rounded-lg focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent text-[#1A2A4F] text-sm"
                                    placeholder="Enter OTP"
                                    required
                                  />
                                )}
                                <button
                                  type="submit"
                                  className="w-full px-4 py-2 bg-[#1A2A4F] text-white text-sm font-medium rounded-lg hover:bg-[#2A3A5F] transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                  <Check size={16} />
                                  {showOtpForm ? "Verify" : "Send OTP"}
                                </button>
                              </form>
                            )}

                            {idx === 2 && (
                              <form
                                onSubmit={handlePasswordChange}
                                className="space-y-3"
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
                                  className="w-full px-3 py-2 border border-[#1A2A4F]/20 rounded-lg focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent text-[#1A2A4F] text-sm"
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
                                  className="w-full px-3 py-2 border border-[#1A2A4F]/20 rounded-lg focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent text-[#1A2A4F] text-sm"
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
                                  className="w-full px-3 py-2 border border-[#1A2A4F]/20 rounded-lg focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent text-[#1A2A4F] text-sm"
                                  placeholder="Confirm password"
                                  required
                                />
                                <button
                                  type="submit"
                                  className="w-full px-4 py-2 bg-[#1A2A4F] text-white text-sm font-medium rounded-lg hover:bg-[#2A3A5F] transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                  <Check size={16} />
                                  Update
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1A2A4F] flex items-center gap-2">
                    <Zap size={24} />
                    Skills
                  </h2>
                  <button
                    onClick={() => setShowSkillForm(!showSkillForm)}
                    className="p-2 rounded-lg bg-[#1A2A4F] text-white hover:bg-[#2A3A5F] transition-all duration-200"
                  >
                    {showSkillForm ? <X size={18} /> : <Plus size={18} />}
                  </button>
                </div>

                {showSkillForm && (
                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#1A2A4F]/20 rounded-lg focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent text-[#1A2A4F] text-sm"
                      placeholder="Add a new skill"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1A2A4F] text-white font-medium rounded-lg hover:bg-[#2A3A5F] transition-all duration-200"
                    >
                      Add
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {user.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="group relative px-4 py-2 rounded-lg bg-gradient-to-br from-[#1A2A4F]/5 to-[#1A2A4F]/10 border border-[#1A2A4F]/10 hover:border-[#1A2A4F]/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-[#1A2A4F] truncate">
                          {skill.name}
                        </span>
                        <button
                          onClick={() => handleDeleteSkill(skill.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#1A2A4F] hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1A2A4F] flex items-center gap-2">
                    <Award size={24} />
                    Certifications
                  </h2>
                  <button
                    onClick={() => setShowCertForm(!showCertForm)}
                    disabled={user.certifications?.length >= 2}
                    className="p-2 rounded-lg bg-[#1A2A4F] text-white hover:bg-[#2A3A5F] transition-all duration-200 disabled:opacity-50"
                  >
                    {showCertForm ? <X size={18} /> : <Plus size={18} />}
                  </button>
                </div>

                {showCertForm && (
                  <form onSubmit={handleAddCertification} className="space-y-2">
                    <input
                      type="text"
                      value={certForm.name}
                      onChange={(e) =>
                        setCertForm({ ...certForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-[#1A2A4F]/20 rounded-lg focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent text-[#1A2A4F] text-sm"
                      placeholder="Certification name"
                      required
                    />
                    <input
                      type="text"
                      value={certForm.issuer}
                      onChange={(e) =>
                        setCertForm({ ...certForm, issuer: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-[#1A2A4F]/20 rounded-lg focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent text-[#1A2A4F] text-sm"
                      placeholder="Issuing organization"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-[#1A2A4F] text-white font-medium rounded-lg hover:bg-[#2A3A5F] transition-all duration-200"
                    >
                      Add Certification
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.certifications?.map((cert, idx) => (
                    <div
                      key={idx}
                      className="group p-4 rounded-lg bg-gradient-to-br from-[#1A2A4F]/5 to-[#1A2A4F]/10 border border-[#1A2A4F]/10 hover:border-[#1A2A4F]/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#1A2A4F] text-sm truncate">
                            {cert.name}
                          </h4>
                          <p className="text-xs text-[#1A2A4F]/60 truncate">
                            {cert.issuer}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCertification(cert.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#1A2A4F] hover:text-red-600 flex-shrink-0"
                        >
                          <Trash2 size={14} />
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

      {/* Share Modal */}
      {showShareCard && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowShareCard(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#1A2A4F] to-[#2A3A5F] p-6 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Share Profile</h3>
              <button
                onClick={() => setShowShareCard(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-[#1A2A4F]/10 to-[#1A2A4F]/5 rounded-xl p-6 mb-6 border border-[#1A2A4F]/20">
                <div className="flex items-center gap-4 mb-4">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F] flex items-center justify-center text-white text-xl font-bold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[#1A2A4F]">
                      {user.fullName}
                    </h4>
                    <p className="text-sm text-[#1A2A4F]/70">{user.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Orders", value: user.totalGigs || 0 },
                    { label: "Rating", value: averageRating },
                    {
                      label: "Complete",
                      value: `${user.completionRate || 0}%`,
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="text-center p-2 bg-white rounded-lg"
                    >
                      <div className="text-lg font-bold text-[#1A2A4F]">
                        {stat.value}
                      </div>
                      <div className="text-xs text-[#1A2A4F]/60">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={downloadProfileCard}
                className="w-full px-6 py-3 bg-[#1A2A4F] text-white font-medium rounded-lg hover:bg-[#2A3A5F] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                Download Profile Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Button in Corner */}
      <button
        onClick={handleShareProfile}
        className="fixed bottom-8 right-8 p-4 bg-[#1A2A4F] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:bg-[#2A3A5F]"
        title="Share your profile"
      >
        <Share2 size={24} />
      </button>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;
