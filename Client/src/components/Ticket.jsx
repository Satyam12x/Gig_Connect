import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
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
    if (userId) {
      socketRef.current = io(SOCKET_URL, {
        auth: { token: localStorage.getItem("token") },
      });

      socketRef.current.emit("joinTicket", id);

      socketRef.current.on("newMessage", (updatedTicket) => {
        setTicket(updatedTicket);
        scrollToBottom();
      });

      socketRef.current.on("typing", ({ userId: typerId, userName }) => {
        if (typerId !== userId) {
          setTypingUser(userName);
          setTimeout(() => setTypingUser(null), 3000);
        }
      });

      socketRef.current.on("messagesRead", ({ ticketId, userId: readerId }) => {
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
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [userId, id]);

  // Fetch ticket data
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTicket(response.data);
        setLoading(false);
        scrollToBottom();
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
        socketRef.current.emit("markMessagesRead", id);
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
    if (message && socketRef.current) {
      socketRef.current.emit("typing", {
        ticketId: id,
        userId,
        userName:
          ticket?.sellerId._id === userId
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
        } catch (error) {
          console.error("Error resetting messages:", error);
        }
      };
      fetchTicket();
    }
  }, [searchQuery, id, ticket]);

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
        `${API_BASE}/tickets/${id}/messages${file ? "/attachment" : ""}`,
        file ? formData : { content: message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...(file && { "Content-Type": "multipart/form-data" }),
          },
        }
      );
      setTicket(response.data.ticket);
      setMessage("");
      setFile(null);
      setFilePreview(null);
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
      toast.error(error.response?.data?.error || "Failed to get AI response.");
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

  const handleMarkCompleted = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setIsMenuOpen(false);
      toast.success("Ticket marked as completed!");
    } catch (error) {
      console.error("Error marking ticket completed:", error);
      toast.error(
        error.response?.data?.error || "Failed to mark ticket completed."
      );
    }
  };

  const handleCloseTicket = async () => {
    if (isBuyer && ticket.status === "completed" && rating === 0) {
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

  const isBuyer = userId === ticket?.buyerId?._id;
  const isSeller = userId === ticket?.sellerId?._id;
  const profileUser = isBuyer ? ticket?.sellerId : ticket?.buyerId;

  const getVisibleActions = () => {
    if (!ticket) return [];

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

    if (ticket.status === "paid" && isSeller) {
      actions.push({
        id: "complete",
        label: "Mark Completed",
        visible: true,
        disabled: false,
      });
    }

    if (ticket.status === "completed") {
      actions.push({
        id: "confirm",
        label: "Confirm Completion",
        visible: true,
        disabled: isSubmittingRating,
      });
    }

    if (ticket.status !== "closed") {
      actions.push({
        id: "close",
        label: ticket.status === "completed" ? "Close & Rate" : "Close Ticket",
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
        case "confirm":
          return "bg-[#4CAF50] hover:bg-[#43A047] disabled:bg-gray-300 text-white";
        case "payment":
          return "bg-[#0288D1] hover:bg-[#0277BD] disabled:bg-gray-300 text-white";
        case "complete":
          return "bg-[#7B1FA2] hover:bg-[#6A1B9A] disabled:bg-gray-300 text-white";
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
        case "confirm":
        case "complete":
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
        case "complete":
          return handleMarkCompleted;
        case "confirm":
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
        {isSubmittingRating &&
        (action.id === "confirm" || action.id === "close") ? (
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
        {/* Chat Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col"
        >
          {/* Message Search */}
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                          <span className="ml-2 text-[#1E88E5]">✓ Read</span>
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
          </div>

          {/* Message Input */}
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

        {/* Sidebar (Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block w-80 bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-4"
        >
          {/* User Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              {isBuyer ? "Seller" : "Buyer"}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 bg-[#1E88E5] rounded-full flex items-center justify-center text-white font-bold">
                {profileUser?.fullName?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {profileUser?.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profileUser?.email}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/users/${profileUser?._id}`)}
              className="w-full px-3 py-2 bg-[#1E88E5] text-white rounded-md hover:bg-[#1565C0] text-sm"
              aria-label="View user profile"
            >
              View Profile
            </motion.button>
          </div>

          {/* Price Info */}
          {ticket.agreedPrice && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Agreed Price
              </h3>
              <p className="text-xl font-bold text-[#1E88E5]">
                ₹{ticket.agreedPrice.toLocaleString()}
              </p>
            </div>
          )}

          {/* Actions */}
          {visibleActions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Actions
              </h3>
              <div className="space-y-2">
                {visibleActions.map((action) => renderActionButton(action))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {ticket.timeline && ticket.timeline.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h3>
              <div className="space-y-2">
                {ticket.timeline.map((event) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 bg-[#1E88E5] rounded-full mt-1" />
                      <div className="h-8 w-0.5 bg-gray-200" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{event.action}</p>
                      <p className="text-xs text-gray-500">
                        {moment(event.timestamp).fromNow()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Details Modal (Mobile) */}
      <AnimatePresence>
        {isDetailsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Ticket Details
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-600 hover:text-[#1E88E5]"
                  aria-label="Close details"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Status
                  </h3>
                  <p className="text-sm text-gray-600 capitalize bg-gray-100 px-2 py-1 rounded inline-block">
                    {ticket.status}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {isBuyer ? "Seller" : "Buyer"}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-8 w-8 bg-[#1E88E5] rounded-full flex items-center justify-center text-white font-bold">
                      {profileUser?.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {profileUser?.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {profileUser?.email}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(`/users/${profileUser?._id}`)}
                    className="mt-2 px-3 py-1 bg-[#1E88E5] text-white rounded-md hover:bg-[#1565C0] text-sm"
                    aria-label="View user profile"
                  >
                    View Profile
                  </motion.button>
                </div>
                {ticket.agreedPrice && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Agreed Price
                    </h3>
                    <p className="text-lg font-bold text-[#1E88E5]">
                      ₹{ticket.agreedPrice.toLocaleString()}
                    </p>
                  </div>
                )}
                {ticket.timeline && ticket.timeline.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timeline
                    </h3>
                    <div className="mt-2 space-y-2">
                      {ticket.timeline.map((event) => (
                        <div key={event._id} className="flex gap-2">
                          <div className="flex flex-col items-center">
                            <div className="h-2 w-2 bg-[#1E88E5] rounded-full mt-1" />
                            <div className="h-8 w-0.5 bg-gray-200" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">
                              {event.action}
                            </p>
                            <p className="text-xs text-gray-500">
                              {moment(event.timestamp).fromNow()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Rate Your Experience
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                How was your experience with{" "}
                <span className="font-semibold">
                  {isBuyer ? ticket.sellerId.fullName : ticket.buyerId.fullName}
                </span>
                ?
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setRating(star)}
                    className="p-1"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setIsRatingModalOpen(false);
                    setRating(0);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  aria-label="Cancel rating"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleCloseTicket}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-4 py-2 bg-[#1E88E5] text-white rounded-md hover:bg-[#1565C0] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  aria-label="Submit rating"
                >
                  {isSubmittingRating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4" />
                      Submit Rating
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ticket;
