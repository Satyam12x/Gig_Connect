import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User,
  Briefcase,
  Link as LinkIcon,
  Star,
  CheckCircle,
  Linkedin,
  Github,
  Instagram,
  Trophy,
  Award,
  ArrowLeft,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const API_BASE = import.meta.env.VITE_API_BASE || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id || id === "undefined" || id === "[object Object]") {
        toast.error("Invalid user profile link");
        navigate("/gigs");
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/users/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setUser(res.data);
        setLoading(false);
      } catch (err) {
        const message =
          err.response?.status === 404
            ? "User not found"
            : err.response?.data?.error || "Failed to load profile";
        setError(message);
        toast.error(message);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-2xl font-semibold text-[#1A2A4F]">
            Loading profile...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#1A2A4F] mb-4">
              Profile Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              {error || "This user does not exist."}
            </p>
            <button
              onClick={() => navigate("/gigs")}
              className="px-8 py-4 bg-[#1A2A4F] text-white rounded-xl font-bold hover:bg-[#2A3A5F] transition-all flex items-center gap-3 mx-auto"
            >
              <ArrowLeft size={20} /> Back to Gigs
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const averageRating = user.reviewsReceived?.length
    ? (
        user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
        user.reviewsReceived.length
      ).toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />

      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            <div className="relative">
              <div className="w-48 h-48 rounded-3xl overflow-hidden ring-8 ring-white shadow-2xl">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F] flex items-center justify-center text-white text-8xl font-bold">
                    {user.fullName[0].toUpperCase()}
                  </div>
                )}
              </div>
              {user.isVerified && (
                <CheckCircle className="absolute -bottom-3 -right-3 w-12 h-12 text-white bg-[#1A2A4F] rounded-full p-2 shadow-lg" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6 text-center md:text-left">
            <div>
              <h1 className="text-5xl font-bold text-[#1A2A4F] flex items-center gap-4 justify-center md:justify-start">
                {user.fullName}
                {user.isVerified && (
                  <CheckCircle size={36} className="text-[#1A2A4F]" />
                )}
              </h1>
              <p className="text-2xl font-medium text-[#1A2A4F]/80 mt-3">
                {user.role === "Both" ? "Provider & Freelancer" : user.role}
              </p>
              {user.college && (
                <div className="inline-block mt-5 px-6 py-3 bg-[#1A2A4F]/10 text-[#1A2A4F] rounded-full text-lg font-semibold">
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
                  className="w-14 h-14 rounded-2xl bg-[#1A2A4F]/10 hover:bg-[#1A2A4F] text-[#1A2A4F] hover:text-white flex items-center justify-center transition-all"
                >
                  <Linkedin size={26} />
                </a>
              )}
              {user.socialLinks?.github && (
                <a
                  href={user.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-[#1A2A4F]/10 hover:bg-[#1A2A4F] text-[#1A2A4F] hover:text-white flex items-center justify-center transition-all"
                >
                  <Github size={26} />
                </a>
              )}
              {user.socialLinks?.instagram && (
                <a
                  href={user.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-[#1A2A4F]/10 hover:bg-[#1A2A4F] text-[#1A2A4F] hover:text-white flex items-center justify-center transition-all"
                >
                  <Instagram size={26} />
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-8 rounded-3xl bg-white shadow-xl border border-[#1A2A4F]/10">
              <div className="text-5xl font-bold text-[#1A2A4F]">
                {averageRating}
              </div>
              <div className="flex items-center justify-center gap-3 mt-4 text-[#1A2A4F]/80">
                <Star size={24} className="fill-[#1A2A4F] text-[#1A2A4F]" />
                <span className="text-lg font-medium">Rating</span>
              </div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white shadow-xl border border-[#1A2A4F]/10">
              <div className="text-5xl font-bold text-[#1A2A4F]">
                {user.gigsCompleted || 0}
              </div>
              <div className="flex items-center justify-center gap-3 mt-4 text-[#1A2A4F]/80">
                <Briefcase size={24} />
                <span className="text-lg font-medium">Completed</span>
              </div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white shadow-xl border border-[#1A2A4F]/10">
              <div className="text-5xl font-bold text-[#1A2A4F]">
                {user.reviewsReceived?.length || 0}
              </div>
              <div className="flex items-center justify-center gap-3 mt-4 text-[#1A2A4F]/80">
                <Trophy size={24} />
                <span className="text-lg font-medium">Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-[#1A2A4F]/10">
            <h2 className="text-3xl font-bold text-[#1A2A4F] mb-8 flex items-center gap-4">
              Skills
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {user.skills?.length > 0 ? (
                user.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-5 rounded-2xl bg-gradient-to-br from-[#1A2A4F]/5 to-[#1A2A4F]/10 border border-[#1A2A4F]/20 hover:border-[#1A2A4F]/40 transition-all"
                  >
                    <span className="text-lg font-semibold text-[#1A2A4F]">
                      {skill.name}
                    </span>
                    {skill.endorsements > 0 && (
                      <p className="text-sm text-[#1A2A4F]/70 mt-1">
                        {skill.endorsements} endorsements
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-8">
                  No skills listed yet.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-[#1A2A4F]/10">
            <h2 className="text-3xl font-bold text-[#1A2A4F] mb-8 flex items-center gap-4">
              <Award size={36} /> Certifications
            </h2>
            <div className="space-y-6">
              {user.certifications?.length > 0 ? (
                user.certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="p-6 rounded-2xl bg-gradient-to-br from-[#1A2A4F]/5 to-[#1A2A4F]/10 border border-[#1A2A4F]/20 hover:border-[#1A2A4F]/40 transition-all"
                  >
                    <h4 className="text-xl font-bold text-[#1A2A4F]">
                      {cert.name}
                    </h4>
                    <p className="text-[#1A2A4F]/80 mt-2">{cert.issuer}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No certifications added yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/gigs")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A2A4F] text-white text-xl font-bold rounded-2xl hover:bg-[#2A3A5F] transition-all"
          >
            <ArrowLeft size={28} /> Back to Gigs
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
