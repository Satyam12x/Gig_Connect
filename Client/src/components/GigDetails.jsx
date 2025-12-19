"use client";

import { useState, useEffect, useRef } from "react";
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
  Unlock,
  ArrowRight,
  Ticket,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { API_BASE } from "../constants/api";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    open: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: Unlock,
      label: "Open for Applications",
    },
    in_progress: {
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: Clock,
      label: "In Progress",
    },
    closed: {
      color: "bg-gray-100 text-gray-600 border-gray-200",
      icon: Lock,
      label: "Closed",
    },
    completed: {
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Check,
      label: "Completed",
    },
  };

  const cfg = config[status] || config.open;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [gig, setGig] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isProcessing, setIsProcessing] = useState({});
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Modal State
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

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
          requests.push(
            axios.get(`${API_BASE}/users/${userId}/applications`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          );

          requests.push(
            axios.get(`${API_BASE}/users/${userId}/tickets`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          );

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
            Promise.resolve({ data: [] }),
            Promise.resolve({ data: [] })
          );
        }

        const [userAppsRes, userTicketsRes, gigAppsRes] = await Promise.all(
          requests
        );

        setUserApplications(
          userAppsRes.data.map((app) => ({
            gigId: app.gigId?._id || app.gigId,
            status: app.status,
            _id: app._id,
          })) || []
        );

        setUserTickets(userTicketsRes.data || []);
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

  // Find ticket for this gig (for freelancer)
  const getTicketForGig = () => {
    return userTickets.find(
      (ticket) =>
        (ticket.gigId?._id || ticket.gigId) === id &&
        (ticket.providerId?._id === userId ||
          ticket.freelancerId?._id === userId)
    );
  };

  // Find ticket for specific applicant (for provider)
  const getTicketForApplicant = (applicantId) => {
    return userTickets.find(
      (ticket) =>
        (ticket.gigId?._id || ticket.gigId) === id &&
        (ticket.freelancerId?._id || ticket.freelancerId) === applicantId
    );
  };

  // --- HANDLERS ---

  const applyInFlightRef = useRef(false);
  const appActionInFlightRef = useRef({});

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

    if (role === "Provider") {
      toast.error("Only Freelancers can apply for gigs.");
      return;
    }

    // guard to prevent duplicate apply requests
    if (applyInFlightRef.current) return;
    applyInFlightRef.current = true;
    setIsApplying(true);
    try {
      const response = await axios.post(
        `${API_BASE}/gigs/${gig._id}/apply`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Application submitted! Redirecting to ticket...");

      setUserApplications([
        ...userApplications,
        { gigId: gig._id, status: "pending", _id: response.data.application._id },
      ]);

      navigate(`/tickets/${response.data.ticketId}`);
    } catch (error) {
      console.error("Error applying:", error);
      toast.error(error.response?.data?.error || "Failed to apply.");
      setIsApplying(false);
    } finally {
      applyInFlightRef.current = false;
    }
  };

  const handleApplicationStatus = async (
    applicationId,
    applicantId,
    status
  ) => {
    // guard per-application to prevent duplicate actions
    if (appActionInFlightRef.current[applicationId]) return;
    appActionInFlightRef.current[applicationId] = true;
    setIsProcessing((prev) => ({ ...prev, [applicationId]: true }));

    try {
      const response = await axios.patch(
        `${API_BASE}/gigs/${gig._id}/applications/${applicationId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success(
        status === "accepted"
          ? "Freelancer accepted! Gig is now closed."
          : "Application rejected."
      );

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );

      if (status === "accepted") {
        // Update gig status locally
        setGig((prev) => ({ ...prev, status: "closed" }));

        // Update other applicants to rejected
        setApplicants((prev) =>
          prev.map((app) =>
            app._id !== applicationId && app.status === "pending"
              ? { ...app, status: "rejected" }
              : app
          )
        );
      }

      setConfirmModal(null);
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error(
        error.response?.data?.error || "Failed to update application."
      );
    } finally {
      appActionInFlightRef.current[applicationId] = false;
      setIsProcessing((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/gigs/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: gig.title, url });
        toast.success("Shared successfully!");
      } catch (err) {
        // Ignore
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleGoToTicket = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  // Image Navigation
  const images = gig?.thumbnail
    ? [gig.thumbnail, ...(gig.additionalImages || []).slice(0, 3)]
    : [];

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % images.length);
  const prevImage = () =>
    setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);

  // --- RENDER ---

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
  const existingTicket = getTicketForGig();
  const isClosed = gig.status === "closed";
  const isOwner = gig.providerId === userId;
  const acceptedApplicant = applicants.find((app) => app.status === "accepted");
  const pendingApplicants = applicants.filter(
    (app) => app.status === "pending"
  );

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
                <StatusBadge status={gig.status} />
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
            {/* LEFT COLUMN */}
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
                      <span>Verified Provider</span>
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

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
                  <div className="mb-6">
                    <p className="text-gray-500 text-sm font-medium mb-1">
                      Budget
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
                          {pendingApplicants.length > 0 && !isClosed && (
                            <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                              {pendingApplicants.length} pending
                            </span>
                          )}
                        </p>
                      </div>

                      {isClosed && acceptedApplicant && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                          <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Freelancer Hired
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                              {acceptedApplicant.applicantId?.fullName?.[0] ||
                                acceptedApplicant.applicantName?.[0] ||
                                "F"}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {acceptedApplicant.applicantId?.fullName ||
                                  acceptedApplicant.applicantName}
                              </p>
                            </div>
                          </div>
                          {getTicketForApplicant(
                            acceptedApplicant.applicantId?._id ||
                              acceptedApplicant.applicantId
                          ) && (
                            <button
                              onClick={() =>
                                handleGoToTicket(
                                  getTicketForApplicant(
                                    acceptedApplicant.applicantId?._id ||
                                      acceptedApplicant.applicantId
                                  )._id
                                )
                              }
                              className="w-full mt-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Go to Ticket
                            </button>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setShowApplicantsModal(true)}
                        className="w-full py-4 bg-[#1A2A4F] text-white rounded-xl font-bold text-lg hover:bg-[#0f1a35] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <Users className="h-5 w-5" />
                        {isClosed ? "View All Applicants" : "Manage Applicants"}
                      </button>

                      {!isClosed && (
                        <button
                          onClick={() => navigate(`/gigs/edit/${id}`)}
                          className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-gray-300 transition-colors"
                        >
                          Edit Gig
                        </button>
                      )}
                    </div>
                  ) : (
                    // --- FREELANCER VIEW ---
                    <div className="space-y-4">
                      {existingTicket ? (
                        <div className="space-y-3">
                          <div
                            className={`p-4 rounded-xl border text-center ${
                              existingTicket.status === "closed"
                                ? "bg-gray-50 border-gray-200 text-gray-600"
                                : ["accepted", "paid", "completed"].includes(
                                    existingTicket.status
                                  )
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-blue-50 border-blue-200 text-blue-700"
                            }`}
                          >
                            <p className="font-bold flex items-center justify-center gap-2">
                              <Ticket className="h-5 w-5" />
                              Ticket:{" "}
                              {existingTicket.status
                                .replace("_", " ")
                                .toUpperCase()}
                            </p>
                            <p className="text-xs mt-1 opacity-80">
                              {existingTicket.agreedPrice
                                ? `Agreed: ₹${existingTicket.agreedPrice.toLocaleString(
                                    "en-IN"
                                  )}`
                                : "Price not yet agreed"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleGoToTicket(existingTicket._id)}
                            className="w-full py-4 bg-[#1A2A4F] text-white rounded-xl font-bold text-lg hover:bg-[#0f1a35] transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="h-5 w-5" />
                            Go to Ticket
                            <ArrowRight className="h-5 w-5" />
                          </button>
                        </div>
                      ) : hasApplied ? (
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
                        <>
                          <button
                            onClick={handleApply}
                            disabled={isClosed || isApplying || !isVerified}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                              isClosed || !isVerified
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-[#1A2A4F] text-white hover:bg-[#0f1a35] hover:shadow-xl"
                            }`}
                          >
                            {isApplying ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Applying...
                              </>
                            ) : isClosed ? (
                              <>
                                <Lock className="h-5 w-5" />
                                Gig Closed
                              </>
                            ) : !isVerified ? (
                              "Verify Email First"
                            ) : (
                              <>
                                <Briefcase className="h-5 w-5" />
                                Apply Now
                              </>
                            )}
                          </button>
                          {!isVerified && !isClosed && (
                            <p className="text-xs text-center text-red-500">
                              Please verify your email to apply
                            </p>
                          )}
                        </>
                      )}

                      {!hasApplied && !existingTicket && !isClosed && (
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#1A2A4F]">
                  {isClosed ? "All Applicants" : "Manage Applicants"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isClosed
                    ? "This gig has been assigned"
                    : `Select a freelancer for "${gig.title}"`}
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
              {/* Info Banner */}
              {!isClosed && pendingApplicants.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-amber-800">
                    <strong>⚠️ Important:</strong> Once you accept an applicant,
                    the gig will be closed and all other pending applications
                    will be automatically rejected.
                  </p>
                </div>
              )}

              {applicants.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No applicants yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applicants.map((app) => {
                    const applicantTicket = getTicketForApplicant(
                      app.applicantId?._id || app.applicantId
                    );
                    const isAccepted = app.status === "accepted";
                    const isRejected = app.status === "rejected";
                    const isPending = app.status === "pending";

                    return (
                      <div
                        key={app._id}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          isAccepted
                            ? "border-green-300 bg-green-50"
                            : isRejected
                            ? "border-gray-200 bg-gray-50 opacity-60"
                            : "border-gray-200 bg-white hover:border-[#1A2A4F]"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {/* Avatar/Name */}
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                isAccepted
                                  ? "bg-green-600"
                                  : isRejected
                                  ? "bg-gray-400"
                                  : "bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F]"
                              }`}
                            >
                              {app.applicantId?.fullName?.[0] ||
                                app.applicantName?.[0] ||
                                "U"}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900">
                                {app.applicantId?.fullName || app.applicantName}
                              </h4>
                              <div className="flex items-center gap-2 flex-wrap">
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
                                {isAccepted && (
                                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="h-3 w-3" /> ACCEPTED
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <X className="h-3 w-3" /> REJECTED
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                            {/* Go to Ticket Button */}
                            {applicantTicket && (
                              <button
                                onClick={() =>
                                  handleGoToTicket(applicantTicket._id)
                                }
                                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                              >
                                <MessageSquare className="h-4 w-4" />
                                Ticket
                              </button>
                            )}

                            {/* Accept/Reject Buttons (only for pending and gig not closed) */}
                            {isPending && !isClosed && (
                              <>
                                <button
                                  onClick={() =>
                                    setConfirmModal({
                                      type: "accept",
                                      applicationId: app._id,
                                      applicantId:
                                        app.applicantId?._id || app.applicantId,
                                      applicantName:
                                        app.applicantId?.fullName ||
                                        app.applicantName,
                                    })
                                  }
                                  disabled={isProcessing[app._id]}
                                  className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  {isProcessing[app._id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                  Accept
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmModal({
                                      type: "reject",
                                      applicationId: app._id,
                                      applicantId:
                                        app.applicantId?._id || app.applicantId,
                                      applicantName:
                                        app.applicantId?.fullName ||
                                        app.applicantName,
                                    })
                                  }
                                  disabled={isProcessing[app._id]}
                                  className="px-4 py-2 bg-white border-2 border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  <X className="h-4 w-4" />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Cover Letter Preview */}
                        {app.coverLetter && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                              Cover Letter
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {app.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end flex-shrink-0">
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

      {/* --- CONFIRM MODAL --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[#1A2A4F] mb-4">
              {confirmModal.type === "accept"
                ? "Accept Applicant?"
                : "Reject Applicant?"}
            </h3>

            {confirmModal.type === "accept" ? (
              <div className="space-y-4 mb-6">
                <p className="text-gray-600">
                  You are about to accept{" "}
                  <strong>{confirmModal.applicantName}</strong> for this gig.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <strong>This will:</strong>
                  </p>
                  <ul className="text-sm text-amber-700 mt-1 space-y-1">
                    <li>• Close this gig to new applications</li>
                    <li>• Reject all other pending applications</li>
                    <li>• Notify the selected freelancer</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                Are you sure you want to reject{" "}
                <strong>{confirmModal.applicantName}</strong>'s application?
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleApplicationStatus(
                    confirmModal.applicationId,
                    confirmModal.applicantId,
                    confirmModal.type === "accept" ? "accepted" : "rejected"
                  )
                }
                disabled={isProcessing[confirmModal.applicationId]}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                  confirmModal.type === "accept"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {isProcessing[confirmModal.applicationId] ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : confirmModal.type === "accept" ? (
                  <>
                    <Check className="h-5 w-5" />
                    Accept
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5" />
                    Reject
                  </>
                )}
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
