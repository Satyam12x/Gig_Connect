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
} from "lucide-react";
import io from "socket.io-client";
import { debounce } from "lodash";
import moment from "moment";

// Use Environment Variables
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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

    // Prevent double connection
    if (socketRef.current && socketRef.current.connected) return;

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
      // Refetch to restore original messages if search cleared
      const refetchTicket = async () => {
        try {
          const { data } = await axios.get(`${API_BASE}/tickets/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setTicket(data);
        } catch (error) {
          /* Silent */
        }
      };
      refetchTicket();
    }
  }, [searchQuery, debouncedSearch, id]);

  // Scroll Utility
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

  // Handlers
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

  // --- CRITICAL FIX: Accept Price & Applicant ---
  const handleAcceptPrice = async () => {
    setConfirmAction({
      title: "Hire Freelancer",
      message: `Are you sure you want to hire ${
        ticket.freelancerId?.fullName
      } for ₹${ticket.agreedPrice?.toLocaleString(
        "en-IN"
      )}? \n\nThis will:\n1. Change Gig status to "In Progress"\n2. Reject all other applicants\n3. Allow you to proceed with payment.`,
      action: async () => {
        try {
          // CALLING THE CORRECT ENDPOINT
          const { data } = await axios.patch(
            `${API_BASE}/tickets/${id}/accept-price-and-applicant`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setTicket(data.ticket);
          toast.success("Freelancer Hired! Gig is now In Progress.");
        } catch (error) {
          toast.error(
            error.response?.data?.error || "Failed to hire freelancer"
          );
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handleCounterOffer = () => {
    setShowPriceInput(true);
    setTimeout(() => {
      const inputElement = document.querySelector('input[type="number"]');
      if (inputElement) inputElement.focus();
    }, 100);
  };

  const handleConfirmPayment = async () => {
    setConfirmAction({
      title: "Confirm Payment",
      message: `Please confirm that you have paid ₹${ticket.agreedPrice?.toLocaleString(
        "en-IN"
      )} to the Freelancer.`,
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
          toast.success("Payment confirmed! Work can begin.");
        } catch (error) {
          toast.error(
            error.response?.data?.error || "Failed to confirm payment"
          );
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handleMarkComplete = async () => {
    setConfirmAction({
      title: "Mark as Complete",
      message:
        "Are you sure the work is complete? This will notify the Provider for final review.",
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
          toast.success("Marked as complete! Waiting for Provider review.");
        } catch (error) {
          toast.error(
            error.response?.data?.error || "Failed to mark as complete"
          );
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  // --- CLOSE & ARCHIVE LOGIC ---
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
      toast.success("Gig Archived & Ticket Closed.");
      // Redirect after closing because the original Gig ID is deleted
      setTimeout(() => navigate("/tickets"), 2000);
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

  const getActionButtons = () => {
    if (!ticket || ticket.status === "closed") return [];
    const isProvider = userId === ticket.providerId?._id;
    const isFreelancer = userId === ticket.freelancerId?._id;
    const actions = [];

    if (["open", "negotiating"].includes(ticket.status)) {
      actions.push({
        id: "propose-price",
        label: "Propose Price",
        icon: DollarSign,
        variant: "primary",
        onClick: () => setShowPriceInput(!showPriceInput),
      });
    }

    if (ticket.status === "accepted" && isProvider) {
      actions.push({
        id: "confirm-payment",
        label: "Confirm Payment",
        icon: DollarSign,
        variant: "primary",
        onClick: handleConfirmPayment,
      });
    }

    if (ticket.status === "paid" && isFreelancer) {
      actions.push({
        id: "mark-complete",
        label: "Mark as Complete",
        icon: Package,
        variant: "success",
        onClick: handleMarkComplete,
      });
    }

    if (ticket.status === "completed") {
      actions.push({
        id: "close-ticket",
        label: isProvider ? "Accept & Archive" : "Close Ticket",
        icon: Shield,
        variant: "secondary",
        onClick: handleCloseTicket,
      });
    }
    return actions;
  };

  const findLastPriceMessageIndex = () => {
    if (!ticket?.messages) return -1;
    for (let i = ticket.messages.length - 1; i >= 0; i--) {
      if (ticket.messages[i].content.includes("Price of ₹")) return i;
    }
    return -1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#1A2A4F] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!ticket) return <div className="text-center p-10">Ticket not found</div>;

  const isProvider = userId === ticket.providerId?._id;
  const lastPriceMsgIndex = findLastPriceMessageIndex();

  // Safe gig title incase it was archived and populated field is null
  const gigTitle = ticket.gigId?.title || "Archived Gig";

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {gigTitle}
              </h1>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  #{ticket._id.slice(-6)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-2 text-gray-600"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chat Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {ticket.messages?.map((msg, idx) => {
              const isOwn = msg.senderId === userId;
              const isLastPriceProposal = idx === lastPriceMsgIndex;
              // Only show accept button if status is open/negotiating AND user received the offer
              const showPriceActions =
                isLastPriceProposal &&
                !isOwn &&
                ["open", "negotiating"].includes(ticket.status);

              return (
                <div
                  key={msg._id || idx}
                  className={`flex gap-3 ${
                    isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isOwn && (
                    <div className="h-8 w-8 rounded-full bg-[#1A2A4F] text-white flex items-center justify-center text-xs font-bold">
                      {msg.senderName.charAt(0)}
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] ${
                      isOwn ? "items-end" : "items-start"
                    } flex flex-col`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? "bg-[#1A2A4F] text-white rounded-br-none"
                          : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p
                        dangerouslySetInnerHTML={{
                          __html: highlightText(msg.content, searchQuery),
                        }}
                        className="whitespace-pre-wrap break-words"
                      />
                      {msg.attachment && (
                        <div className="mt-2">
                          <a
                            href={msg.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs underline flex items-center gap-1"
                          >
                            <Paperclip size={12} /> Attachment
                          </a>
                        </div>
                      )}

                      {/* --- Price Action Buttons embedded in chat --- */}
                      {showPriceActions && isProvider && (
                        <div className="mt-3 pt-2 border-t border-gray-200/50 flex gap-2">
                          <button
                            onClick={handleAcceptPrice}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-3 rounded font-bold flex items-center justify-center gap-1"
                          >
                            <Check size={12} /> Accept & Hire
                          </button>
                          <button
                            onClick={handleCounterOffer}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1.5 px-3 rounded font-bold flex items-center justify-center gap-1"
                          >
                            <RefreshCw size={12} /> Counter
                          </button>
                        </div>
                      )}
                      {showPriceActions && !isProvider && (
                        <div className="mt-2 text-xs italic opacity-70">
                          Waiting for Provider to accept hire...
                        </div>
                      )}

                      <span
                        className={`text-[10px] block mt-1 ${
                          isOwn ? "text-white/70" : "text-gray-400"
                        }`}
                      >
                        {moment(msg.timestamp).format("h:mm A")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {typingUser && (
              <div className="text-xs text-gray-500 italic ml-12">
                {typingUser} is typing...
              </div>
            )}
          </div>

          {/* Input Area */}
          {ticket.status !== "closed" ? (
            <div className="bg-white border-t p-3 sm:p-4">
              {showPriceInput && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-3 bg-gray-50 p-3 rounded-lg border border-blue-200 flex gap-2 items-center"
                >
                  <DollarSign className="text-gray-500" size={16} />
                  <input
                    type="number"
                    placeholder="Enter Price Amount"
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold"
                    autoFocus
                  />
                  <button
                    onClick={handleProposePrice}
                    className="text-xs bg-[#1A2A4F] text-white px-3 py-1.5 rounded font-bold"
                  >
                    Send Offer
                  </button>
                  <button
                    onClick={() => setShowPriceInput(false)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              {file && (
                <div className="mb-2 flex items-center justify-between bg-blue-50 p-2 rounded text-sm">
                  <span className="truncate flex-1">{file.name}</span>
                  <button onClick={() => setFile(null)}>
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <textarea
                  ref={messageInputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), handleSendMessage())
                  }
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#1A2A4F]/20 resize-none"
                  rows={1}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={isSending || (!message.trim() && !file)}
                  className="p-2 bg-[#1A2A4F] text-white rounded-full disabled:opacity-50 hover:bg-[#243454]"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-100 text-center text-sm text-gray-500 font-medium">
              This ticket is closed. The gig has been archived.
            </div>
          )}
        </div>

        {/* Sidebar - Details */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-full lg:w-80 bg-white border-l shadow-xl absolute lg:relative inset-y-0 right-0 z-20 flex flex-col"
            >
              <div className="p-4 bg-[#1A2A4F] text-white flex justify-between items-center">
                <span className="font-bold flex items-center gap-2">
                  <Briefcase size={16} /> Details
                </span>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* People */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Participants
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                      {ticket.providerId?.fullName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {ticket.providerId?.fullName}
                      </p>
                      <p className="text-xs text-gray-500">Provider</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                      {ticket.freelancerId?.fullName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {ticket.freelancerId?.fullName}
                      </p>
                      <p className="text-xs text-gray-500">Freelancer</p>
                    </div>
                  </div>
                </div>

                {/* State */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Agreed Price
                  </p>
                  <p className="text-xl font-black text-[#1A2A4F]">
                    {ticket.agreedPrice
                      ? `₹${ticket.agreedPrice.toLocaleString("en-IN")}`
                      : "Negotiating"}
                  </p>
                </div>

                {/* Actions List */}
                <div className="space-y-2">
                  {getActionButtons().map((btn) => (
                    <button
                      key={btn.id}
                      onClick={btn.onClick}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${
                        btn.variant === "primary"
                          ? "bg-[#1A2A4F] text-white hover:bg-[#243454]"
                          : btn.variant === "success"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <btn.icon size={16} /> {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <ToastContainer position="top-center" />

      {/* Confirm Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">{confirmAction.title}</h3>
            <p className="text-sm text-gray-600 mb-6 whitespace-pre-wrap">
              {confirmAction.message}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-2 bg-gray-100 rounded font-bold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmAction.action();
                  setIsConfirmModalOpen(false);
                }}
                className="flex-1 py-2 bg-[#1A2A4F] text-white rounded font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">Rate Freelancer</h3>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={32}
                  className={`cursor-pointer ${
                    s <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
            <button
              onClick={handleCloseTicket}
              disabled={rating === 0}
              className="w-full py-2 bg-[#1A2A4F] text-white rounded font-bold disabled:opacity-50"
            >
              Archive Gig
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticket;
