import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Upload, Sparkles, Bot } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const CreateGig = () => {
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
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail must be less than 5MB");
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

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title before generating a description");
      return;
    }
    setAiLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/ai/generate-description`,
        { title: formData.title },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFormData({ ...formData, description: response.data.description });
      toast.success("Description generated successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to generate description"
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    if (
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) <= 0
    ) {
      toast.error("Please enter a valid price");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("price", formData.price);
    if (thumbnail) data.append("thumbnail", thumbnail);

    // Debug FormData contents
    for (let [key, value] of data.entries()) {
      console.log(`FormData ${key}:`, value);
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/gigs`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Gig created successfully!");
      navigate("/gigs");
    } catch (err) {
      console.error("Error creating gig:", err.response?.data);
      toast.error(err.response?.data?.error || "Failed to create gig");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans relative overflow-hidden">
      <Toaster position="top-right" />
      <Navbar />

      {/* Main Content */}
      <div className="relative py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-300">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2A4F] mb-6">
              Create Your Gig
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Section */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-base font-semibold text-[#1A2A4F]">
                  <span>Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 text-base text-[#1A2A4F] border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter your gig title..."
                />
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-base font-semibold text-[#1A2A4F]">
                  <span>Description</span>
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base text-[#1A2A4F] border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                    rows="5"
                    placeholder="Describe your service in detail..."
                  ></textarea>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={aiLoading || !formData.title.trim()}
                    className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F] font-medium text-sm rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-[#1A2A4F]"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        Write with AI
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-[#1A2A4F] flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-[#1A2A4F]" />
                  Be specific about deliverables and timeline
                </p>
              </div>

              {/* Category and Price Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-base font-semibold text-[#1A2A4F]">
                    <span>Category</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base text-[#1A2A4F] border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">Select category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Tutoring">Tutoring</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-base font-semibold text-[#1A2A4F]">
                    <span>Starting Price</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A2A4F] text-base font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full pl-10 pr-4 py-2 text-base text-[#1A2A4F] border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="500"
                    />
                  </div>
                  <p className="text-sm text-[#1A2A4F]">
                    Set a competitive starting price
                  </p>
                </div>
              </div>

              {/* Thumbnail Section */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-base font-semibold text-[#1A2A4F]">
                  <span>Thumbnail</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="block w-full h-48 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-navyBlue transition-all duration-200 group bg-blue-50"
                >
                  {thumbnailPreview ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <img
                        src={thumbnailPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#1A2A4F]/30 group-hover:bg-[#1A2A4F]/50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                          <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                          <p className="text-white font-medium text-sm">
                            Change Thumbnail
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Upload className="w-8 h-8 text-[#1A2A4F] mb-2 group-hover:scale-110 transition-transform duration-200" />
                      <p className="text-[#1A2A4F] font-medium text-sm">
                        Upload Thumbnail
                      </p>
                      <p className="text-xs text-[#1A2A4F]/80">
                        JPEG or PNG • Max 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F] font-semibold text-base rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-[#1A2A4F]"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Gig...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#1A2A4F]" />
                      Create Gig
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateGig;
