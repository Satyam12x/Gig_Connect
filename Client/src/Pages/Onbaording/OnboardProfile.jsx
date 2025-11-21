import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User,
  Briefcase,
  Award,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  X,
  Sparkles, // Replaces Welcome
  Target, // Replaces "What brings you here?"
  Camera, // Replaces camera
  GraduationCap, // Replaces college
  Code2, // Replaces GitHub
  Linkedin,
  Instagram,
  Link2, // Replaces social links
  Trophy, // Replaces "Stand Out"
  Shield, // Replaces "Secure"
  Zap, // Replaces "Quick Setup"
  Stars, // Replaces "almost done"
} from "lucide-react";

import useDocumentTitle from "../../hooks/useDocumentTitle"; // Add this!

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const COLORS = {
  navy: "#1A2A4F",
  navyLight: "#2A3A6F",
  navyDark: "#0F1729",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray600: "#4B5563",
};

export default function OnboardProfile() {
  useDocumentTitle("Complete Your Profile");

  const [currentStep, setCurrentStep] = useState(0);
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
  const [direction, setDirection] = useState("forward");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const steps = [
    { id: "welcome", title: "Welcome", icon: Sparkles },
    { id: "role", title: "Your Role", icon: Target },
    { id: "profile", title: "Profile", icon: User },
    { id: "skills", title: "Skills & Bio", icon: Trophy },
    { id: "social", title: "Connect", icon: Link2 },
  ];

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
            skills:
              user.user.skills
                ?.map((s) => (typeof s === "string" ? s : s.name))
                .join(", ") || "",
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setData((p) => ({
        ...p,
        image: file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  const removeImage = () => {
    setData((p) => ({ ...p, image: null, preview: "" }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection("forward");
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection("backward");
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
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
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <RoleStep data={data} setData={setData} />;
      case 2:
        return (
          <ProfileStep
            data={data}
            setData={setData}
            handleImage={handleImage}
            removeImage={removeImage}
          />
        );
      case 3:
        return <SkillsStep data={data} setData={setData} />;
      case 4:
        return <SocialStep data={data} setData={setData} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${COLORS.gray50} 0%, ${COLORS.white} 50%, ${COLORS.gray50} 100%)`,
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .step-content {
          animation: ${
            direction === "forward" ? "slideInRight" : "slideInLeft"
          } 0.5s ease-out;
        }
        .progress-bar {
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(26, 42, 79, 0.15);
        }
      `}</style>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${COLORS.navyLight}, ${COLORS.navy})`,
          }}
        />
        <div
          className="absolute bottom-20 -left-32 w-80 h-80 opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${COLORS.navyLight}, transparent)`,
          }}
        />
      </div>

      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl relative z-10"
        style={{
          border: `2px solid ${COLORS.gray100}`,
          animation: "fadeInScale 0.6s ease-out",
        }}
      >
        {/* Step Content */}
        <div className="p-8 sm:p-12 min-h-[500px] flex flex-col">
          <div className="step-content flex-1">{renderStep()}</div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all hover-lift"
                style={{
                  border: `2px solid ${COLORS.navy}`,
                  color: COLORS.navy,
                  backgroundColor: COLORS.white,
                }}
              >
                <ArrowLeft size={20} /> Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold transition-all hover-lift"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
                  boxShadow: "0 4px 12px rgba(26, 42, 79, 0.3)",
                }}
              >
                Continue <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold transition-all hover-lift disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? COLORS.gray600
                    : `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
                  boxShadow: "0 4px 12px rgba(26, 42, 79, 0.3)",
                }}
              >
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    Complete Setup <Check size={20} />
                  </>
                )}
              </button>
            )}
          </div>

          {currentStep < steps.length - 1 && (
            <button
              onClick={() => navigate("/home")}
              className="mt-4 text-center py-2 text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: COLORS.gray600 }}
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div
        className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
        style={{ backgroundColor: `${COLORS.navyLight}20` }}
      >
        <Sparkles size={56} style={{ color: COLORS.navy }} />
      </div>
      <h2 className="text-4xl font-bold" style={{ color: COLORS.navy }}>
        Welcome to Gig Connect!
      </h2>
      <p className="text-xl" style={{ color: COLORS.gray600 }}>
        Let's set up your profile in just a few steps
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {[
          { icon: Zap, title: "Quick Setup", desc: "Just 2-3 minutes" },
          { icon: Shield, title: "Secure", desc: "Your data is safe" },
          { icon: Trophy, title: "Stand Out", desc: "Show your skills" },
        ].map((feature, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl hover-lift"
            style={{ border: `2px solid ${COLORS.gray100}` }}
          >
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.navyLight}20` }}
            >
              <feature.icon size={32} style={{ color: COLORS.navy }} />
            </div>
            <h3 className="font-bold mb-2" style={{ color: COLORS.navy }}>
              {feature.title}
            </h3>
            <p className="text-sm" style={{ color: COLORS.gray600 }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleStep({ data, setData }) {
  const roles = [
    {
      value: "Seller",
      title: "Freelance",
      desc: "Offer your skills and earn money",
      icon: Briefcase,
    },
    {
      value: "Buyer",
      title: "Hire Talent",
      desc: "Find skilled freelancers for your projects",
      icon: Target,
    },
    {
      value: "Both",
      title: "Both",
      desc: "Freelance and hire others",
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3" style={{ color: COLORS.navy }}>
          What brings you here?
        </h2>
        <p className="text-lg" style={{ color: COLORS.gray600 }}>
          Choose how you want to use Gig Connect
        </p>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <label
            key={role.value}
            className={`flex items-center p-6 rounded-2xl cursor-pointer transition-all hover-lift ${
              data.role === role.value ? "ring-2 ring-offset-2" : ""
            }`}
            style={{
              border: `2px solid ${
                data.role === role.value ? COLORS.navy : COLORS.gray200
              }`,
              backgroundColor:
                data.role === role.value ? `${COLORS.navy}10` : COLORS.white,
              ringColor: COLORS.navyLight,
            }}
          >
            <input
              type="radio"
              name="role"
              value={role.value}
              checked={data.role === role.value}
              onChange={(e) => setData({ ...data, role: e.target.value })}
              className="sr-only"
            />
            <div className="flex-1 flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.navyLight}20` }}
              >
                <role.icon size={32} style={{ color: COLORS.navy }} />
              </div>
              <div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ color: COLORS.navy }}
                >
                  {role.title}
                </h3>
                <p className="text-sm" style={{ color: COLORS.gray600 }}>
                  {role.desc}
                </p>
              </div>
            </div>
            {data.role === role.value && (
              <Check size={28} style={{ color: COLORS.navy }} />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

function ProfileStep({ data, setData, handleImage, removeImage }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3" style={{ color: COLORS.navy }}>
          Add Your Profile Picture
        </h2>
        <p className="text-lg" style={{ color: COLORS.gray600 }}>
          Help others recognize you (optional)
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          {data.preview ? (
            <>
              <img
                src={data.preview}
                alt="Profile preview"
                className="w-40 h-40 rounded-full object-cover border-4 shadow-xl"
                style={{ borderColor: COLORS.navyLight }}
              />
              <button
                onClick={removeImage}
                className="absolute top-0 right-0 w-10 h-10 rounded-full flex items-center justify-center bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <div
              className="w-40 h-40 rounded-full flex items-center justify-center border-4 border-dashed"
              style={{
                borderColor: COLORS.gray300,
                backgroundColor: COLORS.gray50,
              }}
            >
              <Camera size={56} style={{ color: COLORS.gray400 }} />
            </div>
          )}
        </div>

        <label className="cursor-pointer">
          <div
            className="px-8 py-4 rounded-xl font-semibold text-white transition-all hover-lift flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyLight})`,
            }}
          >
            <Upload size={20} />
            {data.preview ? "Change Photo" : "Upload Photo"}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />
        </label>
        <p className="text-sm" style={{ color: COLORS.gray600 }}>
          JPG, PNG up to 5MB
        </p>
      </div>

      <div className="mt-8">
        <label
          className="block text-sm font-semibold mb-2 flex items-center gap-2"
          style={{ color: COLORS.navy }}
        >
          <GraduationCap size={20} /> College / University (optional)
        </label>
        <input
          placeholder="e.g. Stanford University, Self-Taught"
          value={data.college}
          onChange={(e) => setData({ ...data, college: e.target.value })}
          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all"
          style={{ borderColor: COLORS.gray200 }}
          onFocus={(e) => (e.target.style.borderColor = COLORS.navyLight)}
          onBlur={(e) => (e.target.style.borderColor = COLORS.gray200)}
        />
      </div>
    </div>
  );
}

function SkillsStep({ data, setData }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3" style={{ color: COLORS.navy }}>
          Showcase Your Skills
        </h2>
        <p className="text-lg" style={{ color: COLORS.gray600 }}>
          Tell us what you're good at
        </p>
      </div>

      <div>
        <label
          className="block text-sm font-semibold mb-2"
          style={{ color: COLORS.navy }}
        >
          Skills (comma-separated)
        </label>
        <input
          placeholder="e.g. React, Node.js, UI/UX Design, Python"
          value={data.skills}
          onChange={(e) => setData({ ...data, skills: e.target.value })}
          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all"
          style={{ borderColor: COLORS.gray200 }}
          onFocus={(e) => (e.target.style.borderColor = COLORS.navyLight)}
          onBlur={(e) => (e.target.style.borderColor = COLORS.gray200)}
        />
      </div>

      <div>
        <label
          className="block text-sm font-semibold mb-2"
          style={{ color: COLORS.navy }}
        >
          Short Bio (optional)
        </label>
        <textarea
          rows="5"
          maxLength="500"
          placeholder="Tell us about yourself, your experience, and what makes you unique..."
          value={data.bio}
          onChange={(e) => setData({ ...data, bio: e.target.value })}
          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all resize-none"
          style={{ borderColor: COLORS.gray200 }}
          onFocus={(e) => (e.target.style.borderColor = COLORS.navyLight)}
          onBlur={(e) => (e.target.style.borderColor = COLORS.gray200)}
        />
        <p
          className="text-xs text-right mt-1"
          style={{ color: COLORS.gray600 }}
        >
          {data.bio.length}/500
        </p>
      </div>
    </div>
  );
}

