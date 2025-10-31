"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Loader,
  MessageSquare,
  Info,
  ArrowLeft,
  File,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  Package,
  Shield,
  Users,
} from "lucide-react";
import io from "socket.io-client";
import { debounce } from "lodash";
import moment from "moment";

import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

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
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [messageOptionsId, setMessageOptionsId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMembersOnMobile, setShowMembersOnMobile] = useState(false);

  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const messageInputRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop < 300 && hasMore && !loadingOlder) loadOlderMessages();
  }, [hasMore, loadingOlder]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setUserId(jwtDecode(token).id);
      } catch {
        localStorage.removeItem("token");
        toast.error("Session expired.");
        navigate("/login", { state: { from: `/tickets/${id}` } });
      }
    } else {
      toast.error("Please log in.");
      navigate("/login", { state: { from: `/tickets/${id}` } });
    }
  }, [navigate, id]);

  useEffect(() => {
    if (!userId || !ticket) return;
    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current.emit("joinTicket", id);
    const onNew = (t) => setTicket(t);
    const onTyping = ({ userId: typerId, userName }) => {
      if (typerId !== userId) {
        setTypingUser(userName);
        setTimeout(() => setTypingUser(null), 3000);
      }
    };
    const onRead = ({ ticketId, userId: readerId }) => {
      if (ticketId !== id || readerId === userId) return;
      setTicket((p) => ({
        ...p,
        messages: p.messages.map((m) =>
          m.senderId === userId && !m.read ? { ...m, read: true } : m
        ),
      }));
    };
    socketRef.current.on("newMessage", onNew);
    socketRef.current.on("typing", onTyping);
    socketRef.current.on("messagesRead", onRead);
    return () => {
      socketRef.current?.off("newMessage", onNew);
      socketRef.current?.off("typing", onTyping);
      socketRef.current?.off("messagesRead", onRead);
      socketRef.current?.disconnect();
    };
  }, [userId, id, ticket]);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTicket(data);
        setLoading(false);
      } catch (e) {
        toast.error(e.response?.data?.error || "Failed to load ticket.");
        if (e.response?.status === 401 || e.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login", { state: { from: `/tickets/${id}` } });
        }
        setLoading(false);
      }
    };
    fetch();
  }, [id, userId, navigate]);

  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasMore || !ticket) return;
    setLoadingOlder(true);
    const container = messagesContainerRef.current;
    const prevHeight = container.scrollHeight;
    const prevTop = container.scrollTop;
    try {
      const { data } = await axios.get(`${API_BASE}/tickets/${id}/messages`, {
        params: { page: page + 1, limit: 20 },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!data.messages.length) setHasMore(false);
      else {
        setTicket((p) => ({
          ...p,
          messages: [...data.messages.reverse(), ...p.messages],
        }));
        setPage((p) => p + 1);
        requestAnimationFrame(() => {
          container.scrollTop = prevTop + (container.scrollHeight - prevHeight);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOlder(false);
    }
  }, [id, page, loadingOlder, hasMore, ticket]);

  useEffect(() => {
    if (!ticket || !userId) return;
    const mark = async () => {
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
      } catch {}
    };
    mark();
  }, [ticket, userId, id]);

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

  const debouncedSearch = debounce(async (q) => {
    setIsSearching(true);
    try {
      const { data } = await axios.get(
        `${API_BASE}/tickets/${id}/messages/search`,
        {
          params: { query: q },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket((t) => ({ ...t, messages: data.messages }));
      toast.success(`Found ${data.messages.length} message(s)`);
    } catch (e) {
      toast.error(e.response?.data?.error || "Search failed.");
    } finally {
      setIsSearching(false);
    }
  }, 500);

  useEffect(() => {
    if (searchQuery) debouncedSearch(searchQuery);
    else if (ticket) {
      const refetch = async () => {
        const { data } = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTicket(data);
      };
      refetch();
    }
  }, [searchQuery, id, ticket]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() && !file)
      return toast.error("Enter a message or attach a file.");
    setIsSending(true);
    try {
      const fd = new FormData();
      if (message.trim()) fd.append("content", message);
      if (file) fd.append("attachment", file);
      if (replyingTo) fd.append("replyTo", replyingTo._id);
      const { data } = await axios.post(
        `${API_BASE}/tickets/${id}/messages`,
        fd,
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
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Message sent!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to send.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAIResponse = async () => {
    if (!message.trim()) return toast.error("Enter a message for AI.");
    setIsSending(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/ai/chat`,
        { message },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessage(data.response);
      toast.success("AI suggestion ready!");
    } catch (e) {
      toast.error(e.response?.data?.error || "AI error.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSetPrice = async () => {
    if (!agreedPrice || agreedPrice <= 0)
      return toast.error("Enter a valid price.");
    try {
      const { data } = await axios.patch(
        `${API_BASE}/tickets/${id}/price`,
        { agreedPrice: Number.parseFloat(agreedPrice) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(data.ticket);
      setAgreedPrice("");
      setIsMenuOpen(false);
      toast.success("Price proposed!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed.");
    }
  };

  const handleAcceptPrice = async () => {
    try {
      const { data } = await axios.patch(
        `${API_BASE}/tickets/${id}/accept-price`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(data.ticket);
      setIsMenuOpen(false);
      toast.success("Price accepted!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed.");
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const { data } = await axios.patch(
        `${API_BASE}/tickets/${id}/paid`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(data.ticket);
      setIsMenuOpen(false);
      toast.success("Payment confirmed!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed.");
    }
  };

  const handleRequestComplete = async () => {
    try {
      const { data } = await axios.patch(
        `${API_BASE}/tickets/${id}/request-complete`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(data.ticket);
      setIsMenuOpen(false);
      toast.success("Completion request sent!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed.");
    }
  };

  const handleConfirmComplete = () => setIsCompletionModalOpen(true);

  const handleSubmitCompletionRating = async () => {
    if (!rating || rating < 1 || rating > 5)
      return toast.error("Select 1-5 stars.");
    setIsSubmittingRating(true);
    try {
      const { data } = await axios.patch(
        `${API_BASE}/tickets/${id}/confirm-complete`,
        { rating },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(data.ticket);
      setIsCompletionModalOpen(false);
      setRating(0);
      setIsMenuOpen(false);
      toast.success("Completion confirmed!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleCloseTicket = async () => {
    if (isBuyer && ticket?.status === "completed" && rating === 0) {
      setIsRatingModalOpen(true);
      return;
    }
    setIsSubmittingRating(true);
    try {
      const { data } = await axios.patch(
        `${API_BASE}/tickets/${id}/close`,
        isBuyer && rating ? { rating } : {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(data.ticket);
      setIsRatingModalOpen(false);
      setRating(0);
      setIsMenuOpen(false);
      toast.success("Ticket closed!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024)
      return toast.error("File less than or equal to 5 MB");
    setFile(f);
    setFilePreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  };

  const highlightText = (text, q) => {
    if (!q) return text;
    const r = new RegExp(`(${q})`, "gi");
    return text.replace(
      r,
      '<mark class="bg-yellow-300 text-gray-900 px-1 rounded">$1</mark>'
    );
  };

  const getStatusColor = (status) => {
    const c = {
      open: "bg-blue-100 text-blue-800",
      negotiating: "bg-purple-100 text-purple-800",
      accepted: "bg-green-100 text-green-800",
      paid: "bg-cyan-100 text-cyan-800",
      pending_completion: "bg-amber-100 text-amber-800",
      completed: "bg-emerald-100 text-emerald-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return c[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const i = {
      open: MessageSquare,
      negotiating: TrendingUp,
      accepted: CheckCircle,
      paid: DollarSign,
      pending_completion: Clock,
      completed: Package,
      closed: Shield,
    };
    const Icon = i[status] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="inline-block"
          >
            <Loader className="h-12 w-12 text-[#1E88E5]" />
          </motion.div>
          <p className="mt-4 text-gray-600 font-medium">Loading ticket...</p>
        </motion.div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
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
            className="w-full px-6 py-3 bg-[#1E88E5] text-white rounded-xl hover:bg-[#1565C0] font-medium transition-all"
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
    const a = [];
    if (["open", "negotiating"].includes(ticket.status))
      a.push({ id: "price", label: "Propose Price", icon: DollarSign });
    if (ticket.status === "accepted" && isBuyer && ticket.agreedPrice) {
      a.push({ id: "accept-price", label: "Accept Price", icon: CheckCircle });
      a.push({ id: "payment", label: "Confirm Payment", icon: DollarSign });
    }
    if (ticket.status === "paid" && isBuyer)
      a.push({
        id: "request-complete",
        label: "Request Completion",
        icon: Package,
      });
    if (ticket.status === "pending_completion" && isSeller)
      a.push({
        id: "confirm-complete",
        label: "Confirm Completion",
        icon: CheckCircle,
      });
    if (ticket.status === "completed")
      a.push({
        id: "close",
        label: isBuyer ? "Close & Rate" : "Close Ticket",
        icon: Shield,
        disabled: isSubmittingRating,
      });
    if (
      ticket.status !== "closed" &&
      !["paid", "pending_completion", "completed"].includes(ticket.status)
    )
      a.push({
        id: "close",
        label: "Close Ticket",
        icon: X,
        disabled: isSubmittingRating,
      });
    return a;
  };

  const renderActionButton = (act) => {
    const base =
      "w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm";
    const styles =
      {
        price:
          "bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0D47A1] text-white",
        "accept-price":
          "bg-gradient-to-r from-[#4CAF50] to-[#43A047] hover:from-[#43A047] hover:to-[#388E3C] text-white",
        "request-complete":
          "bg-gradient-to-r from-[#4CAF50] to-[#43A047] hover:from-[#43A047] hover:to-[#388E3C] text-white",
        "confirm-complete":
          "bg-gradient-to-r from-[#4CAF50] to-[#43A047] hover:from-[#43A047] hover:to-[#388E3C] text-white",
        payment:
          "bg-gradient-to-r from-[#0288D1] to-[#0277BD] hover:from-[#0277BD] hover:to-[#01579B] text-white",
        close:
          "bg-gradient-to-r from-[#D32F2F] to-[#C62828] hover:from-[#C62828] hover:to-[#B71C1C] text-white",
      }[act.id] || "bg-gray-600 hover:bg-gray-700 text-white";
    const Icon = act.icon;
    const handler = {
      "accept-price": handleAcceptPrice,
      payment: handleConfirmPayment,
      "request-complete": handleRequestComplete,
      "confirm-complete": handleConfirmComplete,
      close: handleCloseTicket,
    }[act.id];

    if (act.id === "price")
      return (
        <div key={act.id} className="space-y-2">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(e.target.value)}
              placeholder="Enter price amount"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent text-sm"
              min="0"
              step="0.01"
            />
          </div>
          <button
            onClick={handleSetPrice}
            disabled={!agreedPrice || agreedPrice <= 0}
            className={`${base} ${styles} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <DollarSign className="h-4 w-4" /> Set Price
          </button>
        </div>
      );

    return (
      <button
        key={act.id}
        onClick={handler}
        disabled={act.disabled}
        className={`${base} ${styles} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {act.id === "close" && isSubmittingRating ? (
          <>
            {" "}
            <Loader className="h-4 w-4 animate-spin" /> Submitting...{" "}
          </>
        ) : (
          <>
            {" "}
            <Icon className="h-4 w-4" /> {act.label}{" "}
          </>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content Area - flex row layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area - Left Side */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Ticket Header - Inside chat area, like WhatsApp */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-md px-4 sm:px-6 py-4 flex-shrink-0"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/gigs")}
                  className="p-2 text-gray-600 hover:text-[#1E88E5] rounded-xl hover:bg-blue-50 transition-all flex-shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {ticket.gigId.title}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}{" "}
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500">
                      ID: {ticket._id.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Members Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMembersOnMobile(!showMembersOnMobile)}
                className="lg:hidden p-2.5 text-gray-600 hover:text-[#1E88E5] rounded-xl hover:bg-blue-50 transition-all flex-shrink-0 relative"
              >
                <Users className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#1E88E5] text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </motion.button>

              {/* Desktop Action Menu */}
              <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                {getVisibleActions().slice(0, 2).map(renderActionButton)}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDetailsModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl text-sm font-medium flex items-center gap-2 hover:from-gray-200 hover:to-gray-100 transition-all shadow-sm"
                >
                  <Info className="h-4 w-4" /> More
                </motion.button>
              </div>
            </div>
          </motion.header>

          {/* Messages Area - Scrollable */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-white/95 backdrop-blur-sm rounded-none overflow-hidden flex flex-col"
          >
            {/* Search bar */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50 flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent text-sm bg-white/80 backdrop-blur-sm transition-all"
                />
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                {isSearching && (
                  <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E88E5] animate-spin" />
                )}
                {searchQuery && !isSearching && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages Container - Internal Scroll */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {loadingOlder && (
                <div className="text-center py-3">
                  <Loader className="h-5 w-5 animate-spin inline text-[#1E88E5]" />
                  <p className="text-xs text-gray-500 mt-1">
                    Loading older messages...
                  </p>
                </div>
              )}

              {ticket.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-10 w-10 text-[#1E88E5] opacity-50" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">
                      No messages yet
                    </p>
                    <p className="text-sm text-gray-500">
                      Start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                ticket.messages.map((msg, i) => {
                  const isOwn = msg.senderId === userId;
                  const isAI = msg.senderId === "AI";
                  const showAvatar =
                    i === 0 || ticket.messages[i - 1].senderId !== msg.senderId;
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex gap-2 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOwn && showAvatar && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {isAI ? "AI" : msg.senderName?.charAt(0) || "U"}
                        </div>
                      )}
                      {!isOwn && !showAvatar && (
                        <div className="w-8 flex-shrink-0" />
                      )}

                      <div
                        className={`max-w-[75%] group relative ${
                          isOwn ? "items-end" : "items-start"
                        } flex flex-col`}
                      >
                        {!isOwn && showAvatar && (
                          <p className="text-xs font-medium text-gray-600 mb-1 ml-3">
                            {msg.senderName}
                            {isAI && " (AI Assistant)"}
                          </p>
                        )}
                        <div
                          className={`relative px-4 py-3 rounded-2xl shadow-sm text-sm ${
                            isOwn
                              ? "bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white rounded-br-md"
                              : isAI
                              ? "bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800 rounded-bl-md"
                              : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                          }`}
                        >
                          {msg.replyTo && (
                            <div
                              className={`mb-2 pb-2 border-l-2 pl-2 text-xs opacity-75 ${
                                isOwn ? "border-white/30" : "border-gray-300"
                              }`}
                            >
                              <p className="font-medium">Replying to:</p>
                              <p className="truncate">{msg.replyTo.content}</p>
                            </div>
                          )}
                          <p
                            dangerouslySetInnerHTML={{
                              __html: highlightText(msg.content, searchQuery),
                            }}
                            className="break-words"
                          />
                          {msg.attachment && (
                            <div className="mt-3">
                              {msg.attachment.match(
                                /\.(jpg|jpeg|png|gif|webp)$/i
                              ) ? (
                                <motion.img
                                  whileHover={{ scale: 1.05 }}
                                  src={msg.attachment}
                                  alt="Attachment"
                                  className="max-w-full h-auto rounded-xl max-h-64 cursor-pointer border-2 border-white/20"
                                  onClick={() =>
                                    window.open(msg.attachment, "_blank")
                                  }
                                />
                              ) : (
                                <a
                                  href={msg.attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 text-xs underline p-2 rounded-lg ${
                                    isOwn
                                      ? "bg-white/10 hover:bg-white/20"
                                      : "bg-gray-100 hover:bg-gray-200"
                                  }`}
                                >
                                  <File className="h-4 w-4" />
                                  <span className="truncate">
                                    {msg.attachment.split("/").pop()}
                                  </span>
                                </a>
                              )}
                            </div>
                          )}
                          <div
                            className={`flex items-center justify-between mt-2 text-xs ${
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

                          <button
                            onClick={() =>
                              setMessageOptionsId(
                                messageOptionsId === msg._id ? null : msg._id
                              )
                            }
                            className={`absolute top-2 ${
                              isOwn ? "left-2" : "right-2"
                            } opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full ${
                              isOwn
                                ? "bg-white/10 hover:bg-white/20"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </button>

                          {messageOptionsId === msg._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`absolute ${
                                isOwn ? "left-0" : "right-0"
                              } top-10 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10 min-w-[120px]`}
                            >
                              <button
                                onClick={() => {
                                  setReplyingTo(msg);
                                  setMessageOptionsId(null);
                                  messageInputRef.current?.focus();
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                Reply
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {isOwn && showAvatar && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {ticket[
                            isBuyer ? "buyerId" : "sellerId"
                          ]?.fullName?.charAt(0) || "Y"}
                        </div>
                      )}
                      {isOwn && !showAvatar && (
                        <div className="w-8 flex-shrink-0" />
                      )}
                    </motion.div>
                  );
                })
              )}

              {typingUser && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-gray-500"
                >
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="h-2 w-2 bg-[#1E88E5] rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 0.2,
                      }}
                      className="h-2 w-2 bg-[#1E88E5] rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 0.4,
                      }}
                      className="h-2 w-2 bg-[#1E88E5] rounded-full"
                    />
                  </div>
                  <span className="italic">{typingUser} is typing...</span>
                </motion.div>
              )}
            </div>

            {/* Input area */}
            {ticket.status !== "closed" && (
              <div className="border-t border-gray-100 bg-gradient-to-r from-blue-50/30 to-purple-50/30 p-4 flex-shrink-0">
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 bg-white rounded-lg p-3 border border-gray-200 flex items-start justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Replying to {replyingTo.senderName}
                      </p>
                      <p className="text-sm text-gray-800 truncate">
                        {replyingTo.content}
                      </p>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 bg-white rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {filePreview ? (
                          <img
                            src={filePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="h-12 w-12 object-cover rounded-lg border-2 border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <File className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
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
                        className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-end gap-2">
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
                    placeholder="Type a message..."
                    rows="1"
                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent text-sm resize-none max-h-32 bg-white/80 backdrop-blur-sm transition-all"
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all shadow-sm flex-shrink-0"
                    title="Attach file"
                  >
                    <Paperclip className="h-5 w-5 text-gray-600" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAIResponse}
                    disabled={isSending || !message.trim()}
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex-shrink-0"
                    title="AI suggestion"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={isSending || (!message.trim() && !file)}
                    className="p-3 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0D47A1] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex-shrink-0"
                    title="Send message"
                  >
                    {isSending ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {ticket.status === "closed" && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 text-center flex-shrink-0">
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  This ticket is closed
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Members Panel - Right Side (Fixed, Desktop Only, or Mobile Toggle) */}
        <AnimatePresence>
          {showMembersOnMobile || true ? (
            <motion.aside
              initial={{ x: showMembersOnMobile ? 350 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 350, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`${
                showMembersOnMobile
                  ? "fixed inset-0 top-[64px] right-0 w-full sm:w-80 z-40 lg:relative lg:inset-auto lg:top-auto"
                  : "hidden lg:flex"
              } flex-col bg-white/95 backdrop-blur-sm border-l border-gray-200 w-80 flex-shrink-0`}
            >
              {/* Members Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#1E88E5]" />
                  <h3 className="font-semibold text-gray-900">Participants</h3>
                </div>
                {showMembersOnMobile && (
                  <button
                    onClick={() => setShowMembersOnMobile(false)}
                    className="lg:hidden p-2 text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Members List - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {/* Buyer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {ticket.buyerId.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {ticket.buyerId.fullName}
                      </p>
                      <p className="text-xs text-gray-500">Buyer</p>
                      {isBuyer && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Seller */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 hover:bg-purple-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {ticket.sellerId.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {ticket.sellerId.fullName}
                      </p>
                      <p className="text-xs text-gray-500">Seller</p>
                      {isSeller && (
                        <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Ticket Info in Members Panel */}
              <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50 flex-shrink-0">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}{" "}
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Price
                    </p>
                    <p className="text-lg font-bold text-[#1E88E5] mt-1">
                      ${ticket.agreedPrice?.toFixed(2) || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Created
                    </p>
                    <p className="text-gray-700 mt-1">
                      {moment(ticket.createdAt).format("MMM D, YYYY")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Members Panel */}
              <div className="p-4 border-t border-gray-100 space-y-2 flex-shrink-0">
                {getVisibleActions().slice(0, 3).map(renderActionButton)}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsDetailsModalOpen(true);
                    setShowMembersOnMobile(false);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 font-medium text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Info className="h-4 w-4" /> Full Details
                </motion.button>
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Fixed Footer */}
      <div className="hidden lg:block flex-shrink-0">
        <Footer />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      {/* ---------- MODALS ---------- */}
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
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Rate Your Experience
                </h3>
                <button
                  onClick={() => setIsRatingModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Please rate the seller before closing the ticket.
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(s)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-10 w-10 transition-all ${
                        s <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRatingModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseTicket}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white rounded-xl hover:from-[#1565C0] hover:to-[#0D47A1] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingRating ? (
                    <>
                      {" "}
                      <Loader className="h-4 w-4 animate-spin" /> Submitting...{" "}
                    </>
                  ) : (
                    <>Submit Rating</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCompletionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsCompletionModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Confirm Completion
                </h3>
                <button
                  onClick={() => setIsCompletionModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure the work is complete? Please rate the buyer.
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRating(s)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-10 w-10 transition-all ${
                        s <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsCompletionModalOpen(false);
                    setRating(0);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCompletionRating}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4CAF50] to-[#43A047] text-white rounded-xl hover:from-[#43A047] hover:to-[#388E3C] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingRating ? (
                    <>
                      {" "}
                      <Loader className="h-4 w-4 animate-spin" /> Confirming...{" "}
                    </>
                  ) : (
                    <>Confirm & Rate</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Ticket Details
                </h3>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gig</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-900">
                      {ticket.gigId.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {ticket.gigId.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">
                        {ticket.gigId.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Participants
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {ticket.buyerId.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Buyer</p>
                          <p className="text-sm text-gray-600">
                            {ticket.buyerId.fullName}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                          {ticket.sellerId.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Seller</p>
                          <p className="text-sm text-gray-600">
                            {ticket.sellerId.fullName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Agreed Price
                    </h4>
                    <p className="text-2xl font-bold text-[#1E88E5]">
                      ${ticket.agreedPrice?.toFixed(2) || "Not set"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}{" "}
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">
                        {moment(ticket.createdAt).format("MMM D, YYYY h:mm A")}
                      </span>
                    </div>
                    {ticket.updatedAt !== ticket.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Updated:</span>
                        <span className="font-medium">
                          {moment(ticket.updatedAt).format(
                            "MMM D, YYYY h:mm A"
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="mt-6 w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ticket;
