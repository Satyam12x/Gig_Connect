import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Upload,
  Sparkles,
  Bot,
  Check,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Progress Step Component
const ProgressStep = ({ step, activeStep, title }) => (
  <div className="flex items-center gap-3">
    <div
      className={`w-8 h-8 rounded-full font-semibold text-sm flex items-center justify-center transition-all ${
        activeStep >= step
          ? "bg-[#1A2A4F] text-white"
          : "bg-gray-200 text-gray-600"
      }`}
    >
      {activeStep > step ? <Check className="w-4 h-4" /> : step}
    </div>
    <span
      className={`text-sm font-medium hidden sm:block transition-colors ${
        activeStep >= step ? "text-[#1A2A4F]" : "text-gray-400"
      }`}
    >
      {title}
    </span>
  </div>
);

// Input Field Component
const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  error = null,
  helperText = null,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2A4F]">
      <span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 text-base text-[#1A2A4F] border-2 rounded-lg transition-all duration-200 focus:outline-none ${
          error
            ? "border-red-500 focus:border-red-500 bg-red-50"
            : "border-gray-300 focus:border-[#1A2A4F] focus:ring-2 focus:ring-[#1A2A4F]/10"
        } placeholder-gray-400`}
      />
      {error && (
        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
      )}
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
    {helperText && !error && (
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> {helperText}
      </p>
    )}
  </div>
);

const CreateGig = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail must be less than 5MB");
      return;
    }
    if (file && !file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error("Only JPEG and PNG images are allowed");
      return;
    }
    setThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Title is required";
      } else if (formData.title.length < 5 || formData.title.length > 100) {
        newErrors.title = "Title must be between 5 and 100 characters";
      }
      if (!formData.category) {
        newErrors.category = "Category is required";
      }
    }

    if (step === 2) {
      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      } else if (formData.description.length < 20) {
        newErrors.description = "Description must be at least 20 characters";
      } else if (formData.description.length > 1000) {
        newErrors.description = "Description must be less than 1000 characters";
      }
    }

    if (step === 3) {
      if (!formData.price) {
        newErrors.price = "Price is required";
      } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
        newErrors.price = "Please enter a valid price greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fix the errors before continuing");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title before generating a description");
      return;
    }
    setAiLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to use AI features");
        return;
      }

      const prompt = `Generate a detailed, professional gig description for: "${formData.title}". Include what the service offers, deliverables, process, and why buyers should choose this gig. Keep it under 1000 characters and make it compelling.`;

      const response = await axios.post(
        `${API_BASE}/ai/chat`,
        { message: prompt },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.response) {
        setFormData({ ...formData, description: response.data.response });
        toast.success("Description generated successfully!");
      } else {
        toast.error("Failed to generate description");
      }
    } catch (err) {
      console.error("AI generation error:", err);
      toast.error(
        err.response?.data?.error || "Failed to generate description"
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error("Please fill in all required fields correctly");
      setCurrentStep(1);
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title.trim());
    data.append("description", formData.description.trim());
    data.append("category", formData.category);
    data.append("price", formData.price);
    if (thumbnail) {
      data.append("thumbnail", thumbnail);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to create a gig");
        navigate("/login");
        return;
      }

      const response = await axios.post(`${API_BASE}/gigs`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Gig created successfully!");
        setTimeout(() => {
          navigate("/gigs");
        }, 1500);
      }
    } catch (err) {
      console.error("Error creating gig:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        "Failed to create gig";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#1A2A4F]/5 to-transparent p-4 rounded-lg border border-[#1A2A4F]/10">
              <h3 className="font-semibold text-[#1A2A4F] text-sm mb-2">
                💡 Pro Tip
              </h3>
              <p className="text-xs text-gray-600">
                Use clear, descriptive titles that help buyers understand
                exactly what you're offering
              </p>
            </div>

            <InputField
              label="Gig Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., I will create a stunning website design"
              required
              error={errors.title}
              helperText="Be specific and clear about what you offer"
            />

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2A4F]">
                <span>
                  Category
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 text-base text-[#1A2A4F] border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                  errors.category
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-[#1A2A4F] focus:ring-2 focus:ring-[#1A2A4F]/10"
                } bg-white`}
              >
                <option value="">Select a category...</option>
                <option value="Web Development">Web Development</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Tutoring">Tutoring</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Writing">Writing</option>
                <option value="Video Editing">Video Editing</option>
                <option value="Photography">Photography</option>
                <option value="Music & Audio">Music & Audio</option>
                <option value="Programming">Programming</option>
                <option value="Business">Business</option>
              </select>
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#1A2A4F]/5 to-transparent p-4 rounded-lg border border-[#1A2A4F]/10">
              <h3 className="font-semibold text-[#1A2A4F] text-sm mb-2">
                📝 Description Guide
              </h3>
              <p className="text-xs text-gray-600">
                Include deliverables, timeline, process, and any other relevant
                information
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#1A2A4F]">
                <span>
                  Description
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 text-base text-[#1A2A4F] border-2 rounded-lg transition-all duration-200 focus:outline-none resize-none ${
                    errors.description
                      ? "border-red-500 focus:border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-[#1A2A4F] focus:ring-2 focus:ring-[#1A2A4F]/10"
                  } placeholder-gray-400`}
                  rows="8"
                  placeholder="Describe your service in detail..."
                  maxLength={1000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {formData.description.length}/1000
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={aiLoading || !formData.title.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1A2A4F] to-[#2d3d63] text-white font-medium text-sm rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    Generate with AI
                  </>
                )}
              </button>

              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#1A2A4F]/5 to-transparent p-4 rounded-lg border border-[#1A2A4F]/10">
              <h3 className="font-semibold text-[#1A2A4F] text-sm mb-2">
                💰 Pricing Strategy
              </h3>
              <p className="text-xs text-gray-600">
                Set competitive pricing based on your expertise and market rates
              </p>
            </div>

            <InputField
              label="Starting Price (₹)"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="500"
              type="number"
              required
              error={errors.price}
              helperText="Enter the base price for your service in Indian Rupees"
            />

            {formData.price && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Estimated Earnings
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{Number(formData.price).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  This will be your base rate. You can negotiate final pricing
                  with clients.
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#1A2A4F]/5 to-transparent p-4 rounded-lg border border-[#1A2A4F]/10">
              <h3 className="font-semibold text-[#1A2A4F] text-sm mb-2">
                🖼️ Gig Thumbnail
              </h3>
              <p className="text-xs text-gray-600">
                High-quality thumbnails get more views. Use clear images that
                represent your service
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1A2A4F]">
                Upload Thumbnail (Optional but Recommended)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="block w-full rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#1A2A4F] transition-all duration-200 group bg-gray-50 hover:bg-gray-100"
              >
                {thumbnailPreview ? (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1A2A4F]/20 group-hover:bg-[#1A2A4F]/40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                        <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                        <p className="text-white font-medium text-sm">
                          Change Thumbnail
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Upload className="w-10 h-10 text-[#1A2A4F] mb-3 group-hover:scale-110 transition-transform duration-200" />
                    <p className="text-[#1A2A4F] font-medium text-sm">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG, JPG or PNG • Max 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1A2A4F]">
              📋 Review Your Gig
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                  Title
                </p>
                <p className="text-[#1A2A4F] font-semibold text-lg">
                  {formData.title}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                    Category
                  </p>
                  <p className="text-[#1A2A4F] font-semibold">
                    {formData.category}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                    Starting Price
                  </p>
                  <p className="text-[#1A2A4F] font-semibold text-lg">
                    ₹{Number(formData.price).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">
                  Description
                </p>
                <p className="text-[#1A2A4F] text-sm leading-relaxed whitespace-pre-wrap">
                  {formData.description}
                </p>
              </div>

              {thumbnailPreview && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">
                    Thumbnail
                  </p>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-transparent p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Everything looks good! Click Publish Gig to go live.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Toaster position="top-right" />
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1A2A4F] via-[#243454] to-[#1A2A4F] pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <button
            onClick={() => navigate("/gigs")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Gigs</span>
          </button>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Create Your Gig
          </h1>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed">
            Share your skills and start earning by creating a professional gig
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto pb-2">
              <ProgressStep
                step={1}
                activeStep={currentStep}
                title="Basic Info"
              />
              <div className="hidden sm:block w-12 h-0.5 bg-gray-300" />
              <ProgressStep
                step={2}
                activeStep={currentStep}
                title="Description"
              />
              <div className="hidden sm:block w-12 h-0.5 bg-gray-300" />
              <ProgressStep step={3} activeStep={currentStep} title="Pricing" />
              <div className="hidden sm:block w-12 h-0.5 bg-gray-300" />
              <ProgressStep
                step={4}
                activeStep={currentStep}
                title="Thumbnail"
              />
              <div className="hidden sm:block w-12 h-0.5 bg-gray-300" />
              <ProgressStep step={5} activeStep={currentStep} title="Review" />
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-[#1A2A4F] font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Previous
                  </button>
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1A2A4F] to-[#2d3d63] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Gig...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Publish Gig
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-[#1A2A4F] mb-3">💡 Need Help?</h3>
            <p className="text-sm text-gray-600 mb-2">
              Create compelling gigs by being specific about deliverables,
              following platform guidelines, and setting fair pricing.
            </p>
            <button
              onClick={() => navigate("/gigs")}
              className="text-sm font-medium text-[#1A2A4F] hover:underline"
            >
              Browse other gigs for inspiration →
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateGig;
