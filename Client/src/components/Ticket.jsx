import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import {
  MessageCircle,
  DollarSign,
  XCircle,
  User,
  CheckCircle,
  Star,
  Paperclip,
  Search,
  Bell,
  ArrowLeft,
  History,
  Menu,
} from "lucide-react";
import Tilt from "react-parallax-tilt";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

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
  const [attachment, setAttachment] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.id) {
          setUserId(decoded.id);
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
    } else {
      toast.error("Please log in to view tickets.");
      navigate("/login", { state: { from: `/tickets/${id}` } });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTicketAndTimeline = async () => {
      try {
        setLoading(true);
        const [ticketResponse, timelineResponse] = await Promise.all([
          axios.get(`${API_BASE}/tickets/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${API_BASE}/tickets/${id}/timeline`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        setTicket(ticketResponse.data);
        setTimeline(timelineResponse.data);
        setFilteredMessages(ticketResponse.data.messages);
        setUnreadCount(
          ticketResponse.data.messages.filter(
            (msg) => msg.senderId !== userId && !msg.read
          ).length
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ticket/timeline:", error);
        toast.error(error.response?.data?.error || "Failed to load ticket.");
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        setLoading(false);
      }
    };

    if (userId) {
      fetchTicketAndTimeline();
    }
  }, [id, userId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  useEffect(() => {
    setFilteredMessages(
      ticket?.messages.filter((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    );
  }, [searchQuery, ticket?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() && !attachment) {
      toast.error("Message or attachment required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", message);
      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await axios.post(
        `${API_BASE}/tickets/${id}/messages${attachment ? "/attachment" : ""}`,
        attachment ? formData : { content: message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...(attachment && { "Content-Type": "multipart/form-data" }),
          },
        }
      );
      setTicket(response.data.ticket);
      setMessage("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.error || "Failed to send message.");
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
      toast.success("Price accepted! Please confirm payment.");
    } catch (error) {
      console.error("Error accepting price:", error);
      toast.error(error.response?.data?.error || "Failed to accept price.");
    }
  };

  const handleNegotiatePrice = async () => {
    if (!message.trim()) {
      toast.error("Please enter a negotiation message.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/tickets/${id}/messages`,
        { content: `Negotiation: ${message}` },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setMessage("");
      toast.success("Negotiation message sent!");
    } catch (error) {
      console.error("Error sending negotiation:", error);
      toast.error(error.response?.data?.error || "Failed to send negotiation.");
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
      toast.success("Payment confirmed! Gig applications closed.");
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
      toast.success("Work marked as completed! Awaiting seller confirmation.");
    } catch (error) {
      console.error("Error marking work completed:", error);
      toast.error(
        error.response?.data?.error || "Failed to mark work completed."
      );
    }
  };

  const handleConfirmCompletion = async () => {
    if (isSeller && rating === 0) {
      setIsRatingModalOpen(true);
      return;
    }

    try {
      setIsSubmittingRating(true);
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/confirm-completion`,
        isSeller ? { rating } : {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setIsRatingModalOpen(false);
      setRating(0);
      toast.success("Completion confirmed! Credits awarded to buyer.");
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
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/close`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      toast.success("Ticket closed!");
    } catch (error) {
      console.error("Error closing ticket:", error);
      toast.error(error.response?.data?.error || "Failed to close ticket.");
    }
  };

  const handleMarkMessagesRead = async () => {
    try {
      await axios.patch(
        `${API_BASE}/tickets/${id}/messages/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUnreadCount(0);
      setTicket((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) => ({ ...msg, read: true })),
      }));
      toast.success("Messages marked as read!");
    } catch (error) {
      console.error("Error marking messages read:", error);
      toast.error(
        error.response?.data?.error || "Failed to mark messages read."
      );
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      !["image/jpeg", "image/png", "application/pdf"].includes(file.type)
    ) {
      toast.error("Only JPEG, PNG, or PDF files are allowed.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }
    setAttachment(file);
  };

  const handleRatingSelect = (value) => {
    setRating(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col relative overflow-hidden">
        <Navbar />
        <div className="absolute inset-0 z-0">
          <div
            className="absolute top-0 left-0 w-1/2 h-1/2 opacity-30"
            style={{
              background: "linear-gradient(135deg, #1E3A8A, #60A5FA)",
              clipPath:
                "path('M0,200 C100,300 300,100 400,200 S600,300 800,200')",
            }}
          ></div>
          <div
            className="absolute bottom-0 right-0 w-1/3 h-1/3 opacity-30"
            style={{
              background: "linear-gradient(45deg, #2563EB, #A5B4FC)",
              clipPath:
                "path('M0,100 C50,150 150,50 200,100 S250,150 300,100')",
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-1 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="animate-pulse max-w-4xl mx-auto"
          >
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="h-64 bg-gray-700 rounded-lg"></div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col relative overflow-hidden">
        <Navbar />
        <div className="absolute inset-0 z-0">
          <div
            className="absolute top-0 left-0 w-1/2 h-1/2 opacity-30"
            style={{
              background: "linear-gradient(135deg, #1E3A8A, #60A5FA)",
              clipPath:
                "path('M0,200 C100,300 300,100 400,200 S600,300 800,200')",
            }}
          ></div>
          <div
            className="absolute bottom-0 right-0 w-1/3 h-1/3 opacity-30"
            style={{
              background: "linear-gradient(45deg, #2563EB, #A5B4FC)",
              clipPath:
                "path('M0,100 C50,150 150,50 200,100 S250,150 300,100')",
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-1 flex items-center justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4 text-red-500"
          >
            <XCircle className="h-6 w-6" />
            <span>Failed to load ticket.</span>
            <button
              onClick={() => navigate("/tickets")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 ripple"
              style={{ backgroundColor: "#1E3A8A" }}
            >
              Back to Tickets
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const isBuyer = userId === ticket.buyerId?._id;
  const isSeller = userId === ticket.sellerId?._id;
  const profileUser = isBuyer ? ticket.sellerId : ticket.buyerId;
  const statusColor = {
    open: "#F59E0B",
    negotiating: "#F97316",
    accepted: "#2563EB",
    paid: "#6D28D9",
    completed: "#16A34A",
    closed: "#DC2626",
  }[ticket.status];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col relative overflow-hidden">
      <style>
        {`
          @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(96, 165, 250, 0.5); }
            50% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.8), 0 0 30px rgba(96, 165, 250, 0.5); }
            100% { box-shadow: 0 0 5px rgba(96, 165, 250, 0.5); }
          }
          .glass-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .glass-card:hover {
            transform: translateY(-4px);
          }
          .ripple {
            position: relative;
            overflow: hidden;
          }
          .ripple::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s;
            opacity: 0;
          }
          .ripple:active::after {
            width: 200px;
            height: 200px;
            opacity: 1;
            transition: 0s;
          }
          .fab {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 50;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .fab:hover {
            transform: scale(1.1);
          }
          .timeline-dot {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: #60A5FA;
            position: absolute;
            left: -7px;
            top: 50%;
            transform: translateY(-50%);
            transition: transform 0.3s ease;
          }
          .timeline-dot:hover {
            transform: translateY(-50%) scale(1.3);
          }
          .avatar-glow {
            box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
          }
          .highlight {
            background-color: rgba(96, 165, 250, 0.2);
            padding: 2px 4px;
            border-radius: 4px;
          }
        `}
      </style>
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-0 left-0 w-1/2 h-1/2 opacity-30"
          style={{
            background: "linear-gradient(135deg, #1E3A8A, #60A5FA)",
            clipPath:
              "path('M0,200 C100,300 300,100 400,200 S600,300 800,200')",
          }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-1/3 h-1/3 opacity-30"
          style={{
            background: "linear-gradient(45deg, #2563EB, #A5B4FC)",
            clipPath: "path('M0,100 C50,150 150,50 200,100 S250,150 300,100')",
          }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-1/4 h-1/4 opacity-20"
          style={{
            background: "linear-gradient(180deg, #4B5EAA, #1E3A8A)",
            clipPath: "path('M0,100 C50,200 150,50 200,100 S250,150 300,100')",
          }}
        ></div>
      </div>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 flex-1 relative z-10">
        {/* Sticky Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-16 z-20 bg-gray-800/80 backdrop-blur-md rounded-lg p-4 mb-6 glass-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/tickets")}
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors duration-200 ripple"
                style={{ color: "#60A5FA" }}
                data-tooltip-id="back-tooltip"
                data-tooltip-content="Back to Tickets"
              >
                <ArrowLeft className="h-5 w-5" />
                Tickets
              </button>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "#A5B4FC" }}
              >
                {ticket.gigId.title}
              </h1>
            </div>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium capitalize"
              style={{
                backgroundColor: `${statusColor}33`,
                color: statusColor,
              }}
            >
              {ticket.status}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            {/* Ticket Details */}
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
              <div className="glass-card rounded-xl p-6 mb-6 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  {profileUser?.profilePicture ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative avatar-glow"
                    >
                      <img
                        src={profileUser.profilePicture}
                        alt={profileUser.fullName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-900"
                        style={{ backgroundColor: statusColor }}
                      ></div>
                    </motion.div>
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                  <div>
                    <h2
                      className="text-xl font-semibold"
                      style={{ color: "#A5B4FC" }}
                    >
                      {isBuyer ? "Seller" : "Buyer"}: {profileUser.fullName}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() =>
                          navigate(`/users/${ticket.sellerId._id}`)
                        }
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 ripple"
                        style={{ color: "#60A5FA" }}
                        data-tooltip-id="seller-profile-tooltip"
                        data-tooltip-content="View Seller Profile"
                      >
                        <User className="h-4 w-4" />
                        Seller Profile
                      </button>
                      <button
                        onClick={() => navigate(`/users/${ticket.buyerId._id}`)}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 ripple"
                        style={{ color: "#60A5FA" }}
                        data-tooltip-id="buyer-profile-tooltip"
                        data-tooltip-content="View Buyer Profile"
                      >
                        <User className="h-4 w-4" />
                        Buyer Profile
                      </button>
                    </div>
                    {ticket.agreedPrice && (
                      <p
                        className="text-gray-400 mt-2"
                        style={{ color: "#A5B4FC" }}
                      >
                        Agreed Price:{" "}
                        {ticket.agreedPrice.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Tilt>

            {/* Messages Section */}
            <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "#A5B4FC" }}
                  >
                    Messages
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkMessagesRead}
                        className="ml-2 relative flex items-center gap-1 text-gray-400 hover:text-gray-300 ripple"
                        data-tooltip-id="mark-read-tooltip"
                        data-tooltip-content="Mark all messages as read"
                      >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      </button>
                    )}
                  </h2>
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search messages..."
                      className="w-full pl-10 p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                      style={{
                        backgroundColor: "#1E3A8A",
                        borderColor: "#4B5EAA",
                      }}
                      aria-label="Search messages"
                    />
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto pr-2">
                  <AnimatePresence>
                    {filteredMessages.length === 0 ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-gray-400"
                        style={{ color: "#A5B4FC" }}
                      >
                        {searchQuery
                          ? "No messages match your search."
                          : "No messages yet."}
                      </motion.p>
                    ) : (
                      filteredMessages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`mb-4 p-3 rounded-lg max-w-[70%] ${
                            msg.senderId === userId
                              ? "bg-indigo-700 ml-auto"
                              : "bg-gray-800"
                          }`}
                        >
                          <p
                            className="font-semibold"
                            style={{ color: "#A5B4FC" }}
                          >
                            {msg.senderName}
                          </p>
                          <p
                            className="text-gray-300"
                            style={{ color: "#A5B4FC" }}
                            dangerouslySetInnerHTML={{
                              __html: searchQuery
                                ? msg.content.replace(
                                    new RegExp(`(${searchQuery})`, "gi"),
                                    '<span class="highlight">$1</span>'
                                  )
                                : msg.content,
                            }}
                          />
                          {msg.attachment && (
                            <a
                              href={msg.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2"
                              style={{ color: "#60A5FA" }}
                            >
                              <Paperclip className="h-4 w-4" />
                              View Attachment
                            </a>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
                {ticket.status !== "closed" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <div className="flex gap-2 mb-2">
                      <textarea
                        id="message-input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                        style={{
                          backgroundColor: "#1E3A8A",
                          borderColor: "#4B5EAA",
                        }}
                        rows="3"
                        aria-label="Type message"
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ripple"
                          style={{ backgroundColor: "#2563EB" }}
                          data-tooltip-id="attach-tooltip"
                          data-tooltip-content="Attach image or PDF"
                        >
                          <Paperclip className="h-5 w-5" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAttachmentChange}
                          accept="image/jpeg,image/png,application/pdf"
                          className="hidden"
                          aria-label="Upload attachment"
                        />
                      </div>
                    </div>
                    {attachment && (
                      <p
                        className="text-sm text-gray-400 mb-2"
                        style={{ color: "#A5B4FC" }}
                      >
                        Attached: {attachment.name}
                      </p>
                    )}
                    <button
                      onClick={handleSendMessage}
                      className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ripple"
                      style={{ backgroundColor: "#2563EB" }}
                      data-tooltip-id="send-tooltip"
                      data-tooltip-content="Send message"
                    >
                      <MessageCircle className="h-5 w-5 inline mr-2" />
                      Send
                    </button>
                  </motion.div>
                )}
              </div>
            </Tilt>
          </motion.div>

          {/* Sidebar: Timeline and Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`lg:col-span-2 fixed lg:static inset-y-0 right-0 w-80 bg-gray-800/90 backdrop-blur-md p-6 z-30 transform ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            } lg:translate-x-0 transition-transform duration-300 lg:flex lg:flex-col glass-card`}
          >
            <button
              className="lg:hidden mb-4 text-indigo-400 hover:text-indigo-300 ripple"
              onClick={() => setIsSidebarOpen(false)}
              style={{ color: "#60A5FA" }}
              data-tooltip-id="close-sidebar-tooltip"
              data-tooltip-content="Close sidebar"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "#A5B4FC" }}
            >
              Ticket Timeline
            </h2>
            <div className="relative pl-6 flex-1">
              <div
                className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400"
                style={{ backgroundColor: "#60A5FA" }}
              ></div>
              <AnimatePresence>
                {timeline.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-4 relative"
                  >
                    <motion.div
                      className="timeline-dot"
                      whileHover={{ scale: 1.3 }}
                    ></motion.div>
                    <p className="text-gray-400" style={{ color: "#A5B4FC" }}>
                      <span className="font-semibold">{event.action}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-4 space-y-2">
              {(ticket.status === "open" ||
                ticket.status === "negotiating") && (
                <div>
                  <input
                    type="number"
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                    placeholder="Enter price (INR)"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-100"
                    style={{
                      backgroundColor: "#1E3A8A",
                      borderColor: "#4B5EAA",
                    }}
                    min="0"
                    step="0.01"
                    aria-label="Propose price"
                  />
                  <button
                    onClick={handleSetPrice}
                    className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 ripple mt-2"
                    style={{ backgroundColor: "#16A34A" }}
                    data-tooltip-id="propose-price-tooltip"
                    data-tooltip-content="Propose price"
                  >
                    <DollarSign className="h-5 w-5 inline mr-2" />
                    Propose Price
                  </button>
                </div>
              )}
              {ticket.status === "negotiating" &&
                isBuyer &&
                ticket.agreedPrice && (
                  <>
                    <button
                      onClick={handleAcceptPrice}
                      className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 ripple"
                      style={{ backgroundColor: "#16A34A" }}
                      data-tooltip-id="accept-price-tooltip"
                      data-tooltip-content="Accept price"
                    >
                      <CheckCircle className="h-5 w-5 inline mr-2" />
                      Accept Price
                    </button>
                    <button
                      onClick={handleNegotiatePrice}
                      className="w-full p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 ripple"
                      style={{ backgroundColor: "#F59E0B" }}
                      data-tooltip-id="negotiate-price-tooltip"
                      data-tooltip-content="Negotiate price"
                    >
                      <MessageCircle className="h-5 w-5 inline mr-2" />
                      Negotiate Price
                    </button>
                  </>
                )}
              {ticket.status === "accepted" && isBuyer && (
                <button
                  onClick={handleConfirmPayment}
                  className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ripple"
                  style={{ backgroundColor: "#6D28D9" }}
                  data-tooltip-id="confirm-payment-tooltip"
                  data-tooltip-content="Confirm payment"
                >
                  <DollarSign className="h-5 w-5 inline mr-2" />
                  Confirm Payment
                </button>
              )}
              {ticket.status === "paid" && isBuyer && (
                <button
                  onClick={handleMarkCompleted}
                  className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ripple"
                  style={{ backgroundColor: "#2563EB" }}
                  data-tooltip-id="mark-completed-tooltip"
                  data-tooltip-content="Mark work completed"
                >
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  Mark Work Completed
                </button>
              )}
              {ticket.status === "completed" && isSeller && (
                <button
                  onClick={handleConfirmCompletion}
                  className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 ripple"
                  style={{ backgroundColor: "#16A34A" }}
                  disabled={isSubmittingRating}
                  data-tooltip-id="confirm-completion-tooltip"
                  data-tooltip-content="Confirm completion"
                >
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  {isSubmittingRating ? "Submitting..." : "Confirm Completion"}
                </button>
              )}
              {ticket.status !== "closed" && (
                <button
                  onClick={handleCloseTicket}
                  className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 ripple"
                  style={{ backgroundColor: "#DC2626" }}
                  data-tooltip-id="close-ticket-tooltip"
                  data-tooltip-content="Close ticket"
                >
                  <XCircle className="h-5 w-5 inline mr-2" />
                  Close Ticket
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Floating Action Button (Mobile) */}
        {ticket.status !== "closed" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fab lg:hidden"
          >
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 ripple"
              style={{ backgroundColor: "#2563EB" }}
              data-tooltip-id="fab-tooltip"
              data-tooltip-content="Open actions"
            >
              <Menu className="h-6 w-6" />
            </button>
          </motion.div>
        )}

        {/* Rating Modal */}
        {isRatingModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
              <div className="glass-card rounded-lg p-6 max-w-md w-full">
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "#A5B4FC" }}
                >
                  Rate the Buyer
                </h2>
                <p className="text-gray-400 mb-4" style={{ color: "#A5B4FC" }}>
                  Please rate your experience with {ticket.buyerId.fullName}{" "}
                  (1–5 stars):
                </p>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => handleRatingSelect(star)}
                      className={`p-2 ${
                        rating >= star ? "text-yellow-400" : "text-gray-400"
                      }`}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className="h-6 w-6"
                        fill={rating >= star ? "currentColor" : "none"}
                      />
                    </motion.button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleConfirmCompletion}
                    className="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 ripple disabled:bg-gray-600 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#16A34A" }}
                    disabled={rating === 0 || isSubmittingRating}
                    data-tooltip-id="submit-rating-tooltip"
                    data-tooltip-content="Submit rating"
                  >
                    {isSubmittingRating ? "Submitting..." : "Submit Rating"}
                  </button>
                  <button
                    onClick={() => {
                      setIsRatingModalOpen(false);
                      setRating(0);
                    }}
                    className="flex-1 p-3 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 ripple"
                    data-tooltip-id="cancel-rating-tooltip"
                    data-tooltip-content="Cancel rating"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Tilt>
          </motion.div>
        )}

        {/* Tooltips */}
        <Tooltip id="back-tooltip" />
        <Tooltip id="seller-profile-tooltip" />
        <Tooltip id="buyer-profile-tooltip" />
        <Tooltip id="mark-read-tooltip" />
        <Tooltip id="attach-tooltip" />
        <Tooltip id="send-tooltip" />
        <Tooltip id="propose-price-tooltip" />
        <Tooltip id="accept-price-tooltip" />
        <Tooltip id="negotiate-price-tooltip" />
        <Tooltip id="confirm-payment-tooltip" />
        <Tooltip id="mark-completed-tooltip" />
        <Tooltip id="confirm-completion-tooltip" />
        <Tooltip id="close-ticket-tooltip" />
        <Tooltip id="fab-tooltip" />
        <Tooltip id="close-sidebar-tooltip" />
      </div>
      <Toaster />
      <Footer />
    </div>
  );
};

export default Ticket;
