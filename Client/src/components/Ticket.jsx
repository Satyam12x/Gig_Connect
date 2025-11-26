import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  DollarSign,
  CheckCircle,
  Star,
  X,
  Clock,
  MessageSquare,
  Info,
  ArrowLeft,
  File,
  AlertCircle,
  TrendingUp,
  Package,
  Shield,
  Users,
  Search,
  Check,
  RefreshCw,
  Briefcase,
  Laptop,
  CreditCard,
  Award,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import io from "socket.io-client";
import { debounce } from "lodash";
import moment from "moment";

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

// Collapsible Status Flow Component
const StatusFlow = ({ currentStatus, isCollapsed, onToggle }) => {
  const statuses = [
    { key: "open", label: "Open", icon: Unlock },
    { key: "negotiating", label: "Negotiating", icon: TrendingUp },
    { key: "accepted", label: "Accepted", icon: Check },
    { key: "paid", label: "Paid", icon: CreditCard },
    { key: "completed", label: "Completed", icon: Package },
    { key: "closed", label: "Closed", icon: Shield },
  ];

  const currentIndex = statuses.findIndex((s) => s.key === currentStatus);
  const currentStatusData = statuses.find((s) => s.key === currentStatus);
  const CurrentIcon = currentStatusData?.icon || AlertCircle;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A2A4F] text-white flex items-center justify-center">
            <CurrentIcon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Current Status
            </p>
            <p className="text-lg font-bold text-[#1A2A4F]">
              {currentStatus.replace("_", " ").toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Step {currentIndex + 1} of {statuses.length}
          </span>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between pt-2">
                {statuses.map((status, idx) => {
                  const Icon = status.icon;
                  const isActive = idx <= currentIndex;
                  const isCurrent = status.key === currentStatus;

                  return (
                    <React.Fragment key={status.key}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? "bg-[#1A2A4F] text-white ring-4 ring-[#1A2A4F]/20"
                              : isActive
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={`text-[10px] mt-1 font-semibold text-center ${
                            isCurrent
                              ? "text-[#1A2A4F]"
                              : isActive
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>
                      {idx < statuses.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-1 rounded ${
                            idx < currentIndex ? "bg-green-500" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Next Action Card Component
const NextActionCard = ({
  ticket,
  isProvider,
  onProposePrice,
  onAcceptPrice,
  onConfirmPayment,
  onMarkComplete,
  onCloseTicket,
  isCollapsed,
  onToggle,
}) => {
  const getNextAction = () => {
    switch (ticket.status) {
      case "open":
      case "negotiating":
        if (!ticket.agreedPrice) {
          return {
            title: "Propose a Price",
            description: "Start by proposing a price for this work",
            action: onProposePrice,
            buttonText: "Propose Price",
            icon: DollarSign,
            color: "blue",
          };
        }
        if (isProvider) {
          return {
            title: "Review Price Proposal",
            description: `₹${ticket.agreedPrice?.toLocaleString(
              "en-IN"
            )} proposed. Accept to hire the freelancer and close the gig.`,
            action: onAcceptPrice,
            buttonText: "Accept & Hire",
            icon: Check,
            color: "green",
            secondary: {
              text: "Counter Offer",
              action: onProposePrice,
            },
          };
        } else {
          return {
            title: "Waiting for Provider",
            description: `Your price of ₹${ticket.agreedPrice?.toLocaleString(
              "en-IN"
            )} is pending approval`,
            icon: Clock,
            color: "yellow",
            waiting: true,
            secondary: {
              text: "Update Price",
              action: onProposePrice,
            },
          };
        }

      case "accepted":
        if (isProvider) {
          return {
            title: "Confirm Payment",
            description: `Please confirm payment of ₹${ticket.agreedPrice?.toLocaleString(
              "en-IN"
            )} to the freelancer`,
            action: onConfirmPayment,
            buttonText: "Confirm Payment",
            icon: CreditCard,
            color: "blue",
          };
        } else {
          return {
            title: "Waiting for Payment",
            description:
              "You've been hired! Waiting for provider to confirm payment.",
            icon: Clock,
            color: "yellow",
            waiting: true,
          };
        }

      case "paid":
        if (!isProvider) {
          return {
            title: "Complete the Work",
            description:
              "Payment confirmed! Complete the work and mark it as done.",
            action: onMarkComplete,
            buttonText: "Mark as Complete",
            icon: Package,
            color: "green",
          };
        } else {
          return {
            title: "Work in Progress",
            description: "Freelancer is working on your project.",
            icon: Clock,
            color: "blue",
            waiting: true,
          };
        }

      case "completed":
        if (isProvider) {
          return {
            title: "Review & Close",
            description: "Work is complete! Review and close the ticket.",
            action: onCloseTicket,
            buttonText: "Close & Rate",
            icon: Award,
            color: "purple",
          };
        } else {
          return {
            title: "Waiting for Review",
            description: "Provider is reviewing your work.",
            icon: Clock,
            color: "yellow",
            waiting: true,
          };
        }

      case "closed":
        return {
          title: "Ticket Closed",
          description: "This ticket has been completed and closed.",
          icon: Shield,
          color: "gray",
          completed: true,
        };

      default:
        return null;
    }
  };

  const action = getNextAction();
  if (!action) return null;

  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    gray: "bg-gray-50 border-gray-200 text-gray-600",
  };

  const buttonClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
  };

  const Icon = action.icon;

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden ${
        colorClasses[action.color]
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold uppercase opacity-70">
              Next Action
            </p>
            <p className="text-lg font-bold">{action.title}</p>
          </div>
        </div>
        {isCollapsed ? (
          <ChevronDown className="h-5 w-5 opacity-50" />
        ) : (
          <ChevronUp className="h-5 w-5 opacity-50" />
        )}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="text-sm opacity-80 mb-4">{action.description}</p>

              {!action.waiting && !action.completed && action.action && (
                <div className="flex gap-2">
                  <button
                    onClick={action.action}
                    className={`flex-1 px-5 py-2.5 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      buttonClasses[action.color]
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {action.buttonText}
                  </button>
                  {action.secondary && (
                    <button
                      onClick={action.secondary.action}
                      className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                      {action.secondary.text}
                    </button>
                  )}
                </div>
              )}

              {action.waiting && action.secondary && (
                <button
                  onClick={action.secondary.action}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  {action.secondary.text}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Ticket = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core state
  const [ticket, setTicket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Message state
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Price state
  const [agreedPrice, setAgreedPrice] = useState("");
  const [showPriceInput, setShowPriceInput] = useState(false);

  // Modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rating, setRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // UI state
  const [showSidebar, setShowSidebar] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const [isStatusCollapsed, setIsStatusCollapsed] = useState(false);
  const [isActionCollapsed, setIsActionCollapsed] = useState(false);

  // Refs
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch (error) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        navigate("/login", { state: { from: `/tickets/${id}` } });
      }
    } else {
      toast.error("Please log in to view this ticket.");
      navigate("/login", { state: { from: `/tickets/${id}` } });
    }
  }, [navigate, id]);

  // Socket.IO connection
  useEffect(() => {
    if (!userId || !ticket) return;

    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
      path: "/ticket-socket",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    socket.emit("joinTicket", id);

    socket.on("newMessage", (updatedTicket) => {
      setTicket(updatedTicket);
      scrollToBottom(true);
    });

    socket.on("typing", ({ userId: typerId, userName }) => {
      if (typerId !== userId) {
        setTypingUser(userName);
        setTimeout(() => setTypingUser(null), 3000);
      }
    });

    socket.on("messagesRead", ({ ticketId, userId: readerId }) => {
      if (ticketId === id && readerId !== userId) {
        setTicket((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.senderId === userId && !msg.read ? { ...msg, read: true } : msg
          ),
        }));
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("messagesRead");
      socket.disconnect();
    };
  }, [userId, id, ticket]);

  // Fetch ticket data
  useEffect(() => {
    if (!userId) return;

    const fetchTicket = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTicket(data);
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 100);
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.error || "Failed to load ticket";
        toast.error(message);
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          navigate("/login", { state: { from: `/tickets/${id}` } });
        }
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, userId, navigate]);

  // Mark messages as read
  useEffect(() => {
    if (!ticket || !userId) return;
    const markAsRead = async () => {
      try {
        await axios.patch(
          `${API_BASE}/tickets/${id}/messages/read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        socketRef.current?.emit("markMessagesRead", id);
      } catch (error) {
        // Silent fail
      }
    };
    markAsRead();
  }, [ticket, userId, id]);

  // Typing indicator
  useEffect(() => {
    if (message && socketRef.current && ticket) {
      const userName =
        userId === ticket.freelancerId?._id
          ? ticket.freelancerId.fullName
          : ticket.providerId?.fullName;

      socketRef.current.emit("typing", {
        ticketId: id,
        userId,
        userName,
      });
    }
  }, [message, id, userId, ticket]);

  // Search functionality
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query) return;
      setIsSearching(true);
      try {
        const { data } = await axios.get(
          `${API_BASE}/tickets/${id}/messages/search`,
          {
            params: { query },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTicket((prev) => ({ ...prev, messages: data.messages }));
        toast.success(`Found ${data.messages.length} message(s)`);
      } catch (error) {
        toast.error("Search failed. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [id]
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else if (ticket) {
      const refetchTicket = async () => {
        try {
          const { data } = await axios.get(`${API_BASE}/tickets/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setTicket(data);
        } catch (error) {
          // Silent fail
        }
      };
      refetchTicket();
    }
  }, [searchQuery, debouncedSearch, id]);

  // Utility functions
  const scrollToBottom = (smooth = true) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    }, 100);
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(
      regex,
      '<mark class="bg-yellow-300 text-gray-900 px-1 rounded">$1</mark>'
    );
  };

  // Message handlers
  const handleSendMessage = async () => {
    if (!message.trim() && !file) {
      toast.error("Please enter a message or attach a file.");
      return;
    }
    setIsSending(true);
    try {
      const endpoint = file
        ? `${API_BASE}/tickets/${id}/messages/attachment`
        : `${API_BASE}/tickets/${id}/messages`;

      const formData = new FormData();
      if (message.trim()) formData.append("content", message);
      if (file) formData.append("attachment", file);

      const { data } = await axios.post(
        endpoint,
        file ? formData : { content: message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": file ? "multipart/form-data" : "application/json",
          },
        }
      );
      setTicket(data.ticket);
      setMessage("");
      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom(true);
      toast.success("Message sent!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be 5MB or less");
      return;
    }
    setFile(selectedFile);
    setFilePreview(
      selectedFile.type.startsWith("image/")
        ? URL.createObjectURL(selectedFile)
        : null
    );
  };

  // Price handlers
  const handleProposePrice = async () => {
    if (!agreedPrice || parseFloat(agreedPrice) <= 0) {
      toast.error("Please enter a valid price amount");
      return;
    }
    try {
      const { data } = await axios.patch(
        `${API_BASE}/tickets/${id}/price`,
        { agreedPrice: parseFloat(agreedPrice) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(data.ticket);
      setAgreedPrice("");
      setShowPriceInput(false);
      toast.success("Price proposed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to propose price");
    }
  };

  const handleAcceptPrice = async () => {
    setConfirmAction({
      title: "Accept Price & Hire Freelancer",
      message: `By accepting ₹${ticket.agreedPrice?.toLocaleString(
        "en-IN"
      )}, you will:

• Hire this freelancer for the job
• Close the gig to new applications
• Reject all other pending applications

This action cannot be undone.`,
      action: async () => {
        try {
          const { data } = await axios.patch(
            `${API_BASE}/tickets/${id}/accept-price`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setTicket(data.ticket);
          toast.success(
            "Freelancer hired! Gig closed. Please proceed with payment."
          );
        } catch (error) {
          toast.error(error.response?.data?.error || "Failed to accept price");
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  // Payment handler
  const handleConfirmPayment = async () => {
    setConfirmAction({
      title: "Confirm Payment",
      message: `Please confirm that you have paid ₹${ticket.agreedPrice?.toLocaleString(
        "en-IN"
      )} to the Freelancer.

After confirmation, the freelancer will be notified to start the work.`,
      action: async () => {
        try {
          const { data } = await axios.patch(
            `${API_BASE}/tickets/${id}/paid`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setTicket(data.ticket);
          toast.success("Payment confirmed! Freelancer can now start working.");
        } catch (error) {
          toast.error(
            error.response?.data?.error || "Failed to confirm payment"
          );
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  // Completion handler
  const handleMarkComplete = async () => {
    setConfirmAction({
      title: "Mark Work as Complete",
      message:
        "Are you sure you have completed all the work? The provider will be notified to review and close the ticket.",
      action: async () => {
        try {
          const { data } = await axios.patch(
            `${API_BASE}/tickets/${id}/complete`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setTicket(data.ticket);
          toast.success(
            "Work marked as complete! Waiting for provider review."
          );
        } catch (error) {
          toast.error(
            error.response?.data?.error || "Failed to mark as complete"
          );
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  // Close ticket handler
  const handleCloseTicket = async () => {
    const isProvider = userId === ticket.providerId?._id;
    if (isProvider && ticket.status === "completed" && rating === 0) {
      setIsRatingModalOpen(true);
      return;
    }
    setIsSubmittingRating(true);
    try {
      const payload = isProvider && rating ? { rating } : {};
      const { data } = await axios.patch(
        `${API_BASE}/tickets/${id}/close`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(data.ticket);
      setIsRatingModalOpen(false);
      setRating(0);
      toast.success("Ticket closed successfully!");
      setTimeout(() => navigate("/gigs"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to close ticket");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Status helpers
  const getStatusColor = (status) => {
    const colors = {
      open: "bg-blue-100 text-blue-800 border-blue-200",
      negotiating: "bg-purple-100 text-purple-800 border-purple-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      paid: "bg-cyan-100 text-cyan-800 border-cyan-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      closed: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: Unlock,
      negotiating: TrendingUp,
      accepted: CheckCircle,
      paid: CreditCard,
      completed: Package,
      closed: Shield,
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1A2A4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-semibold">
            Loading ticket...
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-gray-200">
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ticket Not Found
          </h2>
          <button
            onClick={() => navigate("/gigs")}
            className="w-full px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:bg-[#2A3A5F] font-semibold transition-all"
          >
            Back to Gigs
          </button>
        </div>
      </div>
    );
  }

  const isProvider = userId === ticket.providerId?._id;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-[#1A2A4F] hover:bg-gray-100 rounded-xl transition-all flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[#1A2A4F] truncate">
                {ticket.gigId?.title || "Ticket"}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {getStatusIcon(ticket.status)}
                  {ticket.status.replace("_", " ").toUpperCase()}
                </span>
                {ticket.agreedPrice && (
                  <span className="text-sm font-bold text-green-600">
                    ₹{ticket.agreedPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDetailsModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#1A2A4F] rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm"
            >
              <Info className="h-4 w-4" />
              <span className="hidden md:inline">Details</span>
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#1A2A4F] hover:bg-gray-100 rounded-xl transition-all"
            >
              <Users className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Collapsible Status & Action Section */}
          <div className="px-4 sm:px-6 py-3 bg-white border-b border-gray-100 space-y-3">
            <StatusFlow
              currentStatus={ticket.status}
              isCollapsed={isStatusCollapsed}
              onToggle={() => setIsStatusCollapsed(!isStatusCollapsed)}
            />

            {ticket.status !== "closed" && (
              <NextActionCard
                ticket={ticket}
                isProvider={isProvider}
                onProposePrice={() => setShowPriceInput(true)}
                onAcceptPrice={handleAcceptPrice}
                onConfirmPayment={handleConfirmPayment}
                onMarkComplete={handleMarkComplete}
                onCloseTicket={handleCloseTicket}
                isCollapsed={isActionCollapsed}
                onToggle={() => setIsActionCollapsed(!isActionCollapsed)}
              />
            )}
          </div>

          {/* Search Bar */}
          <div className="px-4 sm:px-6 py-3 bg-white border-b-2 border-gray-200 flex-shrink-0">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 text-sm font-medium transition-all bg-gray-50"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[#1A2A4F] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {searchQuery && !isSearching && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50"
          >
            {ticket.messages?.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xl font-bold text-gray-700 mb-2">
                    No messages yet
                  </p>
                  <p className="text-gray-500">
                    Start the conversation by sending a message
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {ticket.messages.map((msg, idx) => {
                  const isOwn = msg.senderId === userId;
                  const isSystem = msg.senderId === "system";
                  const showAvatar =
                    idx === 0 ||
                    ticket.messages[idx - 1].senderId !== msg.senderId;

                  if (isSystem) {
                    return (
                      <div key={msg._id} className="flex justify-center my-4">
                        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full border border-gray-200">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOwn && showAvatar && (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                          {msg.senderName?.charAt(0) || "U"}
                        </div>
                      )}
                      {!isOwn && !showAvatar && (
                        <div className="w-10 flex-shrink-0" />
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] group relative ${
                          isOwn ? "items-end" : "items-start"
                        } flex flex-col`}
                      >
                        {!isOwn && showAvatar && (
                          <p className="text-xs font-bold text-gray-600 mb-1 ml-4">
                            {msg.senderName}
                          </p>
                        )}
                        <div
                          className={`relative px-4 py-3 rounded-2xl shadow-md text-sm ${
                            isOwn
                              ? "bg-[#1A2A4F] text-white rounded-br-md"
                              : "bg-white text-gray-800 border-2 border-gray-200 rounded-bl-md"
                          }`}
                        >
                          <p
                            dangerouslySetInnerHTML={{
                              __html: highlightText(msg.content, searchQuery),
                            }}
                            className="break-words leading-relaxed whitespace-pre-wrap"
                          />

                          {msg.attachment && (
                            <div className="mt-3">
                              {msg.attachment.match(
                                /\.(jpg|jpeg|png|gif|webp)$/i
                              ) ? (
                                <img
                                  src={msg.attachment}
                                  alt="Attachment"
                                  className="max-w-full h-auto rounded-xl max-h-64 cursor-pointer border-2 border-white/20 hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(msg.attachment, "_blank")
                                  }
                                />
                              ) : (
                                <a
                                  href={msg.attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 text-xs underline p-3 rounded-lg font-medium transition-all ${
                                    isOwn
                                      ? "bg-white/10 hover:bg-white/20"
                                      : "bg-gray-100 hover:bg-gray-200"
                                  }`}
                                >
                                  <File className="h-4 w-4" />
                                  <span className="truncate">
                                    View Attachment
                                  </span>
                                </a>
                              )}
                            </div>
                          )}

                          <div
                            className={`flex items-center justify-between mt-2 text-xs font-medium gap-2 ${
                              isOwn ? "text-white/70" : "text-gray-500"
                            }`}
                          >
                            <span>
                              {moment(msg.timestamp).format("h:mm A")}
                            </span>
                            {isOwn && msg.read && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isOwn && showAvatar && (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                          {ticket[
                            isProvider ? "providerId" : "freelancerId"
                          ]?.fullName?.charAt(0) || "Y"}
                        </div>
                      )}
                      {isOwn && !showAvatar && (
                        <div className="w-10 flex-shrink-0" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {typingUser && (
              <div className="flex items-center gap-3 text-sm text-gray-600 mt-4 max-w-4xl mx-auto">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-[#1A2A4F] rounded-full animate-bounce"></div>
                  <div
                    className="h-2 w-2 bg-[#1A2A4F] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-[#1A2A4F] rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span className="italic font-medium">
                  {typingUser} is typing...
                </span>
              </div>
            )}
          </div>

          {/* Message Input */}
          {ticket.status !== "closed" ? (
            <div className="border-t-2 border-gray-200 bg-white p-4 sm:p-6 flex-shrink-0">
              <div className="max-w-4xl mx-auto">
                {/* Price Proposal Input */}
                {showPriceInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        <label className="text-sm font-bold text-blue-900">
                          Propose Your Price
                        </label>
                      </div>
                      <button
                        onClick={() => {
                          setShowPriceInput(false);
                          setAgreedPrice("");
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={agreedPrice}
                          onChange={(e) => setAgreedPrice(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-lg"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={handleProposePrice}
                        disabled={!agreedPrice || parseFloat(agreedPrice) <= 0}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </button>
                    </div>
                    {ticket.gigId?.price && (
                      <p className="text-xs text-blue-600 mt-2">
                        Original budget: ₹
                        {ticket.gigId.price.toLocaleString("en-IN")}
                      </p>
                    )}
                  </motion.div>
                )}

                {file && (
                  <div className="mb-4 bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="h-14 w-14 object-cover rounded-lg border-2 border-gray-300"
                          />
                        ) : (
                          <div className="h-14 w-14 bg-gray-200 rounded-lg flex items-center justify-center">
                            <File className="h-7 w-7 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setFilePreview(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2 sm:gap-3">
                  <textarea
                    ref={messageInputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows="1"
                    className="flex-1 p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 text-sm font-medium resize-none max-h-32 transition-all bg-white"
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 sm:p-4 bg-gray-100 hover:bg-gray-200 rounded-xl border-2 border-gray-300 transition-all flex-shrink-0"
                  >
                    <Paperclip className="h-5 w-5 text-gray-600" />
                  </button>

                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || (!message.trim() && !file)}
                    className="p-3 sm:p-4 bg-[#1A2A4F] hover:bg-[#2A3A5F] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-lg"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t-2 border-gray-200 bg-gray-50 p-6 text-center flex-shrink-0">
              <p className="text-sm text-gray-600 flex items-center justify-center gap-2 font-semibold">
                <Shield className="h-5 w-5" />
                This ticket is closed.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-y-0 right-0 w-full sm:w-96 z-40 lg:relative lg:inset-auto flex flex-col bg-white border-l-2 border-gray-200 lg:w-96 flex-shrink-0 shadow-2xl lg:shadow-none"
            >
              <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-[#1A2A4F] to-[#2A3A5F] text-white">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6" />
                  <h3 className="text-lg font-bold">Work Details</h3>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Participants */}
                <div className="p-6 border-b-2 border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">
                    Participants
                  </h4>
                  <div className="space-y-4">
                    {/* Provider Card */}
                    <div
                      className={`flex items-start gap-4 p-3 rounded-xl transition-colors ${
                        isProvider
                          ? "bg-blue-50 border-2 border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F] flex items-center justify-center text-white font-bold flex-shrink-0 text-lg shadow-md overflow-hidden">
                        {ticket.providerId?.profilePicture ? (
                          <img
                            src={ticket.providerId.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          ticket.providerId?.fullName?.charAt(0) || "P"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-base truncate">
                            {ticket.providerId?.fullName || "Unknown Provider"}
                          </p>
                          {isProvider && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-semibold uppercase flex items-center gap-1">
                          <Briefcase size={12} /> Provider (Payer)
                        </p>
                      </div>
                    </div>

                    {/* Freelancer Card */}
                    <div
                      className={`flex items-start gap-4 p-3 rounded-xl transition-colors ${
                        !isProvider
                          ? "bg-purple-50 border-2 border-purple-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold flex-shrink-0 text-lg shadow-md overflow-hidden">
                        {ticket.freelancerId?.profilePicture ? (
                          <img
                            src={ticket.freelancerId.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          ticket.freelancerId?.fullName?.charAt(0) || "F"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-base truncate">
                            {ticket.freelancerId?.fullName ||
                              "Unknown Freelancer"}
                          </p>
                          {!isProvider && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-semibold uppercase flex items-center gap-1">
                          <Laptop size={12} /> Freelancer (Worker)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="p-6 border-b-2 border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">
                    Financial Details
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Original Budget
                      </p>
                      <p className="text-xl font-bold text-gray-700">
                        ₹{ticket.gigId?.price?.toLocaleString("en-IN") || "N/A"}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border-2 border-green-100">
                      <p className="text-xs font-bold text-green-700 uppercase mb-1">
                        Agreed Amount
                      </p>
                      <p className="text-2xl font-black text-green-800">
                        {ticket.agreedPrice
                          ? `₹${ticket.agreedPrice.toLocaleString("en-IN")}`
                          : "Not set yet"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gig Info */}
                <div className="p-6">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">
                    Gig Information
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-bold text-gray-900 mb-2">
                      {ticket.gigId?.title || "Untitled Gig"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Lock className="h-4 w-4" />
                      <span>
                        Gig Status:{" "}
                        <span className="font-semibold capitalize">
                          {ticket.gigId?.status || "Unknown"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 border-t-2 border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(true);
                    setShowSidebar(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                >
                  <Info className="h-5 w-5" />
                  View Full Details
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="light"
      />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setIsConfirmModalOpen(false);
              setConfirmAction(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-[#1A2A4F]">
                  {confirmAction.title}
                </h3>
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setConfirmAction(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
                {confirmAction.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setConfirmAction(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await confirmAction.action();
                    setIsConfirmModalOpen(false);
                    setConfirmAction(null);
                  }}
                  className="flex-1 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:bg-[#2A3A5F] font-semibold transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {isRatingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsRatingModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-[#1A2A4F]">
                  Rate the Freelancer
                </h3>
                <button
                  onClick={() => setIsRatingModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                How was your experience working with{" "}
                {ticket.freelancerId?.fullName}? Your feedback helps our
                community.
              </p>
              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-12 w-12 transition-all ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-gray-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsRatingModalOpen(false);
                    setRating(0);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseTicket}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:bg-[#2A3A5F] font-semibold transition-all disabled:opacity-50"
                >
                  {isSubmittingRating ? "Submitting..." : "Submit & Close"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsDetailsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-[#1A2A4F]">
                  Ticket Details
                </h3>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status Timeline */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3">
                    Status Timeline
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {ticket.timeline?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#1A2A4F] mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.action}
                          </p>
                          <p className="text-xs text-gray-500">
                            {moment(item.timestamp).format(
                              "MMM D, YYYY h:mm A"
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gig Info */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">Gig Details</h4>
                  <p className="font-semibold text-gray-900">
                    {ticket.gigId?.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Original Budget: ₹
                    {ticket.gigId?.price?.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Gig Status:{" "}
                    <span className="font-semibold capitalize">
                      {ticket.gigId?.status}
                    </span>
                  </p>
                </div>

                {/* Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-bold text-gray-900">Provider</p>
                    <p className="text-sm text-gray-600">
                      {ticket.providerId?.fullName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {ticket.providerId?.email}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-bold text-gray-900">Freelancer</p>
                    <p className="text-sm text-gray-600">
                      {ticket.freelancerId?.fullName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {ticket.freelancerId?.email}
                    </p>
                  </div>
                </div>

                {/* Financial */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <h4 className="font-bold text-green-900 mb-2">
                    Financial Summary
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Agreed Price:</span>
                    <span className="text-2xl font-black text-green-800">
                      {ticket.agreedPrice
                        ? `₹${ticket.agreedPrice.toLocaleString("en-IN")}`
                        : "Not set"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ticket;
