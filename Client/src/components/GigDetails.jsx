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
  X,
  Check,
  Lock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
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

  // Modal State
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);

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
            });
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        localStorage.removeItem("token");
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
        const token = localStorage.getItem("token");

        if (userId && token) {
          // 1. Get User's own applications
          requests.push(
            axios.get(`${API_BASE}/users/${userId}/applications`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          );

          // 2. If Seller, get ALL applications for this gig
          if (fetchedGig && fetchedGig.providerId === userId) {
            requests.push(
              axios.get(`${API_BASE}/gigs/${id}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
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

        const [userAppsRes, gigAppsRes] = await Promise.all(requests);

        // Process User's applications
        setUserApplications(
          userAppsRes.data.map((app) => ({
            gigId: app.gigId._id || app.gigId,
            status: app.status,
            _id: app._id,
          })) || []
        );

        // Process All Applicants (for provider)
        setApplicants(gigAppsRes.data || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.error || "Failed to load gig details.");
        setLoading(false);
      }
    };

    if (userId !== null || !localStorage.getItem("token")) {
      fetchData();
    }
  }, [id, userId]);

  // --- HANDLERS ---

  const handleApply = async () => {
    if (!userId) {
      toast.error("Please log in to apply for gigs.");
      navigate("/login");
      return;
    }

    if (!isVerified) {
      toast.error("Please verify your email before applying.");
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

      // Update local state
      setUserApplications([
        ...userApplications,
        { gigId: id, status: "pending", _id: response.data.application._id },
      ]);

      // Go to ticket
      navigate(`/tickets/${response.data.ticketId}`);
    } catch (error) {
      console.error("Error applying:", error);
      toast.error(error.response?.data?.error || "Failed to apply.");
      setIsApplying(false);
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    const token = localStorage.getItem("token");
    try {
      // 1. Update Application Status
      await axios.patch(
        `${API_BASE}/gigs/${id}/applications/${applicationId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Application ${status}!`);

      // 2. Update Local Applicants State
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );

      // --- LOGIC TO CLOSE GIG IF ACCEPTED ---
      if (status === "accepted") {
        try {
          // Update Gig Status to 'closed'
          await axios.put(
            `${API_BASE}/gigs/${id}`,
            { status: "closed" },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // Update Local Gig State
          setGig((prev) => ({ ...prev, status: "closed" }));
          toast.success("Gig has been marked as Closed.");
        } catch (updateError) {
          console.error("Failed to close gig:", updateError);
          toast.error(
            "Applicant accepted, but failed to close gig automatically."
          );
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.error || "Failed to update.");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/gigs/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: gig.title, url });
        toast.success("Shared successfully!");
      } catch (err) {
        // Ignore abort errors
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  // Image Navigation
  const images = gig?.thumbnail
    ? [gig.thumbnail, ...(gig.additionalImages || []).slice(0, 3)]
    : [];

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % images.length);
  const prevImage = () =>
    setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);

  // --- RENDER HELPERS ---

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="container mx-auto pt-24 pb-12 px-4 flex justify-center">
          <div className="w-full max-w-4xl space-y-8">
            <div className="h-8 bg-gray-200 animate-pulse w-1/2 rounded"></div>
            <div className="h-96 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-4">
                <div className="h-4 bg-gray-200 animate-pulse w-full rounded"></div>
                <div className="h-4 bg-gray-200 animate-pulse w-3/4 rounded"></div>
              </div>
              <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="container mx-auto pt-32 pb-12 px-4 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Gig
          </h2>
          <p className="text-gray-600 mb-6">{error || "Gig not found"}</p>
          <button
            onClick={() => navigate("/gigs")}
            className="px-6 py-2 bg-[#1A2A4F] text-white rounded-lg"
          >
            Back to Gigs
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const userApplication = userApplications.find((app) => app.gigId === id);
  const hasApplied = !!userApplication;
  const isClosed = gig.status === "closed";
  const isOwner = gig.providerId === userId;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/gigs")}
            className="group flex items-center gap-2 text-gray-500 hover:text-[#1A2A4F] mb-6 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Listings
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  {gig.category}
                </span>
                {isClosed && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full border border-gray-200 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Closed
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A2A4F] leading-tight">
                {gig.title}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>Remote / Online</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4" />
                <span>
                  Posted {new Date(gig.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT COLUMN (Images & Description) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery */}
              {images.length > 0 && (
                <div className="relative rounded-2xl overflow-hidden shadow-lg group bg-gray-100 h-[400px] md:h-[500px]">
                  <img
                    src={images[currentImageIndex]}
                    alt="Gig thumbnail"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <ChevronLeft className="h-6 w-6 text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <ChevronRight className="h-6 w-6 text-gray-800" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-2 rounded-full cursor-pointer transition-all ${
                              idx === currentImageIndex
                                ? "w-6 bg-white"
                                : "w-2 bg-white/60"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* About */}
              <div>
                <h3 className="text-2xl font-bold text-[#1A2A4F] mb-4">
                  About this Gig
                </h3>
                <div className="prose prose-lg text-gray-600 max-w-none whitespace-pre-wrap">
                  {gig.description}
                </div>
              </div>

              {/* Provider Card */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-[#1A2A4F] mb-4">
                  About the Provider
                </h3>
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="h-14 w-14 rounded-full bg-[#1A2A4F] flex items-center justify-center text-white text-xl font-bold">
                    {gig.providerName?.[0] || "P"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {gig.providerName}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>4.9 (Verified)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/profile/${gig.providerId}`)}
                    className="ml-auto text-sm font-semibold text-[#1A2A4F] hover:underline"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Action Card) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
                  <div className="mb-6">
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Fixed Price
                    </p>
                    <p className="text-4xl font-black text-[#1A2A4F]">
                      ₹{gig.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {isOwner ? (
                    // --- PROVIDER VIEW ---
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {applicants.length}{" "}
                          {applicants.length === 1 ? "Applicant" : "Applicants"}
                        </p>
                      </div>

                      {isClosed ? (
                        <div className="w-full py-3 bg-gray-100 border border-gray-200 text-gray-600 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                          <Lock className="h-5 w-5" /> Gig Closed
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowApplicantsModal(true)}
                          className="w-full py-4 bg-[#1A2A4F] text-white rounded-xl font-bold text-lg hover:bg-[#0f1a35] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                          <Users className="h-5 w-5" />
                          Manage Applicants
                        </button>
                      )}

                      {/* Even if closed, allow managing so they can find the accepted one */}
                      {isClosed && (
                        <button
                          onClick={() => setShowApplicantsModal(true)}
                          className="w-full py-3 text-[#1A2A4F] hover:underline text-sm"
                        >
                          View Accepted Applicant
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/gigs/edit/${id}`)}
                        className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-gray-300 transition-colors"
                      >
                        Edit Gig
                      </button>
                    </div>
                  ) : (
                    // --- FREELANCER VIEW ---
                    <div className="space-y-4">
                      {hasApplied ? (
                        <div
                          className={`p-4 rounded-xl border text-center ${
                            userApplication.status === "accepted"
                              ? "bg-green-50 border-green-200 text-green-700"
                              : userApplication.status === "rejected"
                              ? "bg-red-50 border-red-200 text-red-700"
                              : "bg-yellow-50 border-yellow-200 text-yellow-700"
                          }`}
                        >
                          <p className="font-bold flex items-center justify-center gap-2">
                            {userApplication.status === "accepted" ? (
                              <Check className="h-5 w-5" />
                            ) : userApplication.status === "rejected" ? (
                              <X className="h-5 w-5" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                            Application {userApplication.status}
                          </p>
                          <p className="text-xs mt-1 opacity-80">
                            Check your tickets for details
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={handleApply}
                          disabled={isClosed || isApplying || !isVerified}
                          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                            isClosed || !isVerified
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-[#1A2A4F] text-white hover:bg-[#0f1a35] hover:shadow-xl"
                          }`}
                        >
                          {isApplying
                            ? "Applying..."
                            : isClosed
                            ? "Gig Closed"
                            : "Apply Now"}
                          {!isApplying && !isClosed && (
                            <Briefcase className="h-5 w-5" />
                          )}
                        </button>
                      )}

                      {!hasApplied && (
                        <p className="text-xs text-center text-gray-400">
                          By applying, you agree to our Terms of Service.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- APPLICANTS MODAL --- */}
      {showApplicantsModal && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#1A2A4F]">
                  Manage Applicants
                </h2>
                <p className="text-sm text-gray-500">
                  Review and accept freelancers for "{gig.title}"
                </p>
              </div>
              <button
                onClick={() => setShowApplicantsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {applicants.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No applicants yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applicants.map((app) => (
                    <div
                      key={app._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-gray-50/50"
                    >
                      {/* Avatar/Name */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                          {app.applicantId?.fullName?.[0] ||
                            app.applicantName?.[0] ||
                            "U"}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {app.applicantId?.fullName || app.applicantName}
                          </h4>
                          <button
                            onClick={() =>
                              navigate(
                                `/profile/${
                                  app.applicantId?._id || app.applicantId
                                }`
                              )
                            }
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <User className="h-3 w-3" /> View Profile
                          </button>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {app.status === "pending" && !isClosed ? (
                          <>
                            <button
                              onClick={() =>
                                handleApplicationStatus(app._id, "accepted")
                              }
                              className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                              <Check className="h-4 w-4" /> Accept
                            </button>
                            <button
                              onClick={() =>
                                handleApplicationStatus(app._id, "rejected")
                              }
                              className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                            >
                              <X className="h-4 w-4" /> Reject
                            </button>
                          </>
                        ) : (
                          <div
                            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                              app.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {app.status === "accepted" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </div>
                        )}

                        {/* Link to Ticket/Chat */}
                        <button
                          onClick={() => {
                            navigate("/tickets");
                            toast("Check your tickets", { icon: "💬" });
                          }}
                          className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg"
                          title="Go to Chat"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowApplicantsModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GigDetails;
