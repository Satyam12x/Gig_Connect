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
  Image as ImageIcon,
  Check,
  XCircle,
} from "lucide-react";
import io from "socket.io-client";
import { debounce } from "lodash";
import moment from "moment";

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

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
        // Silent fail - not critical
      }
    };

    markAsRead();
  }, [ticket, userId, id]);

  // Typing indicator
  useEffect(() => {
    if (message && socketRef.current && ticket) {
      const userName =
        userId === ticket.sellerId._id
          ? ticket.sellerId.fullName
          : ticket.buyerId.fullName;

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
      // Reset to full messages when search is cleared
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
      title: "Accept Price",
      message: `Are you sure you want to accept the price of ₹${ticket.agreedPrice?.toLocaleString(
        "en-IN"
      )}?`,
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
          toast.success("Price accepted! You can now proceed with payment.");
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
      )} to the seller.`,
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
          toast.success("Payment confirmed! Waiting for work completion.");
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
      title: "Mark as Complete",
      message:
        "Are you sure the work is complete? This will notify the buyer for final review.",
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
            "Work marked as complete! Waiting for buyer confirmation."
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
    const isBuyer = userId === ticket.buyerId?._id;

    if (isBuyer && ticket.status === "completed" && rating === 0) {
      setIsRatingModalOpen(true);
      return;
    }

    setIsSubmittingRating(true);
    try {
      const payload = isBuyer && rating ? { rating } : {};
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
      open: MessageSquare,
      negotiating: TrendingUp,
      accepted: CheckCircle,
      paid: DollarSign,
      completed: Package,
      closed: Shield,
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  // Action buttons logic
  const getActionButtons = () => {
    if (!ticket || ticket.status === "closed") return [];

    const isBuyer = userId === ticket.buyerId?._id;
    const isSeller = userId === ticket.sellerId?._id;
    const actions = [];

    // Price negotiation phase
    if (["open", "negotiating"].includes(ticket.status)) {
      actions.push({
        id: "propose-price",
        label: "Propose Price",
        icon: DollarSign,
        variant: "primary",
        onClick: () => setShowPriceInput(!showPriceInput),
      });
    }

    // Price acceptance (only for the party who didn't propose)
    if (ticket.status === "negotiating" && ticket.agreedPrice) {
      // Simple logic: buyer accepts seller's price, seller accepts buyer's price
      const lastPriceMessage = ticket.messages
        .filter((m) => m.content.includes("Price of ₹"))
        .pop();

      if (lastPriceMessage) {
        const proposerId = lastPriceMessage.senderId;
        if (proposerId !== userId) {
          actions.push({
            id: "accept-price",
            label: "Accept Price",
            icon: Check,
            variant: "success",
            onClick: handleAcceptPrice,
          });
        }
      }
    }

    // Payment confirmation (buyer only, after price accepted)
    if (ticket.status === "accepted" && isBuyer) {
      actions.push({
        id: "confirm-payment",
        label: "Confirm Payment",
        icon: DollarSign,
        variant: "primary",
        onClick: handleConfirmPayment,
      });
    }

    // Mark complete (seller only, after payment)
    if (ticket.status === "paid" && isSeller) {
      actions.push({
        id: "mark-complete",
        label: "Mark as Complete",
        icon: Package,
        variant: "success",
        onClick: handleMarkComplete,
      });
    }

    // Close ticket (both parties can close after completion)
    if (ticket.status === "completed") {
      actions.push({
        id: "close-ticket",
        label: isBuyer ? "Close & Rate" : "Close Ticket",
        icon: Shield,
        variant: "secondary",
        onClick: handleCloseTicket,
      });
    }

    return actions;
  };

  // Loading state
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

  // Error state
  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-gray-200"
        >
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ticket Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The ticket you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <button
            onClick={() => navigate("/gigs")}
            className="w-full px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:bg-[#2A3A5F] font-semibold transition-all"
          >
            Back to Gigs
          </button>
        </motion.div>
      </div>
    );
  }

  const isBuyer = userId === ticket.buyerId?._id;
  const isSeller = userId === ticket.sellerId?._id;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-[#1A2A4F] hover:bg-gray-100 rounded-xl transition-all flex-shrink-0"
              title="Go back"
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
                <span className="text-xs text-gray-500 font-medium">
                  ID: {ticket._id?.slice(-8)}
                </span>
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
              title="Toggle sidebar"
            >
              <Users className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 min-w-0">
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
                  title="Clear search"
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
                  <p className="text-sm text-gray-500">
                    Start the conversation below
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {ticket.messages.map((msg, idx) => {
                  const isOwn = msg.senderId === userId;
                  const showAvatar =
                    idx === 0 ||
                    ticket.messages[idx - 1].senderId !== msg.senderId;

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
                        className={`max-w-[70%] group relative ${
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
                            isBuyer ? "buyerId" : "sellerId"
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
                        title="Remove file"
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
                    title="Attach file"
                  >
                    <Paperclip className="h-5 w-5 text-gray-600" />
                  </button>

                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || (!message.trim() && !file)}
                    className="p-3 sm:p-4 bg-[#1A2A4F] hover:bg-[#2A3A5F] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-lg"
                    title="Send message"
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
                This ticket is closed
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
                  <Users className="h-6 w-6" />
                  <h3 className="text-lg font-bold">Ticket Info</h3>
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
                    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F] flex items-center justify-center text-white font-bold flex-shrink-0 text-lg shadow-md">
                        {ticket.buyerId?.fullName?.charAt(0) || "B"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base">
                          {ticket.buyerId?.fullName || "Buyer"}
                        </p>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Buyer
                        </p>
                        {isBuyer && (
                          <span className="inline-block mt-2 px-3 py-1 bg-[#1A2A4F] text-white rounded-lg text-xs font-bold">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold flex-shrink-0 text-lg shadow-md">
                        {ticket.sellerId?.fullName?.charAt(0) || "S"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base">
                          {ticket.sellerId?.fullName || "Seller"}
                        </p>
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Seller
                        </p>
                        {isSeller && (
                          <span className="inline-block mt-2 px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="p-6 border-b-2 border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">
                    Ticket Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border-2 ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                        Agreed Price
                      </p>
                      <p className="text-2xl font-black text-[#1A2A4F]">
                        {ticket.agreedPrice
                          ? `₹${ticket.agreedPrice.toLocaleString("en-IN")}`
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                        Created
                      </p>
                      <p className="text-gray-700 font-semibold">
                        {moment(ticket.createdAt).format(
                          "MMM D, YYYY · h:mm A"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t-2 border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="space-y-3">
                  {showPriceInput && (
                    <div className="bg-white rounded-xl p-4 border-2 border-[#1A2A4F] mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Propose Price
                      </label>
                      <div className="relative mb-3">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          value={agreedPrice}
                          onChange={(e) => setAgreedPrice(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 text-sm font-medium transition-all"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowPriceInput(false);
                            setAgreedPrice("");
                          }}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProposePrice}
                          disabled={
                            !agreedPrice || parseFloat(agreedPrice) <= 0
                          }
                          className="flex-1 px-4 py-2 bg-[#1A2A4F] text-white rounded-lg hover:bg-[#2A3A5F] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}

                  {getActionButtons().map((action) => {
                    const Icon = action.icon;
                    const variantClasses = {
                      primary: "bg-[#1A2A4F] text-white hover:bg-[#2A3A5F]",
                      success: "bg-green-600 text-white hover:bg-green-700",
                      secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
                    };

                    return (
                      <button
                        key={action.id}
                        onClick={action.onClick}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
                          variantClasses[action.variant] ||
                          variantClasses.primary
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {action.label}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(true);
                      setShowSidebar(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                  >
                    <Info className="h-5 w-5" />
                    Full Details
                  </button>
                </div>
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
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
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
                  Rate Your Experience
                </h3>
                <button
                  onClick={() => setIsRatingModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Please rate the seller before closing the ticket. Your feedback
                helps improve our community.
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
              {rating > 0 && (
                <p className="text-center text-sm font-semibold text-gray-700 mb-6">
                  You selected {rating} star{rating !== 1 ? "s" : ""}
                </p>
              )}
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
                  className="flex-1 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:bg-[#2A3A5F] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingRating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>Submit & Close</>
                  )}
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
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-6">
                {/* Gig Information */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Gig Information
                  </h4>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
                    <p className="font-bold text-gray-900 text-base mb-2">
                      {ticket.gigId?.title || "N/A"}
                    </p>
                    {ticket.gigId?.price && (
                      <p className="text-sm text-gray-600 mb-3">
                        Original Price: ₹
                        {ticket.gigId.price.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F] flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {ticket.buyerId?.fullName?.charAt(0) || "B"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Buyer</p>
                          <p className="text-sm text-gray-700 font-medium">
                            {ticket.buyerId?.fullName || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {ticket.sellerId?.fullName?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Seller</p>
                          <p className="text-sm text-gray-700 font-medium">
                            {ticket.sellerId?.fullName || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">
                      Agreed Price
                    </h4>
                    <p className="text-3xl font-black text-green-700">
                      {ticket.agreedPrice
                        ? `₹${ticket.agreedPrice.toLocaleString("en-IN")}`
                        : "Not set"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">
                      Status
                    </h4>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timeline
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                      <span className="text-gray-600 font-semibold">
                        Created:
                      </span>
                      <span className="font-bold text-gray-900">
                        {moment(ticket.createdAt).format(
                          "MMM D, YYYY · h:mm A"
                        )}
                      </span>
                    </div>
                    {ticket.updatedAt &&
                      ticket.updatedAt !== ticket.createdAt && (
                        <div className="flex justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                          <span className="text-gray-600 font-semibold">
                            Last Updated:
                          </span>
                          <span className="font-bold text-gray-900">
                            {moment(ticket.updatedAt).format(
                              "MMM D, YYYY · h:mm A"
                            )}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Workflow Progress */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Workflow Progress
                  </h4>
                  <div className="relative">
                    <div className="space-y-4">
                      {[
                        { status: "open", label: "Ticket Created" },
                        { status: "negotiating", label: "Price Negotiation" },
                        { status: "accepted", label: "Price Accepted" },
                        { status: "paid", label: "Payment Confirmed" },
                        { status: "completed", label: "Work Completed" },
                        { status: "closed", label: "Ticket Closed" },
                      ].map((step, idx) => {
                        const isActive = ticket.status === step.status;
                        const isPast =
                          [
                            "open",
                            "negotiating",
                            "accepted",
                            "paid",
                            "completed",
                            "closed",
                          ].indexOf(ticket.status) > idx;
                        const isCompleted = isPast || isActive;

                        return (
                          <div
                            key={step.status}
                            className="flex items-center gap-4"
                          >
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                isCompleted
                                  ? "bg-[#1A2A4F] text-white shadow-lg"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`font-semibold ${
                                  isActive
                                    ? "text-[#1A2A4F]"
                                    : isCompleted
                                    ? "text-gray-700"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </p>
                              {isActive && (
                                <p className="text-xs text-[#1A2A4F] font-bold">
                                  Current Step
                                </p>
                              )}
                            </div>
                            {isActive && (
                              <div className="px-3 py-1 bg-[#1A2A4F] text-white rounded-full text-xs font-bold">
                                Active
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Messages Count */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-8 w-8 text-[#1A2A4F]" />
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">
                          Total Messages
                        </p>
                        <p className="text-2xl font-black text-[#1A2A4F]">
                          {ticket.messages?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="mt-8 w-full px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:bg-[#2A3A5F] font-semibold transition-all shadow-lg"
              >
                Close Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ticket;
