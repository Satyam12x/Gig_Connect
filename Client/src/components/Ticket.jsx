import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  DollarSign,
  XCircle,
  User,
  CheckCircle,
  Star,
  Paperclip,
  Clock,
  Search,
  ArrowLeft,
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
  const [showTimeline, setShowTimeline] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

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
      toast.error("Message or file is required.");
      return;
    }

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
      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.error || "Failed to send message.");
    }
  };

  const handleAIResponse = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message for AI assistance.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/tickets/${id}/ai-response`,
        { content: message },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      toast.success("AI response received!");
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error(error.response?.data?.error || "Failed to get AI response.");
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
      toast.success("Price proposed!");
    } catch (error) {
      console.error("Error setting price:", error);
      toast.error(error.response?.data?.error || "Failed to set price.");
    }
  };

  const handleAcceptPrice = async (messageId) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/accept-price`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
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
    setFile(selectedFile);
  };

  const handleSearchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/tickets/${id}/messages/search`,
        {
          params: { query: searchQuery },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket({ ...ticket, messages: response.data.messages });
      toast.success("Messages filtered!");
    } catch (error) {
      console.error("Error searching messages:", error);
      toast.error(error.response?.data?.error || "Failed to search messages.");
    }
  };

  const handleRatingSelect = (value) => {
    setRating(value);
  };

  const isBuyer = userId === ticket?.buyerId?._id;
  const isSeller = userId === ticket?.sellerId?._id;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-600 py-10"
      >
        Loading...
      </motion.div>
    );
  }

  if (!ticket) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-red-600 py-10"
      >
        Failed to load ticket.
      </motion.div>
    );
  }

  const profileUser = isBuyer ? ticket.sellerId : ticket.buyerId;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <ToastContainer />
      {/* Gradient Background Shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#A1C2BD] to-transparent opacity-20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#1A2A4F] to-transparent opacity-20 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl font-bold text-[#1A2A4F]"
          >
            Ticket for {ticket.gigId.title}
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/gigs")}
            className="flex items-center text-[#1A2A4F] hover:text-[#A1C2BD] font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Gigs
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Ticket Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-[#A1C2BD]/20"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <p className="text-[#1A2A4F] flex items-center mb-2">
                  Seller: {ticket.sellerId.fullName}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(`/users/${ticket.sellerId._id}`)}
                    className="ml-2 text-[#A1C2BD] hover:text-[#1A2A4F] flex items-center"
                  >
                    <User className="h-4 w-4 mr-1" />
                    View Profile
                  </motion.button>
                </p>
                <p className="text-[#1A2A4F] flex items-center">
                  Buyer: {ticket.buyerId.fullName}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(`/users/${ticket.buyerId._id}`)}
                    className="ml-2 text-[#A1C2BD] hover:text-[#1A2A4F] flex items-center"
                  >
                    <User className="h-4 w-4 mr-1" />
                    View Profile
                  </motion.button>
                </p>
              </div>
              <p className="text-[#1A2A4F] mt-2 sm:mt-0">
                Status: <span className="font-medium">{ticket.status}</span>
              </p>
            </div>

            {/* Messages Section */}
            <h2 className="text-xl font-semibold text-[#1A2A4F] mb-4">
              Messages
            </h2>
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="flex-grow p-2 border border-[#A1C2BD] rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#1A2A4F]"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleSearchMessages}
                className="p-2 bg-[#A1C2BD] text-white rounded-r-md hover:bg-[#1A2A4F]"
              >
                <Search className="h-5 w-5" />
              </motion.button>
            </div>
            <div className="border border-[#A1C2BD]/20 rounded-md p-4 max-h-96 overflow-y-auto bg-white/50 backdrop-blur-sm">
              <AnimatePresence>
                {ticket.messages.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500"
                  >
                    No messages yet.
                  </motion.p>
                ) : (
                  ticket.messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                        msg.senderId === userId
                          ? "bg-[#A1C2BD]/30 ml-auto"
                          : "bg-[#1A2A4F]/10"
                      }`}
                    >
                      <p className="font-semibold text-[#1A2A4F]">
                        {msg.senderName}
                        {msg.senderId === "AI" && " (AI)"}
                      </p>
                      <p className="text-[#1A2A4F]">{msg.content}</p>
                      {msg.attachment && (
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#A1C2BD] hover:underline flex items-center mt-1"
                        >
                          <Paperclip className="h-4 w-4 mr-1" />
                          View Attachment
                        </a>
                      )}
                      {msg.content.startsWith("Price of ₹") &&
                        isBuyer &&
                        ticket.status === "negotiating" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleAcceptPrice(msg._id)}
                            className="mt-2 px-3 py-1 bg-[#1A2A4F] text-white rounded-md hover:bg-[#A1C2BD]"
                          >
                            Accept Price
                          </motion.button>
                        )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(msg.timestamp).toLocaleString()}
                        {msg.read && msg.senderId !== userId && (
                          <span className="ml-2 text-[#A1C2BD]">✓ Read</span>
                        )}
                      </p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {ticket.status !== "closed" && (
              <div className="mt-6">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-3 border border-[#A1C2BD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2A4F] bg-white/50"
                  rows="4"
                />
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <label className="flex items-center text-[#1A2A4F]">
                    <Paperclip className="h-5 w-5 mr-2" />
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="text-sm"
                    />
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-[#1A2A4F] text-white rounded-md hover:bg-[#A1C2BD] flex items-center"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Send
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAIResponse}
                    className="px-4 py-2 bg-[#A1C2BD] text-white rounded-md hover:bg-[#1A2A4F] flex items-center"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    AI Assist
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar: Actions and Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-[#A1C2BD]/20"
          >
            <h2 className="text-xl font-semibold text-[#1A2A4F] mb-4">
              Actions
            </h2>
            {(ticket.status === "open" || ticket.status === "negotiating") && (
              <div className="mb-4">
                <input
                  type="number"
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  placeholder="Enter price (₹)"
                  className="w-full p-2 border border-[#A1C2BD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2A4F] mb-2"
                  min="0"
                  step="0.01"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSetPrice}
                  className="w-full px-4 py-2 bg-[#1A2A4F] text-white rounded-md hover:bg-[#A1C2BD] flex items-center justify-center"
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Propose Price
                </motion.button>
              </div>
            )}

            {ticket.status === "accepted" && isBuyer && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmPayment}
                className="w-full px-4 py-2 bg-[#A1C2BD] text-white rounded-md hover:bg-[#1A2A4F] flex items-center justify-center mb-4"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Confirm Payment
              </motion.button>
            )}

            {ticket.status === "paid" && isSeller && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkCompleted}
                className="w-full px-4 py-2 bg-[#1A2A4F] text-white rounded-md hover:bg-[#A1C2BD] flex items-center justify-center mb-4"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Mark Completed
              </motion.button>
            )}

            {ticket.status === "completed" && isBuyer && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCloseTicket}
                className="w-full px-4 py-2 bg-[#A1C2BD] text-white rounded-md hover:bg-[#1A2A4F] flex items-center justify-center mb-4"
                disabled={isSubmittingRating}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {isSubmittingRating ? "Submitting..." : "Confirm Completion"}
              </motion.button>
            )}

            {ticket.status !== "closed" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCloseTicket}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center mb-4"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Close Ticket
              </motion.button>
            )}

            <h2 className="text-xl font-semibold text-[#1A2A4F] mb-4">
              Timeline
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowTimeline(!showTimeline)}
              className="w-full px-4 py-2 bg-[#A1C2BD] text-white rounded-md hover:bg-[#1A2A4F] flex items-center justify-center mb-4"
            >
              <Clock className="h-5 w-5 mr-2" />
              {showTimeline ? "Hide Timeline" : "Show Timeline"}
            </motion.button>
            <AnimatePresence>
              {showTimeline && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {ticket.timeline?.length === 0 ? (
                    <p className="text-gray-500">No timeline events.</p>
                  ) : (
                    ticket.timeline.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="mb-2 p-2 bg-[#1A2A4F]/10 rounded-md"
                      >
                        <p className="text-[#1A2A4F]">{event.action}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Rating Modal */}
      <AnimatePresence>
        {isRatingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-semibold text-[#1A2A4F] mb-4">
                Rate the {isBuyer ? "Seller" : "Buyer"}
              </h2>
              <p className="text-[#1A2A4F] mb-4">
                Please rate your experience with{" "}
                {isBuyer ? ticket.sellerId.fullName : ticket.buyerId.fullName}{" "}
                (1–5 stars):
              </p>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleRatingSelect(star)}
                    className={`p-2 ${
                      rating >= star ? "text-yellow-400" : "text-gray-400"
                    }`}
                  >
                    <Star
                      className="h-6 w-6"
                      fill={rating >= star ? "currentColor" : "none"}
                    />
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseTicket}
                  className="px-4 py-2 bg-[#1A2A4F] text-white rounded-md hover:bg-[#A1C2BD] disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={rating === 0 || isSubmittingRating}
                >
                  {isSubmittingRating ? "Submitting..." : "Submit Rating"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsRatingModalOpen(false);
                    setRating(0);
                  }}
                  className="px-4 py-2 bg-gray-300 text-[#1A2A4F] rounded-md hover:bg-gray-400"
                >
                  Cancel
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
