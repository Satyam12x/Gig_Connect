// src/pages/auth/OnboardProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function OnboardProfile() {
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
        if (user.authenticated) {
          setData((p) => ({
            ...p,
            role: user.user.role || "Both",
            preview: user.user.profilePicture || "",
          }));
        }
      } catch {}
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
      const arr = data.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) form.append("skills", JSON.stringify(arr));
    }
    const social = Object.fromEntries(
      Object.entries(data.socialLinks).filter(([, v]) => v)
    );
    if (Object.keys(social).length) {
      form.append("socialLinks", JSON.stringify(social));
    }

    try {
      await axios.post(`${API}/users/onboard`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile saved!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 border border-blue-100">
        <h2
          className="text-3xl font-bold text-center text-navyBlue"
          style={{ color: "#1A2A4F" }}
        >
          Complete Your Profile
        </h2>

        <div className="mt-8 space-y-6">
          <div>
            <label className="block font-medium">I want to:</label>
            <div className="flex gap-6 mt-2">
              {["Seller", "Buyer", "Both"].map((r) => (
                <label key={r} className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={data.role === r}
                    onChange={(e) => setData({ ...data, role: e.target.value })}
                    className="mr-2"
                  />
                  <span>{r === "Both" ? "Both (Sell & Buy)" : r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium">Profile Picture</label>
            <div className="flex items-center gap-4 mt-2">
              {data.preview ? (
                <img
                  src={data.preview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 border-2 border-dashed rounded-full" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="text-sm"
              />
            </div>
          </div>

          <input
            placeholder="Skills (comma-separated)"
            value={data.skills}
            onChange={(e) => setData({ ...data, skills: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            placeholder="College / University (optional)"
            value={data.college}
            onChange={(e) => setData({ ...data, college: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <textarea
            rows="4"
            maxLength="500"
            placeholder="Short bio..."
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="LinkedIn"
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
              className="px-3 py-2 border rounded-lg"
            />
            <input
              placeholder="GitHub"
              value={data.socialLinks.github}
              onChange={(e) =>
                setData({
                  ...data,
                  socialLinks: { ...data.socialLinks, github: e.target.value },
                })
              }
              className="px-3 py-2 border rounded-lg"
            />
            <input
              placeholder="Instagram"
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
              className="px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={handleSaveAndContinue}
              className="flex-1 py-3 bg-navyBlue text-white rounded-lg"
              style={{ backgroundColor: "#1A2A4F" }}
            >
              {loading ? "Saving…" : "Save & Continue"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="flex-1 py-3 border border-navyBlue text-navyBlue rounded-lg bg-white"
              style={{ color: "#1A2A4F", borderColor: "#1A2A4F" }}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