function SocialStep({ data, setData }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3" style={{ color: COLORS.navy }}>
          Connect Your Socials
        </h2>
        <p className="text-lg" style={{ color: COLORS.gray600 }}>
          Help others find you online (optional)
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label
            className="block text-sm font-semibold mb-2 flex items-center gap-2"
            style={{ color: COLORS.navy }}
          >
            <Linkedin size={20} /> LinkedIn Profile
          </label>
          <input
            placeholder="https://linkedin.com/in/yourprofile"
            value={data.socialLinks.linkedin}
            onChange={(e) =>
              setData({
                ...data,
                socialLinks: { ...data.socialLinks, linkedin: e.target.value },
              })
            }
            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all"
            style={{ borderColor: COLORS.gray200 }}
            onFocus={(e) => (e.target.style.borderColor = COLORS.navyLight)}
            onBlur={(e) => (e.target.style.borderColor = COLORS.gray200)}
          />
        </div>

        <div>
          <label
            className="block text-sm font-semibold mb-2 flex items-center gap-2"
            style={{ color: COLORS.navy }}
          >
            <Code2 size={20} /> GitHub Profile
          </label>
          <input
            placeholder="https://github.com/yourusername"
            value={data.socialLinks.github}
            onChange={(e) =>
              setData({
                ...data,
                socialLinks: { ...data.socialLinks, github: e.target.value },
              })
            }
            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all"
            style={{ borderColor: COLORS.gray200 }}
            onFocus={(e) => (e.target.style.borderColor = COLORS.navyLight)}
            onBlur={(e) => (e.target.style.borderColor = COLORS.gray200)}
          />
        </div>

        <div>
          <label
            className="block text-sm font-semibold mb-2 flex items-center gap-2"
            style={{ color: COLORS.navy }}
          >
            <Instagram size={20} /> Instagram Profile
          </label>
          <input
            placeholder="https://instagram.com/yourusername"
            value={data.socialLinks.instagram}
            onChange={(e) =>
              setData({
                ...data,
                socialLinks: { ...data.socialLinks, instagram: e.target.value },
              })
            }
            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all"
            style={{ borderColor: COLORS.gray200 }}
            onFocus={(e) => (e.target.style.borderColor = COLORS.navyLight)}
            onBlur={(e) => (e.target.style.borderColor = COLORS.gray200)}
          />
        </div>
      </div>

      <div
        className="mt-8 p-6 rounded-2xl text-center"
        style={{
          backgroundColor: `${COLORS.navyLight}10`,
          border: `2px solid ${COLORS.navyLight}30`,
        }}
      >
        <Stars
          size={36}
          className="mx-auto mb-3"
          style={{ color: COLORS.navy }}
        />
        <p className="font-medium" style={{ color: COLORS.navy }}>
          You're almost done! Click "Complete Setup" to finish.
        </p>
      </div>
    </div>
  );
}
