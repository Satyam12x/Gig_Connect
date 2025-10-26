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

  // Handle apply for gig
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

  // Handle application status update
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

  // Handle share with proper route
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

  // Handle retry
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

  // Image carousel
  const images = gig?.thumbnail
    ? [gig.thumbnail, ...(gig.additionalImages || []).slice(0, 3)]
    : [];
  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 pt-20 pb-12 flex-1">
          <div className="max-w-5xl mx-auto animate-pulse space-y-6">
            <div className="h-12 bg-slate-200 rounded-lg w-3/4"></div>
            <div className="h-96 bg-slate-200 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>
              <div className="h-48 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 pt-20 pb-12 flex-1 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center animate-slide-in-bottom">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-6 font-medium">{error}</p>
            <button
              onClick={handleRetry}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold relative overflow-hidden group"
            >
              <span className="relative z-10">Try Again</span>
              <span className="absolute inset-0 bg-blue-800 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (!gig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 pt-20 pb-12 flex-1 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center animate-slide-in-bottom">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-6">Gig not found.</p>
            <button
              onClick={() => navigate("/gigs")}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold relative overflow-hidden group"
            >
              <span className="relative z-10">Back to Gigs</span>
              <span className="absolute inset-0 bg-blue-800 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <style>{`
        @keyframes slideInBottom {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .animate-slide-in-bottom { animation: slideInBottom 0.6s ease-out; }
        .animate-scale-in { animation: scaleIn 0.5s ease-out; }
        .animate-pulse-glow { animation: pulseGlow 2s infinite; }
        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-accepted { background-color: #dcfce7; color: #166534; }
        .status-rejected { background-color: #fee2e2; color: #991b1b; }
        .status-closed { background-color: #f3f4f6; color: #374151; }
        .button-click-effect {
          position: relative;
          overflow: hidden;
        }
        .button-click-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: transform 0.4s ease-out;
        }
        .button-click-effect:hover::after {
          transform: translateX(100%);
        }
      `}</style>

      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pb-12 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 animate-slide-in-bottom">
            <button
              onClick={() => navigate("/gigs")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors button-click-effect"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Gigs
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 animate-scale-in">
                  {gig.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="status-badge status-closed animate-scale-in">
                    {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                  </span>
                  <span className="flex items-center gap-1 animate-scale-in">
                    <MapPin className="h-4 w-4" />
                    {gig.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 button-click-effect animate-pulse-glow"
                  title="Share this gig"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                {userId && (
                  <button
                    onClick={() => navigate("/tickets")}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 button-click-effect animate-pulse-glow"
                    title="View my tickets"
                  >
                    <Users className="h-5 w-5" />
                    <span className="hidden sm:inline">Tickets</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Gig Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-white animate-scale-in group">
                  <img
                    src={images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${gig.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-80 sm:h-96 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={goToPreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 button-click-effect"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={goToNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 button-click-effect"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-2 w-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? "bg-white w-6"
                                : "bg-white/50 hover:bg-white/75"
                            } button-click-effect`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Description Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-scale-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  About this gig
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {gig.description}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Category
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {gig.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Price
                    </p>
                    <p className="text-lg font-semibold text-blue-600">
                      ₹{gig.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Status
                    </p>
                    <span className="status-badge status-closed">
                      {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seller Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-scale-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  About the seller
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {gig.sellerName}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/profile/${gig.sellerId}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium button-click-effect animate-pulse-glow"
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
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20 animate-scale-in">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Applicants ({applicants.length})
                  </h2>

                  {applicants.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {applicants.map((app) => (
                        <div
                          key={app._id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors animate-scale-in"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {app.applicantName}
                              </p>
                              <span
                                className={`status-badge ${
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
                              className="text-blue-600 hover:text-blue-700 transition-colors button-click-effect"
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
                                className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium text-sm button-click-effect animate-pulse-glow"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleApplicationStatus(app._id, "rejected")
                                }
                                className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors font-medium text-sm button-click-effect animate-pulse-glow"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 animate-scale-in">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No applicants yet</p>
                    </div>
                  )}
                </div>
              ) : (
                // Buyer View - Action Panel
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20 animate-scale-in">
                  <div className="space-y-4">
                    {/* Price Display */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 animate-pulse-glow">
                      <p className="text-sm text-gray-600 mb-1">Total Price</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ₹{gig.price.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Apply Button or Status */}
                    {hasApplied ? (
                      <div
                        className={`px-4 py-4 rounded-lg text-center font-semibold status-badge animate-scale-in ${
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
                        className={`w-full px-6 py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-lg button-click-effect animate-pulse-glow ${
                          isClosed || hasApplied || isApplying || !isVerified
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
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
                    <button className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2 button-click-effect animate-pulse-glow">
                      <MessageSquare className="h-5 w-5" />
                      Message Seller
                    </button>

                    {/* Info Messages */}
                    {!isVerified && (
                      <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg animate-scale-in">
                        ✓ Verify your email to apply for gigs
                      </p>
                    )}
                    {isClosed && (
                      <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg animate-scale-in">
                        ✗ This gig is no longer accepting applications
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