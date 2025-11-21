import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function OnboardProfile() {
  useDocumentTitle("Complete Your Profile");

  const [data, setData] = useState({
    role: "Both",
    image: null,
    preview: "",
    skills: "",
    bio: "",
    college: "",
    socialLinks: { linkedin: "", github: "", instagram: "" },
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: user } = await axios.get(`${API}/auth/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (user.authenticated && user.user) {
          setData((p) => ({
            ...p,
            role: user.user.role || "Both",
            preview: user.user.profilePicture || "",
            bio: user.user.bio || "",
            college: user.user.college || "",
            skills: user.user.skills?.join(", ") || "",
            socialLinks: {
              linkedin: user.user.socialLinks?.linkedin || "",
              github: user.user.socialLinks?.github || "",
              instagram: user.user.socialLinks?.instagram || "",
            },
          }));
        }
      } catch (err) {
        console.log("Could not pre-fill profile:", err);
      }
    };
    if (token) fetchUser();
  }, [token]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData((p) => ({
        ...p,
        image: file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSaveAndContinue = async () => {
    setLoading(true);
    const form = new FormData();
    if (data.role) form.append("role", data.role);
    if (data.image) form.append("image", data.image);
    if (data.bio) form.append("bio", data.bio);
    if (data.college) form.append("college", data.college);
    if (data.skills) {
      const skillsArr = data.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (skillsArr.length > 0)
        form.append("skills", JSON.stringify(skillsArr));
    }

    const social = Object.fromEntries(
      Object.entries(data.socialLinks).filter(([, v]) => v.trim())
    );
    if (Object.keys(social).length > 0) {
      form.append("socialLinks", JSON.stringify(social));
    }

    try {
      await axios.post(`${API}/users/onboard`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile completed successfully!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold" style={{ color: "#1A2A4F" }}>
            Welcome to Gig Connect!
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Let's set up your profile in 60 seconds
          </p>
        </div>

        <div className="space-y-8">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              I want to:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["Seller", "Buyer", "Both"].map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    data.role === r
                      ? "border-[#1A2A4F] bg-blue-50"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={data.role === r}
                    onChange={(e) => setData({ ...data, role: e.target.value })}
                    className="sr-only"
                  />
                  <span className="font-medium">
                    {r === "Both"
                      ? "Both (Freelance & Hire)"
                      : r === "Seller"
                      ? "Freelance (Sell Gigs)"
                      : "Hire Talent"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              <div className="shrink-0">
                {data.preview ? (
                  <img
                    src={data.preview}
                    alt="Profile preview"
                    className="w-28 h-28 rounded-full object-cover border-4 border-slate-200 shadow-md"
                  />
                ) : (
                  <div className="w-28 h-28 bg-slate-200 border-4 border-dashed border-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-slate-400">Photo</span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:bg-[#1A2A4F] file:text-white hover:file:bg-[#0F1729] cursor-pointer"
                />
                <p className="text-xs text-slate-500 mt-2">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Skills (comma-separated)
            </label>
            <input
              placeholder="e.g. React, Node.js, UI/UX Design, Python"
              value={data.skills}
              onChange={(e) => setData({ ...data, skills: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent transition"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Short Bio (optional)
            </label>
            <textarea
              rows="4"
              maxLength="500"
              placeholder="Tell us about yourself in a few words..."
              value={data.bio}
              onChange={(e) => setData({ ...data, bio: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent transition resize-none"
            />
            <p className="text-xs text-slate-500 mt-1 text-right">
              {data.bio.length}/500
            </p>
          </div>

          {/* College (optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              College / University (optional)
            </label>
            <input
              placeholder="e.g. Stanford University, Self-Taught"
              value={data.college}
              onChange={(e) => setData({ ...data, college: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent transition"
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              Social Links (optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                placeholder="LinkedIn URL"
                value={data.socialLinks.linkedin}
                onChange={(e) =>
                  setData({
                    ...data,
                    socialLinks: {
                      ...data.socialLinks,
                      linkedin: e.target.value,
                    },
                  })
                }
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent transition"
              />
              <input
                placeholder="GitHub URL"
                value={data.socialLinks.github}
                onChange={(e) =>
                  setData({
                    ...data,
                    socialLinks: {
                      ...data.socialLinks,
                      github: e.target.value,
                    },
                  })
                }
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent transition"
              />
              <input
                placeholder="Instagram URL"
                value={data.socialLinks.instagram}
                onChange={(e) =>
                  setData({
                    ...data,
                    socialLinks: {
                      ...data.socialLinks,
                      instagram: e.target.value,
                    },
                  })
                }
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A4F] focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSaveAndContinue}
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-[#1A2A4F] to-[#0F1729] text-white font-semibold rounded-xl hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? <>Saving Profile...</> : <>Save & Continue</>}
            </button>
            <button
              onClick={() => navigate("/home")}
              className="flex-1 py-4 border-2 border-[#1A2A4F] text-[#1A2A4F] font-semibold rounded-xl hover:bg-[#1A2A4F] hover:text-white transition-all"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
