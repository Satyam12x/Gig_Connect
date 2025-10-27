"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  AlertCircle,
  Zap,
} from "lucide-react";
import io from "socket.io-client";

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
  const [fileName, setFileName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [expandedActions, setExpandedActions] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

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
        navigate("/login");
      }
    } else {
      toast.error("Please log in to view tickets.");
      navigate("/login", { state: { from: `/tickets/${id}` } });
    }
  }, [navigate]);

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

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [userId, id]);

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
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        setLoading(false);
      }
    };

    if (userId) {
      fetchTicket();
    }
  }, [id, userId, navigate]);

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
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    if (ticket && userId) {
      markMessagesAsRead();
    }
  }, [ticket, userId, id]);

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
      setFileName("");
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
        `${API_BASE}/tickets/${id}/ai-response`,
        { content: message },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setMessage("");
      toast.success("AI response received!");
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
        { agreedPrice: Number.parseFloat(agreedPrice) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setAgreedPrice("");
      setExpandedActions(false);
      toast.success("Price proposed!");
    } catch (error) {
      console.error("Error setting price:", error);
      toast.error(error.response?.data?.error || "Failed to set price.");
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
      setExpandedActions(false);
      toast.success("Price accepted!");
    } catch (error) {
      console.error("Error accepting price:", error);
      toast.error(error.response?.data?.error || "Failed to accept price.");
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/pay`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setExpandedActions(false);
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
      setExpandedActions(false);
      toast.success("Ticket marked as completed!");
    } catch (error) {
      console.error("Error marking ticket completed:", error);
      toast.error(
        error.response?.data?.error || "Failed to mark ticket completed."
      );
    }
  };

  const handleCloseTicket = async () => {
    if (isBuyer && rating === 0) {
      setIsRatingModalOpen(true);
      return;
    }

    try {
      setIsSubmittingRating(true);
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/close`,
        isBuyer ? { rating } : {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setIsRatingModalOpen(false);
      setRating(0);
      setExpandedActions(false);
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
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const isBuyer = userId === ticket?.buyerId?._id;
  const isSeller = userId === ticket?.sellerId?._id;
  const profileUser = isBuyer ? ticket?.sellerId : ticket?.buyerId;

  const getVisibleActions = () => {
    if (!ticket) return [];

    const actions = [];

    if (
      (ticket.status === "open" || ticket.status === "negotiating") &&
      (isBuyer || isSeller)
    ) {
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
    }

    if (ticket.status === "accepted" && isBuyer && ticket.agreedPrice) {
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

    if (ticket.status === "completed" && isBuyer) {
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
      "w-full px-4 py-2.5 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2";

    const getButtonStyles = () => {
      switch (action.id) {
        case "price":
          return "bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white";
        case "accept-price":
          return "bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white";
        case "payment":
          return "bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white";
        case "complete":
          return "bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white";
        case "confirm":
          return "bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white";
        case "close":
          return "bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 text-white";
        default:
          return "bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 text-white";
      }
    };

    const getIcon = () => {
      switch (action.id) {
        case "price":
          return <DollarSign className="h-4 w-4" />;
        case "accept-price":
        case "confirm":
          return <CheckCircle className="h-4 w-4" />;
        case "payment":
          return <DollarSign className="h-4 w-4" />;
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
        case "price":
          return null;
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
      return null;
    }

    return (
      <button
        key={action.id}
        onClick={getHandler()}
        disabled={action.disabled}
        className={`${baseClasses} ${getButtonStyles()}`}
      >
        {getIcon()}
        {isSubmittingRating &&
        (action.id === "confirm" || action.id === "close") ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            {action.id === "confirm" ? "Submitting..." : "Closing..."}
          </>
        ) : (
          action.label
        )}
      </button>
    );
  };

  const getFileTypeIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const iconMap = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
    };
    return iconMap[ext] || "📎";
  };

  const getFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const renderMessageContent = (msg, isOwnMessage, isAIMessage) => {
    return (
      <>
        {!isOwnMessage && (
          <p className="text-xs font-semibold mb-2 opacity-75">
            {msg.senderName}
            {isAIMessage && " (AI)"}
          </p>
        )}
        <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>

        {msg.attachment && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-20">
            <a
              href={msg.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                isOwnMessage
                  ? "bg-blue-500 hover:bg-blue-700 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <span className="text-lg">{getFileTypeIcon(msg.attachment)}</span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold truncate max-w-xs">
                  {msg.attachment.split("/").pop()}
                </span>
              </div>
              <Paperclip className="h-3 w-3 ml-auto" />
            </a>
          </div>
        )}

        <div
          className={`text-xs mt-3 flex items-center gap-1 ${
            isOwnMessage ? "text-blue-100" : "text-slate-500"
          }`}
        >
          <span>{formatMessageTime(msg.timestamp)}</span>
          {msg.read && !isOwnMessage && <span className="ml-1">✓ Read</span>}
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="text-blue-400"
        >
          <Loader className="h-12 w-12" />
        </motion.div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md text-center border border-slate-700"
        >
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-100 text-lg font-semibold">
            Failed to load ticket
          </p>
          <button
            onClick={() => navigate("/gigs")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Gigs
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate("/gigs")}
                className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-300 flex-shrink-0"
                aria-label="Go back to gigs"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-50 truncate">
                  {ticket.gigId.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
                  Ticket ID: {ticket._id.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  ticket.status === "closed"
                    ? "bg-slate-700 text-slate-300"
                    : ticket.status === "completed"
                    ? "bg-emerald-900 text-emerald-200"
                    : ticket.status === "paid"
                    ? "bg-blue-900 text-blue-200"
                    : ticket.status === "accepted"
                    ? "bg-purple-900 text-purple-200"
                    : "bg-amber-900 text-amber-200"
                }`}
              >
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 h-full">
            {/* Chat Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 bg-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col border border-slate-700"
            >
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-slate-800">
                <AnimatePresence>
                  {ticket.messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-full text-slate-500"
                    >
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    ticket.messages.map((msg, index) => {
                      const isOwnMessage = msg.senderId === userId;
                      const isAIMessage = msg.senderId === "AI";
                      const prevMsg =
                        index > 0 ? ticket.messages[index - 1] : null;
                      const isSameSender =
                        prevMsg && prevMsg.senderId === msg.senderId;
                      const showSenderInfo = !isSameSender;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          } ${isSameSender ? "mt-1" : "mt-3 sm:mt-4"}`}
                        >
                          <div
                            className={`max-w-xs px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm ${
                              isOwnMessage
                                ? "bg-blue-600 text-white rounded-br-none"
                                : isAIMessage
                                ? "bg-purple-900 text-purple-100 rounded-bl-none border border-purple-700"
                                : "bg-slate-700 text-slate-100 border border-slate-600 rounded-bl-none"
                            }`}
                          >
                            {showSenderInfo && !isOwnMessage && (
                              <p className="text-xs font-semibold mb-1 sm:mb-2 opacity-75">
                                {msg.senderName}
                                {isAIMessage && " (AI)"}
                              </p>
                            )}
                            {renderMessageContent(
                              msg,
                              isOwnMessage,
                              isAIMessage
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {ticket.status !== "closed" && (
                <div className="border-t border-slate-700 bg-slate-800 p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between bg-blue-900 border border-blue-700 rounded-lg p-2 sm:p-3"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="text-lg flex-shrink-0">
                          {getFileTypeIcon(fileName)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-blue-100 truncate">
                            {fileName}
                          </p>
                          <p className="text-xs text-blue-300">
                            {getFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setFileName("");
                        }}
                        className="text-blue-300 hover:text-blue-100 flex-shrink-0 p-1"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}

                  <div className="flex gap-2">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message... (Ctrl+Enter to send)"
                      className="flex-1 p-2 sm:p-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm bg-slate-700 text-slate-100 placeholder-slate-400"
                      rows="3"
                      aria-label="Message input"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <label className="flex items-center justify-center px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg cursor-pointer transition text-sm flex-shrink-0">
                      <Paperclip className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Attach</span>
                      <span className="sm:hidden">File</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        aria-label="Attach file"
                      />
                    </label>

                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || (!message.trim() && !file)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition font-medium text-sm"
                      aria-label="Send message"
                    >
                      {isSending ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Send</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleAIResponse}
                      disabled={isSending || !message.trim()}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg transition font-medium text-sm flex items-center justify-center gap-1"
                      aria-label="Get AI assistance"
                    >
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">AI Assist</span>
                      <span className="sm:hidden">AI</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-3 sm:space-y-4 overflow-y-auto max-h-[600px] lg:max-h-none"
            >
              {/* User Info Card */}
              <motion.div
                className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-700"
                whileHover={{ y: -2 }}
              >
                <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3 sm:mb-4 uppercase tracking-wide">
                  {isBuyer ? "Seller" : "Buyer"}
                </h3>
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="h-10 sm:h-12 w-10 sm:w-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                    {profileUser?.fullName?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-100 text-sm truncate">
                      {profileUser?.fullName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {profileUser?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/users/${profileUser?._id}`)}
                  className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                  aria-label="View user profile"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">View Profile</span>
                  <span className="sm:hidden">Profile</span>
                </button>
              </motion.div>

              {/* Price Info Card */}
              {ticket.agreedPrice && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-emerald-900 to-emerald-800 border border-emerald-700 rounded-xl p-4 sm:p-6 shadow-lg"
                >
                  <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-2">
                    Agreed Price
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-100">
                    ₹{ticket.agreedPrice.toLocaleString()}
                  </p>
                </motion.div>
              )}

              {/* Actions Card */}
              {visibleActions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700"
                >
                  <button
                    onClick={() => setExpandedActions(!expandedActions)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-slate-700 transition border-b border-slate-700"
                    aria-expanded={expandedActions}
                    aria-label="Toggle actions menu"
                  >
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100 uppercase tracking-wide">
                      Actions
                    </h3>
                    <motion.div
                      animate={{ rotate: expandedActions ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedActions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 border-t border-slate-700">
                          {/* Price Action */}
                          {visibleActions.some((a) => a.id === "price") && (
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                                Propose Price (₹)
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={agreedPrice}
                                  onChange={(e) =>
                                    setAgreedPrice(e.target.value)
                                  }
                                  placeholder="Enter amount"
                                  className="flex-1 px-2 sm:px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-700 text-slate-100 placeholder-slate-400"
                                  min="0"
                                  step="0.01"
                                  aria-label="Price input"
                                />
                                <button
                                  onClick={handleSetPrice}
                                  className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm flex items-center gap-1 flex-shrink-0"
                                  aria-label="Set price"
                                >
                                  <DollarSign className="h-4 w-4" />
                                  <span className="hidden sm:inline">Set</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {visibleActions
                            .filter((a) => a.id !== "price")
                            .map((action) => renderActionButton(action))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Timeline Card */}
              {ticket.timeline && ticket.timeline.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-700"
                >
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-100 uppercase tracking-wide mb-3 sm:mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    Timeline
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {ticket.timeline.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-2 sm:gap-3"
                      >
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-500 rounded-full mt-1" />
                          {index < ticket.timeline.length - 1 && (
                            <div className="h-6 sm:h-8 w-0.5 bg-slate-700 my-0.5 sm:my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-1 sm:pb-2 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-slate-100">
                            {event.action}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isRatingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-700"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mb-2">
                Rate Your Experience
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mb-6">
                How was your experience with{" "}
                <span className="font-semibold">
                  {isBuyer ? ticket.sellerId.fullName : ticket.buyerId.fullName}
                </span>
                ?
              </p>

              <div className="flex justify-center gap-2 sm:gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRating(star)}
                    className="focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-full p-1"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-8 sm:h-10 w-8 sm:w-10 transition ${
                        rating >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-600"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsRatingModalOpen(false);
                    setRating(0);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition font-medium text-sm"
                  aria-label="Cancel rating"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseTicket}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                  aria-label="Submit rating"
                >
                  {isSubmittingRating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4" />
                      <span className="hidden sm:inline">Submit Rating</span>
                      <span className="sm:hidden">Submit</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ticket;
