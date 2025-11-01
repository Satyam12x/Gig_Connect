"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import {
  Briefcase,
  Users,
  User,
  AlertTriangle,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageSquare,
  Star,
  Heart,
  Clock,
  DollarSign,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const GigDetails = () => {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  // Fetch user info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.id && decoded.role) {
          setUserId(decoded.id);
          setRole(decoded.role);
          axios
            .get(`${API_BASE}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => setIsVerified(response.data.isVerified))
            .catch((error) => {
              console.error("Error fetching user profile:", error);
              toast.error("Failed to verify user status.");
            });
        } else {
          console.error("Invalid token payload:", decoded);
          localStorage.removeItem("token");
          toast.error("Session invalid. Please log in again.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      }
    }
  }, [navigate]);

  // Fetch gig and application data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const gigResponse = await axios.get(`${API_BASE}/gigs/${id}`);
        const fetchedGig = gigResponse.data || null;
        setGig(fetchedGig);

        const requests = [];
        if (userId) {
          requests.push(
            axios.get(`${API_BASE}/users/${userId}/applications`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
          );
          if (fetchedGig && fetchedGig.sellerId === userId) {
            requests.push(
              axios.get(`${API_BASE}/gigs/${id}/applications`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
            );
          } else {
            requests.push(Promise.resolve({ data: [] }));
          }
        } else {
          requests.push(
            Promise.resolve({ data: [] }),
            Promise.resolve({ data: [] })
          );
        }

        const [applicationsResponse, applicantsResponse] = await Promise.all(
          requests
        );

        setUserApplications(
          applicationsResponse.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );
        setApplicants(applicantsResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.error || "Failed to load gig details.");
        setLoading(false);
      }
    };

    if (userId !== null) {
      fetchData();
    }
  }, [id, userId]);

  const handleApply = async () => {
    if (!userId) {
      toast.error("Please log in to apply for gigs.");
      navigate("/login", { state: { from: `/gigs/${id}` } });
      return;
    }

    if (!isVerified) {
      toast.error("Please verify your email before applying for gigs.");
      navigate("/profile");
      return;
    }

    setIsApplying(true);
    try {
      const response = await axios.post(
        `${API_BASE}/gigs/${id}/apply`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Application submitted! Redirecting to ticket...");
      setUserApplications([
        ...userApplications,
        { gigId: id, status: "pending", _id: response.data.application._id },
      ]);
      navigate(`/tickets/${response.data.ticketId}`);
    } catch (error) {
      console.error("Error applying for gig:", error);
      const errorMsg =
        error.response?.data?.error || "Failed to apply for gig.";
      toast.error(errorMsg);
      setIsApplying(false);
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      await axios.patch(
        `${API_BASE}/gigs/${id}/applications/${applicationId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(`Application ${status}!`);
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
      if (userId) {
        const applicationsResponse = await axios.get(
          `${API_BASE}/users/${userId}/applications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserApplications(
          applicationsResponse.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error(
        error.response?.data?.error || "Failed to update application."
      );
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: gig.title,
        text: `Check out this gig: ${gig.title} on our platform!`,
        url: `${window.location.origin}/gigs/${id}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Gig shared successfully!");
      } else {
        navigator.clipboard.writeText(shareData.url);
        toast.success("Gig link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing gig:", error);
      navigator.clipboard.writeText(`${window.location.origin}/gigs/${id}`);
      toast.success("Gig link copied to clipboard!");
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchData = async () => {
      try {
        const gigResponse = await axios.get(`${API_BASE}/gigs/${id}`);
        const fetchedGig = gigResponse.data || null;
        setGig(fetchedGig);

        const requests = [];
        if (userId) {
          requests.push(
            axios.get(`${API_BASE}/users/${userId}/applications`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
          );
          if (fetchedGig && fetchedGig.sellerId === userId) {
            requests.push(
              axios.get(`${API_BASE}/gigs/${id}/applications`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
            );
          } else {
            requests.push(Promise.resolve({ data: [] }));
          }
        } else {
          requests.push(
            Promise.resolve({ data: [] }),
            Promise.resolve({ data: [] })
          );
        }

        const [applicationsResponse, applicantsResponse] = await Promise.all(
          requests
        );

        setUserApplications(
          applicationsResponse.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );
        setApplicants(applicantsResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error retrying fetch:", error);
        setError(error.response?.data?.error || "Failed to load gig details.");
        setLoading(false);
      }
    };
    fetchData();
  };

  const images = gig?.thumbnail
    ? [gig.thumbnail, ...(gig.additionalImages || []).slice(0, 3)]
    : [];
  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-1">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-96 sm:h-[500px] bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
              </div>
              <div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-1 flex items-center justify-center">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center shadow-sm">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-6 font-medium">{error}</p>
            <button
              onClick={handleRetry}
              className="w-full px-6 py-3 bg-[#1A2A4F] text-white rounded-lg hover:bg-[#0f1a35] transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-1 flex items-center justify-center">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center shadow-sm">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-6">Gig not found.</p>
            <button
              onClick={() => navigate("/gigs")}
              className="w-full px-6 py-3 bg-[#1A2A4F] text-white rounded-lg hover:bg-[#0f1a35] transition-colors font-medium"
            >
              Back to Gigs
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const userApplication = userApplications.find((app) => app.gigId === id);
  const hasApplied = !!userApplication;
  const isClosed = gig.status === "closed";
  const isSeller = gig.sellerId === userId;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(26, 42, 79, 0.12);
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.375rem 0.875rem;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
        }
        
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .status-accepted {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .status-rejected {
          background-color: #fee2e2;
          color: #991b1b;
        }
        
        .status-closed {
          background-color: #f3f4f6;
          color: #374151;
        }
      `}</style>

      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate("/gigs")}
            className="flex items-center gap-2 text-[#1A2A4F] hover:text-[#0f1a35] mb-8 font-medium transition-colors fade-in"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Gigs
          </button>

          {/* Header Section */}
          <div className="mb-10 fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                  {gig.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="status-badge status-closed">
                    {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600 text-sm font-medium">
                    <MapPin className="h-4 w-4" />
                    {gig.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors hover-lift"
                  title="Add to favorites"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 hover-lift"
                  title="Share this gig"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column - Gig Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="relative rounded-lg overflow-hidden shadow-sm border border-gray-100 group fade-in">
                  <img
                    src={images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${gig.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-80 sm:h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={goToPreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#1A2A4F]/80 hover:bg-[#1A2A4F] text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={goToNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#1A2A4F]/80 hover:bg-[#1A2A4F] text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? "bg-white w-6"
                                : "bg-white/50 hover:bg-white/70 w-2"
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Description Section */}
              <div className="fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  About this gig
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {gig.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg fade-in">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Category
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {gig.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Price
                  </p>
                  <p className="text-lg font-semibold text-[#1A2A4F]">
                    ₹{gig.price.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Status
                  </p>
                  <span className="status-badge status-closed">
                    {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Seller Card */}
              <div className="border border-gray-200 rounded-lg p-6 fade-in hover-lift">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  About the seller
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {gig.sellerName}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.9 (128 reviews)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/profile/${gig.sellerId}`)}
                    className="px-4 py-2 bg-[#1A2A4F] text-white rounded-lg hover:bg-[#0f1a35] transition-colors font-medium"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Actions or Applicants */}
            <div className="lg:col-span-1">
              {isSeller ? (
                // Seller View - Applicants Panel
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24 fade-in">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">
                    Applicants ({applicants.length})
                  </h2>

                  {applicants.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {applicants.map((app) => (
                        <div
                          key={app._id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover-lift"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {app.applicantName}
                              </p>
                              <span
                                className={`status-badge inline-block mt-2 ${
                                  app.status === "pending"
                                    ? "status-pending"
                                    : app.status === "accepted"
                                    ? "status-accepted"
                                    : "status-rejected"
                                }`}
                              >
                                {app.status.charAt(0).toUpperCase() +
                                  app.status.slice(1)}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                navigate(
                                  `/users/${
                                    app.applicantId._id || app.applicantId
                                  }`
                                )
                              }
                              className="text-[#1A2A4F] hover:text-[#0f1a35] transition-colors"
                              title="View profile"
                            >
                              <User className="h-5 w-5" />
                            </button>
                          </div>

                          {app.status === "pending" && (
                            <div className="flex gap-2 pt-3 border-t border-gray-200">
                              <button
                                onClick={() =>
                                  handleApplicationStatus(app._id, "accepted")
                                }
                                className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium text-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleApplicationStatus(app._id, "rejected")
                                }
                                className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors font-medium text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        No applicants yet
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Buyer View - Action Panel
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24 fade-in">
                  <div className="space-y-4">
                    {/* Price Display */}
                    <div className="bg-white border-2 border-[#1A2A4F] rounded-lg p-5">
                      <p className="text-sm text-gray-600 mb-2 font-medium">
                        Total Price
                      </p>
                      <p className="text-4xl font-bold text-[#1A2A4F]">
                        ₹{gig.price.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Apply Button or Status */}
                    {hasApplied ? (
                      <div
                        className={`px-4 py-4 rounded-lg text-center font-semibold status-badge ${
                          userApplication.status === "pending"
                            ? "status-pending"
                            : userApplication.status === "accepted"
                            ? "status-accepted"
                            : "status-rejected"
                        }`}
                      >
                        Application{" "}
                        {userApplication.status.charAt(0).toUpperCase() +
                          userApplication.status.slice(1)}
                      </div>
                    ) : (
                      <button
                        onClick={handleApply}
                        disabled={
                          isClosed || hasApplied || isApplying || !isVerified
                        }
                        className={`w-full px-6 py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-base ${
                          isClosed || hasApplied || isApplying || !isVerified
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-[#1A2A4F] text-white hover:bg-[#0f1a35] shadow-md hover:shadow-lg"
                        }`}
                      >
                        <Briefcase className="h-5 w-5" />
                        {isApplying
                          ? "Applying..."
                          : !isVerified
                          ? "Verify Email"
                          : isClosed
                          ? "Closed"
                          : "Apply Now"}
                      </button>
                    )}

                    {/* Message Button */}
                    <button className="w-full px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 hover-lift">
                      <MessageSquare className="h-5 w-5" />
                      Message Seller
                    </button>

                    {/* Info Messages */}
                    {!isVerified && (
                      <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        Verify your email to apply for gigs
                      </p>
                    )}
                    {isClosed && (
                      <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg border border-gray-200">
                        This gig is no longer accepting applications
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GigDetails;
