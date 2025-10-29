import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Send,
  Paperclip,
  ArrowLeft,
  Clock,
  DollarSign,
  CheckCircle,
  Star,
  X,
  Loader,
  MessageSquare,
  User,
  Menu,
  Info,
} from "lucide-react";
import io from "socket.io-client";
import { debounce } from "lodash";
import moment from "moment";

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000/ticket-socket";

const Ticket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Bouncy scroll animation
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);

  // Authenticate user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        navigate("/login", { state: { from: `/tickets/${id}` } });
      }
    } else {
      toast.error("Please log in to view tickets.");
      navigate("/login", { state: { from: `/tickets/${id}` } });
    }
  }, [navigate, id]);

  // Socket.io setup
  useEffect(() => {
    if (userId && ticket) {
      socketRef.current = io(SOCKET_URL, {
        auth: { token: localStorage.getItem("token") },
      });

      socketRef.current.emit("joinTicket", id);

      const handleNewMessage = (updatedTicket) => {
        setTicket(updatedTicket);
        scrollToBottom();
      };

      const handleTyping = ({ userId: typerId, userName }) => {
        if (typerId !== userId) {
          setTypingUser(userName);
          setTimeout(() => setTypingUser(null), 3000);
        }
      };

      const handleMessagesRead = ({ ticketId, userId: readerId }) => {
        if (ticketId === id && readerId !== userId) {
          setTicket((prev) => ({
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.senderId === userId && !msg.read
                ? { ...msg, read: true }
                : msg
            ),
          }));
        }
      };

      socketRef.current.on("newMessage", handleNewMessage);
      socketRef.current.on("typing", handleTyping);
      socketRef.current.on("messagesRead", handleMessagesRead);

      return () => {
        socketRef.current.off("newMessage", handleNewMessage);
        socketRef.current.off("typing", handleTyping);
        socketRef.current.off("messagesRead", handleMessagesRead);
        socketRef.current.disconnect();
      };
    }
  }, [userId, id, ticket]);

  // Fetch ticket data
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTicket(response.data);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        toast.error(error.response?.data?.error || "Failed to load ticket.");
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login", { state: { from: `/tickets/${id}` } });
        }
        setLoading(false);
      }
    };

    if (userId) {
      fetchTicket();
    }
  }, [id, userId, navigate]);

  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
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
        if (socketRef.current) {
          socketRef.current.emit("markMessagesRead", id);
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    if (ticket && userId) {
      markMessagesAsRead();
    }
  }, [ticket, userId, id]);

  // Handle typing event
  useEffect(() => {
    if (message && socketRef.current && ticket) {
      socketRef.current.emit("typing", {
        ticketId: id,
        userId,
        userName:
          ticket.sellerId._id === userId
            ? ticket.sellerId.fullName
            : ticket.buyerId.fullName,
      });
    }
  }, [message, id, userId, ticket]);

  // Debounced message search
  const debouncedSearch = debounce(async (query) => {
    try {
      const response = await axios.get(
        `${API_BASE}/tickets/${id}/messages/search`,
        {
          params: { query },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket({ ...ticket, messages: response.data.messages });
      toast.success("Messages filtered!");
    } catch (error) {
      console.error("Error searching messages:", error);
      toast.error(error.response?.data?.error || "Failed to search messages.");
    }
  }, 500);

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else if (ticket) {
      const fetchTicket = async () => {
        try {
          const response = await axios.get(`${API_BASE}/tickets/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setTicket(response.data);
          scrollToBottom();
        } catch (error) {
          console.error("Error resetting messages:", error);
        }
      };
      fetchTicket();
    }
  }, [searchQuery, id, ticket, debouncedSearch]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !file) {
      toast.error("Please enter a message or attach a file.");
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      if (message.trim()) formData.append("content", message);
      if (file) formData.append("attachment", file);

      const response = await axios.post(
        `${API_BASE}/tickets/${id}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": file ? "multipart/form-data" : "application/json",
          },
        }
      );
      setTicket(response.data.ticket);
      setMessage("");
      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.error || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAIResponse = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message for AI assistance.");
      return;
    }

    setIsSending(true);
    try {
      const response = await axios.post(
        `${API_BASE}/ai/chat`,
        { message },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage(response.data.response);
      toast.success("AI suggestion generated! You can edit and send it.");
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to get AI response. Please try again later."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSetPrice = async () => {
    if (!agreedPrice || isNaN(agreedPrice) || agreedPrice <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/price`,
        { agreedPrice: parseFloat(agreedPrice) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setAgreedPrice("");
      setIsMenuOpen(false);
      toast.success("Price proposed!");
    } catch (error) {
      console.error("Error setting price:", error);
      toast.error(error.response?.data?.error || "Failed to propose price.");
    }
  };

  const handleAcceptPrice = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/accept-price`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setIsMenuOpen(false);
      toast.success("Price accepted!");
    } catch (error) {
      console.error("Error accepting price:", error);
      toast.error(error.response?.data?.error || "Failed to accept price.");
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/paid`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setIsMenuOpen(false);
      toast.success("Payment confirmed!");
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error(error.response?.data?.error || "Failed to confirm payment.");
    }
  };

  const handleRequestComplete = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/request-complete`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setIsMenuOpen(false);
      toast.success("Completion request sent to the seller!");
    } catch (error) {
      console.error("Error requesting completion:", error);
      toast.error(
        error.response?.data?.error || "Failed to request completion."
      );
    }
  };

  const handleConfirmComplete = async () => {
    setIsCompletionModalOpen(true);
  };

  const handleSubmitCompletionRating = async () => {
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a valid rating between 1 and 5.");
      return;
    }

    try {
      setIsSubmittingRating(true);
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/confirm-complete`,
        { rating },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setIsCompletionModalOpen(false);
      setRating(0);
      setIsMenuOpen(false);
      toast.success("Work completion confirmed!");
    } catch (error) {
      console.error("Error confirming completion:", error);
      toast.error(
        error.response?.data?.error || "Failed to confirm completion."
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleCloseTicket = async () => {
    if (isBuyer && ticket?.status === "completed" && rating === 0) {
      setIsRatingModalOpen(true);
      return;
    }

    try {
      setIsSubmittingRating(true);
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/close`,
        isBuyer && rating ? { rating } : {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setIsRatingModalOpen(false);
      setRating(0);
      setIsMenuOpen(false);
      toast.success("Ticket closed!");
    } catch (error) {
      console.error("Error closing ticket:", error);
      toast.error(error.response?.data?.error || "Failed to close ticket.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, '<span class="bg-yellow-200">$1</span>');
  };

  // Guard against null ticket
  if (!ticket) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center border border-gray-200"
        >
          <MessageSquare className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 text-lg font-semibold">
            Failed to load ticket
          </p>
          <button
            onClick={() => navigate("/gigs")}
            className="mt-4 px-4 py-2 bg-[#1E88E5] text-white rounded-md hover:bg-[#1565C0] transition"
            aria-label="Back to gigs"
          >
            Back to Gigs
          </button>
        </motion.div>
      </div>
    );
  }

  const isBuyer = userId === ticket.buyerId?._id;
  const isSeller = userId === ticket.sellerId?._id;

  const getVisibleActions = () => {
    const actions = [];

    if (ticket.status === "open" || ticket.status === "negotiating") {
      actions.push({
        id: "price",
        label: "Propose Price",
        visible: true,
        disabled: false,
      });
    }

    if (ticket.status === "accepted" && isBuyer && ticket.agreedPrice) {
      actions.push({
        id: "accept-price",
        label: "Accept Price",
        visible: true,
        disabled: false,
      });
      actions.push({
        id: "payment",
        label: "Confirm Payment",
        visible: true,
        disabled: false,
      });
    }

    if (ticket.status === "paid" && isBuyer) {
      actions.push({
        id: "request-complete",
        label: "Request Completion",
        visible: true,
        disabled: false,
      });
    }

    if (ticket.status === "pending_completion" && isSeller) {
      actions.push({
        id: "confirm-complete",
        label: "Confirm Completion",
        visible: true,
        disabled: false,
      });
    }

    if (ticket.status === "completed") {
      actions.push({
        id: "close",
        label: isBuyer ? "Close & Rate" : "Close Ticket",
        visible: true,
        disabled: isSubmittingRating,
      });
    }

    if (
      ticket.status !== "closed" &&
      !["paid", "pending_completion", "completed"].includes(ticket.status)
    ) {
      actions.push({
        id: "close",
        label: "Close Ticket",
        visible: true,
        disabled: isSubmittingRating,
      });
    }

    return actions;
  };

  const visibleActions = getVisibleActions();

  const renderActionButton = (action) => {
    const baseClasses =
      "w-full px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition";
    const getButtonStyles = () => {
      switch (action.id) {
        case "price":
          return "bg-[#1E88E5] hover:bg-[#1565C0] disabled:bg-gray-300 text-white";
        case "accept-price":
        case "request-complete":
        case "confirm-complete":
          return "bg-[#4CAF50] hover:bg-[#43A047] disabled:bg-gray-300 text-white";
        case "payment":
          return "bg-[#0288D1] hover:bg-[#0277BD] disabled:bg-gray-300 text-white";
        case "close":
          return "bg-[#D32F2F] hover:bg-[#C62828] disabled:bg-gray-300 text-white";
        default:
          return "bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white";
      }
    };

    const getIcon = () => {
      switch (action.id) {
        case "price":
        case "payment":
          return <DollarSign className="h-4 w-4" />;
        case "accept-price":
        case "request-complete":
        case "confirm-complete":
          return <CheckCircle className="h-4 w-4" />;
        case "close":
          return <X className="h-4 w-4" />;
        default:
          return null;
      }
    };

    const getHandler = () => {
      switch (action.id) {
        case "accept-price":
          return handleAcceptPrice;
        case "payment":
          return handleConfirmPayment;
        case "request-complete":
          return handleRequestComplete;
        case "confirm-complete":
          return handleConfirmComplete;
        case "close":
          return handleCloseTicket;
        default:
          return null;
      }
    };

    if (action.id === "price") {
      return (
        <div key={action.id} className="space-y-2">
          <input
            type="number"
            value={agreedPrice}
            onChange={(e) => setAgreedPrice(e.target.value)}
            placeholder="Enter price (₹)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-sm"
            min="0"
            step="0.01"
            aria-label="Propose price"
          />
          <button
            onClick={handleSetPrice}
            disabled={!agreedPrice || isNaN(agreedPrice) || agreedPrice <= 0}
            className={`${baseClasses} ${getButtonStyles()}`}
            aria-label="Set price"
          >
            <DollarSign className="h-4 w-4" />
            Set Price
          </button>
        </div>
      );
    }

    return (
      <button
        key={action.id}
        onClick={getHandler()}
        disabled={action.disabled}
        className={`${baseClasses} ${getButtonStyles()}`}
        aria-label={action.label}
      >
        {getIcon()}
        {isSubmittingRating && action.id === "close" ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          action.label
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <Loader className="h-12 w-12 text-[#1E88E5]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/gigs")}
              className="text-gray-600 hover:text-[#1E88E5]"
              aria-label="Back to gigs"
            >
              <ArrowLeft className="h-6 w-6" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                {ticket.gigId.title}
              </h1>
              <p className="text-sm text-gray-500">
                Ticket ID: {ticket._id.slice(-8)}
              </p>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-[#1E88E5] rounded-full"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </motion.button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50"
                >
                  <div className="space-y-2">
                    {visibleActions.map((action) => renderActionButton(action))}
                    <button
                      onClick={() => {
                        setIsDetailsModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-medium text-sm flex items-center gap-2"
                      aria-label="View more details"
                    >
                      <Info className="h-4 w-4" />
                      More Details
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row gap-6">
        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col"
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-sm"
                aria-label="Search messages"
              />
            </div>
          </div>

          {/* Bouncy Scroll Container */}
          <motion.div
            ref={scrollContainerRef}
            style={{ y, scale }}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
          >
            <AnimatePresence>
              {ticket.messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-full text-gray-500"
                >
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                </motion.div>
              ) : (
                ticket.messages.map((msg) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.senderId === userId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                        msg.senderId === userId
                          ? "bg-[#1E88E5] text-white"
                          : msg.senderId === "AI"
                          ? "bg-[#EDE7F6] text-gray-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {msg.senderId !== userId && (
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {msg.senderName}
                          {msg.senderId === "AI" && " (AI)"}
                        </p>
                      )}
                      <p
                        className="text-sm"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(msg.content, searchQuery),
                        }}
                      />
                      {msg.attachment && (
                        <div className="mt-2">
                          {msg.attachment.match(/\.(jpg|jpeg|png)$/i) ? (
                            <a
                              href={msg.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={msg.attachment}
                                alt="Attachment"
                                className="max-w-full h-auto rounded-md max-h-48"
                              />
                            </a>
                          ) : (
                            <a
                              href={msg.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[#1E88E5] hover:underline text-sm"
                            >
                              <Paperclip className="h-4 w-4" />
                              {msg.attachment.split("/").pop()}
                            </a>
                          )}
                        </div>
                      )}
                      {msg.content.startsWith("Price of ₹") &&
                        isBuyer &&
                        ticket.status === "negotiating" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleAcceptPrice()}
                            className="mt-2 px-3 py-1 bg-[#4CAF50] text-white rounded-md hover:bg-[#43A047] text-sm"
                            aria-label="Accept proposed price"
                          >
                            Accept Price
                          </motion.button>
                        )}
                      <p className="text-xs text-gray-500 mt-1">
                        {moment(msg.timestamp).fromNow()}
                        {msg.read && msg.senderId !== userId && (
                          <span className="ml-2 text-[#1E88E5]">Read</span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              {typingUser && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 text-sm italic"
                >
                  {typingUser} is typing...
                </motion.p>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </motion.div>

          {ticket.status !== "closed" && (
            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-gray-100 rounded-md p-2 mb-2"
                >
                  <div className="flex items-center gap-2">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <Paperclip className="h-5 w-5 text-gray-600" />
                    )}
                    <p className="text-sm text-gray-600 truncate">
                      {file.name}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-red-500 text-sm"
                    aria-label="Remove file"
                  >
                    Remove
                  </motion.button>
                </motion.div>
              )}
              <div className="flex items-center gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message... (Enter to send)"
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-sm resize-none"
                  rows="3"
                  aria-label="Message input"
                />
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    className="hidden"
                    id="file-upload"
                    aria-label="Upload file"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSendMessage}
                    disabled={isSending || (!message.trim() && !file)}
                    className="p-3 bg-[#1E88E5] text-white rounded-md hover:bg-[#1565C0] disabled:bg-gray-300 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleAIResponse}
                    disabled={isSending || !message.trim()}
                    className="p-3 bg-[#4CAF50] text-white rounded-md hover:bg-[#43A047] disabled:bg-gray-300 disabled:cursor-not-allowed"
                    aria-label="Get AI suggestion"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Panel - Members (Owner & Applicant) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block w-80 bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User className="h-5 w-5" />
            Ticket Members
          </h3>

          {/* Owner (Seller) */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Owner (Seller)
            </p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-[#1E88E5] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {ticket.sellerId.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {ticket.sellerId.fullName}
                </p>
                <p className="text-xs text-gray-500">{ticket.sellerId.email}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/users/${ticket.sellerId._id}`)}
              className="mt-3 w-full px-3 py-2 bg-[#1E88E5] text-white rounded-md hover:bg-[#1565C0] text-sm"
            >
              View Profile
            </motion.button>
          </div>

          {/* Applicant (Buyer) */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Applicant (Buyer)
            </p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-[#43A047] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {ticket.buyerId.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {ticket.buyerId.fullName}
                </p>
                <p className="text-xs text-gray-500">{ticket.buyerId.email}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/users/${ticket.buyerId._id}`)}
              className="mt-3 w-full px-3 py-2 bg-[#43A047] text-white rounded-md hover:bg-[#388E3C] text-sm"
            >
              View Profile
            </motion.button>
          </div>

          {ticket.agreedPrice && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-600">Agreed Price</p>
              <p className="text-2xl font-bold text-[#1E88E5]">
                ₹{ticket.agreedPrice.toLocaleString()}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals remain unchanged */}
      {/* ... (Rating, Completion, Details modals) ... */}
      {/* (Keep all modals as in original) */}
    </div>
  );
};

export default Ticket;
