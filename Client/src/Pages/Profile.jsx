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
  Edit2,
  X,
  Check,
  Plus,
  Trash2,
  Share2,
  Camera,
  Briefcase,
  Zap,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
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
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error("Failed to load profile");
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({ ...prev, fullName: nameForm.fullName }));
      setShowNameForm(false);
      toast.success("Name updated successfully!");
    } catch (err) {
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowOtpForm(true);
      toast.success("OTP sent to your new email!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP");
    }
  };

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/users/verify-email-otp`,
        { newEmail: emailForm.newEmail, otp: emailForm.otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({ ...prev, email: emailForm.newEmail }));
      setShowEmailForm(false);
      setShowOtpForm(false);
      setEmailForm({ newEmail: "", otp: "" });
      toast.success("Email updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({
        ...prev,
        skills: [...prev.skills, { name: newSkill }],
      }));
      setNewSkill("");
      setShowSkillForm(false);
      toast.success("Skill added!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add skill");
    }
  };

  const handleDeleteSkill = async (skillName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/users/skills/${skillName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s.name !== skillName),
      }));
      toast.success("Skill removed");
    } catch (err) {
      toast.error("Failed to remove skill");
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
      setUser((prev) => ({
        ...prev,
        certifications: [...(prev.certifications || []), certForm],
      }));
      setCertForm({ name: "", issuer: "" });
      setShowCertForm(false);
      toast.success("Certification added!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add certification");
    }
  };

  const handleDeleteCertification = async (certName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/users/certifications/${certName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) => ({
        ...prev,
        certifications: prev.certifications.filter((c) => c.name !== certName),
      }));
      toast.success("Certification removed");
    } catch (err) {
      toast.error("Failed to remove certification");
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
      const res = await axios.put(
        `${API_BASE}/users/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUser((prev) => ({ ...prev, profilePicture: res.data.profilePicture }));
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleProfilePicUpload({ target: { files: [file] } });
    }
  };

  const handleShareProfile = () => setShowShareCard(true);
  const closeShareCard = () => setShowShareCard(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-2xl font-semibold text-[#1A2A4F]">
          Loading your profile...
        </div>
      </div>
    );
  }

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1
      )
    : "N/A";

  const isProvider = user.role === "Provider" || user.role === "Both";
  const isFreelancer = user.role === "Freelancer" || user.role === "Both";

  const stats = [
    {
      label: isProvider ? "Gigs Posted" : "Gigs Completed",
      value: isProvider ? user.gigsPosted || 0 : user.gigsCompleted || 0,
      icon: Briefcase,
    },
    { label: "Rating", value: averageRating, icon: Star },
    { label: "Reviews", value: reviews.length, icon: Trophy },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {/* Profile Picture */}
            <div className="flex justify-center md:justify-start">
              <div className="relative group">
                <div
                  className={`w-48 h-48 rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white transition-all duration-300 ${
                    isDragging ? "ring-[#1A2A4F] scale-105" : ""
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F] flex items-center justify-center text-white text-8xl font-bold">
                      {user.fullName[0].toUpperCase()}
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    {isUploading ? (
                      <div className="animate-spin h-12 w-12 border-4 border-white rounded-full border-t-transparent" />
                    ) : (
                      <Camera size={40} className="text-white" />
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

            {/* User Info */}
            <div className="space-y-6 text-center md:text-left">
              <div>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <h1 className="text-5xl font-bold text-[#1A2A4F]">
                    {user.fullName}
                  </h1>
                  {user.isVerified && (
                    <CheckCircle size={36} className="text-[#1A2A4F]" />
                  )}
                </div>
                <p className="text-2xl font-medium text-[#1A2A4F]/80 mt-3">
                  {user.role === "Both" ? "Provider & Freelancer" : user.role}
                </p>
                {user.college && (
                  <div className="inline-block mt-5 px-6 py-2 bg-[#1A2A4F]/10 text-[#1A2A4F] rounded-full text-lg font-semibold">
                    {user.college}
                  </div>
                )}
              </div>

              {user.bio && (
                <p className="text-lg text-[#1A2A4F]/80 leading-relaxed max-w-2xl">
                  {user.bio}
                </p>
              )}

              <div className="flex gap-5 justify-center md:justify-start pt-6">
                {user.socialLinks?.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 rounded-2xl bg-[#1A2A4F]/10 hover:bg-[#1A2A4F] text-[#1A2A4F] hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  >
                    <Linkedin size={26} />
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 rounded-2xl bg-[#1A2A4F]/10 hover:bg-[#1A2A4F] text-[#1A2A4F] hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  >
                    <Github size={26} />
                  </a>
                )}
                {user.socialLinks?.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 rounded-2xl bg-[#1A2A4F]/10 hover:bg-[#1A2A4F] text-[#1A2A4F] hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  >
                    <Instagram size={26} />
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center p-8 rounded-3xl bg-white shadow-xl border border-[#1A2A4F]/10"
                >
                  <div className="text-5xl font-bold text-[#1A2A4F]">
                    {stat.value}
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-4 text-[#1A2A4F]/80">
                    <stat.icon size={24} />
                    <span className="text-lg font-medium">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#1A2A4F]/30 to-transparent my-20" />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Performance Card */}
            <div className="space-y-10">
              <div className="bg-white rounded-3xl shadow-2xl p-10 border border-[#1A2A4F]/10">
                <div className="flex items-center gap-5 mb-10">
                  <Trophy size={40} className="text-[#1A2A4F]" />
                  <h2 className="text-3xl font-bold text-[#1A2A4F]">
                    Performance
                  </h2>
                </div>

                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-semibold text-[#1A2A4F]">
                        Average Rating
                      </span>
                      <span className="text-3xl font-bold text-[#1A2A4F]">
                        {averageRating}/5
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={36}
                          className={
                            i < Math.round(averageRating)
                              ? "text-[#1A2A4F] fill-[#1A2A4F]"
                              : "text-[#1A2A4F]/20"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {isFreelancer && user.completionRate !== undefined && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-semibold text-[#1A2A4F]">
                          Completion Rate
                        </span>
                        <span className="text-3xl font-bold text-[#1A2A4F]">
                          {user.completionRate}%
                        </span>
                      </div>
                      <div className="w-full h-6 bg-[#1A2A4F]/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1A2A4F] to-[#2A3A5F] rounded-full transition-all duration-1000"
                          style={{ width: `${user.completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Settings, Skills, Certifications */}
            <div className="lg:col-span-2 space-y-10">
              {/* Account Settings */}
              <div className="bg-white rounded-3xl shadow-2xl p-10 border border-[#1A2A4F]/10">
                <h2 className="text-3xl font-bold text-[#1A2A4F] mb-10 flex items-center gap-4">
                  <User size={36} /> Account Settings
                </h2>

                <div className="space-y-8">
                  {/* Name */}
                  <div className="group rounded-2xl p-6 bg-[#1A2A4F]/5 hover:bg-[#1A2A4F]/10 transition-all border border-[#1A2A4F]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-[#1A2A4F]/10 flex items-center justify-center">
                          <User size={28} className="text-[#1A2A4F]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#1A2A4F]">
                            Full Name
                          </h3>
                          <p className="text-[#1A2A4F]/70">
                            Update your display name
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowNameForm(!showNameForm)}
                        className="p-3 rounded-xl hover:bg-[#1A2A4F]/10 transition-all"
                      >
                        {showNameForm ? <X size={24} /> : <Edit2 size={24} />}
                      </button>
                    </div>
                    {showNameForm && (
                      <form
                        onSubmit={handleNameChange}
                        className="mt-6 space-y-4"
                      >
                        <input
                          type="text"
                          value={nameForm.fullName}
                          onChange={(e) =>
                            setNameForm({ fullName: e.target.value })
                          }
                          className="w-full px-5 py-4 rounded-xl border-2 border-[#1A2A4F]/20 focus:border-[#1A2A4F] focus:outline-none text-lg"
                          placeholder="Enter your full name"
                          required
                        />
                        <button
                          type="submit"
                          className="w-full py-4 bg-[#1A2A4F] text-white font-bold rounded-xl hover:bg-[#2A3A5F] transition-all flex items-center justify-center gap-3"
                        >
                          <Check size={24} /> Save Name
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Email */}
                  <div className="group rounded-2xl p-6 bg-[#1A2A4F]/5 hover:bg-[#1A2A4F]/10 transition-all border border-[#1A2A4F]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-[#1A2A4F]/10 flex items-center justify-center">
                          <Mail size={28} className="text-[#1A2A4F]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#1A2A4F]">
                            Email Address
                          </h3>
                          <p className="text-[#1A2A4F]/70">Change your email</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowEmailForm(!showEmailForm)}
                        className="p-3 rounded-xl hover:bg-[#1A2A4F]/10 transition-all"
                      >
                        {showEmailForm ? <X size={24} /> : <Edit2 size={24} />}
                      </button>
                    </div>
                    {showEmailForm && (
                      <form
                        onSubmit={
                          showOtpForm ? handleEmailVerify : handleEmailRequest
                        }
                        className="mt-6 space-y-4"
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
                          className="w-full px-5 py-4 rounded-xl border-2 border-[#1A2A4F]/20 focus:border-[#1A2A4F] focus:outline-none text-lg disabled:opacity-60"
                          placeholder="New email address"
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
                            className="w-full px-5 py-4 rounded-xl border-2 border-[#1A2A4F]/20 focus:border-[#1A2A4F] focus:outline-none text-lg"
                            placeholder="Enter 6-digit OTP"
                            required
                          />
                        )}
                        <button
                          type="submit"
                          className="w-full py-4 bg-[#1A2A4F] text-white font-bold rounded-xl hover:bg-[#2A3A5F] transition-all flex items-center justify-center gap-3"
                        >
                          <Check size={24} />
                          {showOtpForm ? "Verify OTP" : "Send OTP"}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Password */}
                  <div className="group rounded-2xl p-6 bg-[#1A2A4F]/5 hover:bg-[#1A2A4F]/10 transition-all border border-[#1A2A4F]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-[#1A2A4F]/10 flex items-center justify-center">
                          <Lock size={28} className="text-[#1A2A4F]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#1A2A4F]">
                            Password
                          </h3>
                          <p className="text-[#1A2A4F]/70">
                            Update your password
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="p-3 rounded-xl hover:bg-[#1A2A4F]/10 transition-all"
                      >
                        {showPasswordForm ? (
                          <X size={24} />
                        ) : (
                          <Edit2 size={24} />
                        )}
                      </button>
                    </div>
                    {showPasswordForm && (
                      <form
                        onSubmit={handlePasswordChange}
                        className="mt-6 space-y-4"
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
                          className="w-full px-5 py-4 rounded-xl border-2 border-[#1A2A4F]/20 focus:border-[#1A2A4F] focus:outline-none text-lg"
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
                          className="w-full px-5 py-4 rounded-xl border-2 border-[#1A2A4F]/20 focus:border-[#1A2A4F] focus:outline-none text-lg"
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
                          className="w-full px-5 py-4 rounded-xl border-2 border-[#1A2A4F]/20 focus:border-[#1A2A4F] focus:outline-none text-lg"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="submit"
                          className="w-full py-4 bg-[#1A2A4F] text-white font-bold rounded-xl hover:bg-[#2A3A5F] transition-all flex items-center justify-center gap-3"
                        >
                          <Check size={24} /> Update Password
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-3xl shadow-2xl p-10 border border-[#1A2A4F]/10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-[#1A2A4F] flex items-center gap-4">
                    <Zap size={36} /> Skills
                  </h2>
                  <button
                    onClick={() => setShowSkillForm(!showSkillForm)}
                    className="p-4 rounded-xl bg-[#1A2A4F] text-white hover:bg-[#2A3A5F] transition-all"
                  >
                    {showSkillForm ? <X size={24} /> : <Plus size={28} />}
                  </button>
                </div>

                {showSkillForm && (
                  <form onSubmit={handleAddSkill} className="flex gap-4 mb-8">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 px-6 py-4 rounded-xl border-2 border-[#1A2A4F]/20 focus:border-[#1A2A4F] focus:outline-none text-lg"
                      placeholder="e.g. React, Python, Figma"
                      required
                    />
                    <button
                      type="submit"
                      className="px-8 py-4 bg-[#1A2A4F] text-white font-bold rounded-xl hover:bg-[#2A3A5F] transition-all"
                    >
                      Add Skill
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {user.skills?.map((skill) => (
                    <div
                      key={skill.name}
                      className="group relative p-5 rounded-2xl bg-gradient-to-br from-[#1A2A4F]/5 to-[#1A2A4F]/10 border border-[#1A2A4F]/20 hover:border-[#1A2A4F]/40 transition-all"
                    >
                      <span className="text-lg font-semibold text-[#1A2A4F]">
                        {skill.name}
                      </span>
                      <button
                        onClick={() => handleDeleteSkill(skill.name)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-3xl shadow-2xl p-10 border border-[#1A2A4F]/10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-[#1A2A4F] flex items-center gap-4">
                    <Award size={36} /> Certifications
                  </h2>
                  <button
                    onClick={() => setShowCertForm(!showCertForm)}
                    disabled={user.certifications?.length >= 2}
                    className="p-4 rounded-xl bg-[#1A2A4F] text-white hover:bg-[#2A3A5F] transition-all disabled:opacity-50"
                  >
                    {showCertForm ? <X size={24} /> : <Plus size={28} />}
                  </button>
                </div>

                {showCertForm && (
                  <form
                    onSubmit={handleAddCertification}
                    className="space-y-5 mb-8"
                  >
                    <input
                      type="text"
                      value={certForm.name}
                      onChange={(e) =>
                        setCertForm({ ...certForm, name: e.target.value })
                      }
                      className="w-full px-6 py-4 rounded-xl border-2 border-[#1A2A4F]/20 focus:border-[#1A2A4F] focus:outline-none text-lg"
                      placeholder="Certification Name"
                      required
                    />
                    <input
                      type="text"
                      value={certForm.issuer}
                      onChange={(e) =>
                        setCertForm({ ...certForm, issuer: e.target.value })
                      }
                      className="w-full px-6 py-4 rounded-xl border-2 border-[#1A2A4F]/20 focus:border-[#1A2A4F] focus:outline-none text-lg"
                      placeholder="Issuing Organization"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full py-4 bg-[#1A2A4F] text-white font-bold rounded-xl hover:bg-[#2A3A5F] transition-all"
                    >
                      Add Certification
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {user.certifications?.map((cert) => (
                    <div
                      key={cert.name}
                      className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#1A2A4F]/5 to-[#1A2A4F]/10 border border-[#1A2A4F]/20 hover:border-[#1A2A4F]/40 transition-all"
                    >
                      <h4 className="text-xl font-bold text-[#1A2A4F]">
                        {cert.name}
                      </h4>
                      <p className="text-[#1A2A4F]/80 mt-2">{cert.issuer}</p>
                      <button
                        onClick={() => handleDeleteCertification(cert.name)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Share Button */}
      <button
        onClick={handleShareProfile}
        className="fixed bottom-10 right-10 w-20 h-20 bg-[#1A2A4F] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50"
        title="Share Profile"
      >
        <Share2 size={36} />
      </button>

      {/* Share Modal */}
      {showShareCard && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={closeShareCard}
        >
          <div
            className="bg-white rounded-3xl shadow-3xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#1A2A4F] to-[#2A3A5F] p-8 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">Share Your Profile</h3>
                <button
                  onClick={closeShareCard}
                  className="p-2 hover:bg-white/20 rounded-xl transition"
                >
                  <X size={28} />
                </button>
              </div>
            </div>
            <div className="p-10">
              <div className="bg-gradient-to-br from-[#1A2A4F]/5 to-[#1A2A4F]/10 rounded-2xl p-8 border border-[#1A2A4F]/20">
                <div className="flex items-center gap-6 mb-8">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F] flex items-center justify-center text-white text-5xl font-bold">
                      {user.fullName[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="text-3xl font-bold text-[#1A2A4F]">
                      {user.fullName}
                    </h4>
                    <p className="text-xl text-[#1A2A4F]/80 mt-2">
                      {user.role === "Both"
                        ? "Provider & Freelancer"
                        : user.role}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {stats.map((stat, i) => (
                    <div
                      key={i}
                      className="text-center p-6 bg-white rounded-2xl shadow-lg"
                    >
                      <div className="text-4xl font-bold text-[#1A2A4F]">
                        {stat.value}
                      </div>
                      <div className="text-[#1A2A4F]/70 mt-2">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full mt-8 py-5 bg-[#1A2A4F] text-white text-xl font-bold rounded-2xl hover:bg-[#2A3A5F] transition-all">
                Download Profile Card
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
