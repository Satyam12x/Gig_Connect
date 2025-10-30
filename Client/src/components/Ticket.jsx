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
  ArrowLeft,
  DollarSign,
  CheckCircle,
  Star,
  X,
  Loader,
  MessageSquare,
  User,
  Menu,
  Info,
  Clock,
  ChevronDown,
  Image as ImageIcon,
  File,
  Smile,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  Package,
  Calendar,
  Shield,
} from "lucide-react";
import io from "socket.io-client";
import { debounce } from "lodash";
import moment from "moment";

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000/ticket-socket";

const Ticket = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ---------- STATE ---------- */
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
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [messageOptionsId, setMessageOptionsId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  /* ---------- REFS ---------- */
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const messageInputRef = useRef(null);

  /* ---------- HELPERS ---------- */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    setShowScrollButton(!atBottom);

    if (scrollTop < 300 && hasMore && !loadingOlder) {
      loadOlderMessages();
    }
  }, [hasMore, loadingOlder]);

  /* ---------- AUTH ---------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch {
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        navigate("/login", { state: { from: `/tickets/${id}` } });
      }
    } else {
      toast.error("Please log in to view tickets.");
      navigate("/login", { state: { from: `/tickets/${id}` } });
    }
  }, [navigate, id]);

  /* ---------- SOCKET ---------- */
  useEffect(() => {
    if (!userId || !ticket) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.emit("joinTicket", id);

    const onNewMessage = (updatedTicket) => {
      setTicket(updatedTicket);
      if (messagesContainerRef.current) {
        const { scrollHeight, scrollTop, clientHeight } =
          messagesContainerRef.current;
        const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
        setShowScrollButton(!atBottom);
      }
    };

    const onTyping = ({ userId: typerId, userName }) => {
      if (typerId !== userId) {
        setTypingUser(userName);
        setTimeout(() => setTypingUser(null), 3000);
      }
    };

    const onRead = ({ ticketId, userId: readerId }) => {
      if (ticketId !== id || readerId === userId) return;
      setTicket((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.senderId === userId && !m.read ? { ...m, read: true } : m
        ),
      }));
    };

    socketRef.current.on("newMessage", onNewMessage);
    socketRef.current.on("typing", onTyping);
    socketRef.current.on("messagesRead", onRead);

    return () => {
      socketRef.current?.off("newMessage", onNewMessage);
      socketRef.current?.off("typing", onTyping);
      socketRef.current?.off("messagesRead", onRead);
      socketRef.current?.disconnect();
    };
  }, [userId, id, ticket]);

  /* ---------- FETCH TICKET ---------- */
  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTicket(data);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
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
  }, [id, userId, navigate, scrollToBottom]);

  /* ---------- LOAD OLDER MESSAGES ---------- */
  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasMore || !ticket) return;
    setLoadingOlder(true);

    const container = messagesContainerRef.current;
    const prevScrollHeight = container.scrollHeight;
    const prevScrollTop = container.scrollTop;

    try {
      const { data } = await axios.get(`${API_BASE}/tickets/${id}/messages`, {
        params: { page: page + 1, limit: 20 },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const newMsgs = data.messages;
      if (!newMsgs.length) {
        setHasMore(false);
      } else {
        setTicket((p) => ({
          ...p,
          messages: [...newMsgs.reverse(), ...p.messages],
        }));
        setPage((p) => p + 1);

        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop =
            prevScrollTop + (newScrollHeight - prevScrollHeight);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOlder(false);
    }
  }, [id, page, loadingOlder, hasMore, ticket]);

  /* ---------- MARK READ ---------- */
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

  /* ---------- TYPING ---------- */
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

  /* ---------- SEARCH ---------- */
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
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else if (ticket) {
      const refetch = async () => {
        const { data } = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTicket(data);
        scrollToBottom();
      };
      refetch();
    }
  }, [searchQuery, id, ticket, scrollToBottom]);

  /* ---------- MENU OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- SEND MESSAGE ---------- */
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
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to send.");
    } finally {
      setIsSending(false);
    }
  };

  /* ---------- AI ---------- */
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

  /* ---------- PRICE & ACTIONS ---------- */
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
      return toast.error("Select 1‑5 stars.");
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

  /* ---------- FILE ---------- */
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("File ≤ 5 MB");
    setFile(f);
    setFilePreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  };

  const highlightText = (text, q) => {
    if (!q) return text;
    const r = new RegExp(`(${q})`, "gi");
    return text.replace(r, '<mark class="bg-yellow-300 text-gray-900 px-1 rounded">$1</mark>');
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-blue-100 text-blue-800",
      negotiating: "bg-purple-100 text-purple-800",
      accepted: "bg-green-100 text-green-800",
      paid: "bg-cyan-100 text-cyan-800",
      pending_completion: "bg-amber-100 text-amber-800",
      completed: "bg-emerald-100 text-emerald-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: MessageSquare,
      negotiating: TrendingUp,
      accepted: CheckCircle,
      paid: DollarSign,
      pending_completion: Clock,
      completed: Package,
      closed: Shield,
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  /* ---------- RENDER ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100"
        >
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
          <p className="text-gray-600 mb-6">The ticket you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate("/gigs")}
            className="w-full px-6 py-3 bg-[#1E88E5] text-white rounded-xl hover:bg-[#1565C0] font-medium transition-all transform hover:scale-105"
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
      a.push({ id: "request-complete", label: "Request Completion", icon: Package });
    if (ticket.status === "pending_completion" && isSeller)
      a.push({ id: "confirm-complete", label: "Confirm Completion", icon: CheckCircle });
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
      "w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-sm";
    const styles =
      {
        price: "bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0D47A1] text-white",
        "accept-price": "bg-gradient-to-r from-[#4CAF50] to-[#43A047] hover:from-[#43A047] hover:to-[#388E3C] text-white",
        "request-complete": "bg-gradient-to-r from-[#4CAF50] to-[#43A047] hover:from-[#43A047] hover:to-[#388E3C] text-white",
        "confirm-complete": "bg-gradient-to-r from-[#4CAF50] to-[#43A047] hover:from-[#43A047] hover:to-[#388E3C] text-white",
        payment: "bg-gradient-to-r from-[#0288D1] to-[#0277BD] hover:from-[#0277BD] hover:to-[#01579B] text-white",
        close: "bg-gradient-to-r from-[#D32F2F] to-[#C62828] hover:from-[#C62828] hover:to-[#B71C1C] text-white",
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
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
            className={`${base} ${styles} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
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
        className={`${base} ${styles} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
      >
        {act.id === "close" && isSubmittingRating ? (
          <>
            <Loader className="h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Icon className="h-4 w-4" />
            {act.label}
          </>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-300 to-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-300 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-300 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-3000"></div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* ---------- HEADER ---------- */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/gigs")}
                className="p-2 text-gray-600 hover:text-[#1E88E5] rounded-xl hover:bg-blue-50 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {ticket.gigId.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-500">ID: {ticket._id.slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Right Section - Mobile Menu */}
            <div className="lg:hidden" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 text-gray-600 hover:text-[#1E88E5] rounded-xl hover:bg-blue-50 transition-all"
              >
                <Menu className="h-5 w-5" />
              </motion.button>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50"
                  >
                    <div className="space-y-2">
                      {getVisibleActions().map(renderActionButton)}
                      <button
                        onClick={() => {
                          setIsDetailsModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 font-medium text-sm flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                      >
                        <Info className="h-4 w-4" /> View Details
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Section - Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {getVisibleActions().map(renderActionButton)}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDetailsModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl text-sm font-medium flex items-center gap-2 hover:from-gray-200 hover:to-gray-100 transition-all shadow-sm"
              >
                <Info className="h-4 w-4" /> Details
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ---------- MAIN CHAT ---------- */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent text-sm bg-white/80 backdrop-blur-sm transition-all"
              />
              <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {isSearching && (
                <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#1E88E5] animate-spin" />
              )}
              {searchQuery && !isSearching && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
          >
            {loadingOlder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-3"
              >
                <Loader className="h-5 w-5 animate-spin inline text-[#1E88E5]" />
                <p className="text-xs text-gray-500 mt-1">Loading older messages...</p>
              </motion.div>
            )}

            {ticket.messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-10 w-10 text-[#1E88E5] opacity-50" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No messages yet</p>
                  <p className="text-sm text-gray-500">Start the conversation!</p>
                </div>
              </motion.div>
            ) : (
              ticket.messages.map((msg, index) => {
                const isOwn = msg.senderId === userId;
                const isAI = msg.senderId === "AI";
                const showAvatar = index === 0 || ticket.messages[index - 1].senderId !== msg.senderId;

                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    {!isOwn && showAvatar && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {isAI ? "AI" : msg.senderName?.charAt(0) || "U"}
                      </div>
                    )}
                    {!isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}

                    <div className={`max-w-[75%] group relative ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
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
                          <div className={`mb-2 pb-2 border-l-2 pl-2 text-xs opacity-75 ${isOwn ? "border-white/30" : "border-gray-300"}`}>
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
                            {msg.attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <motion.img
                                whileHover={{ scale: 1.05 }}
                                src={msg.attachment}
                                alt="Attachment"
                                className="max-w-full h-auto rounded-xl max-h-64 cursor-pointer border-2 border-white/20"
                                onClick={() => window.open(msg.attachment, "_blank")}
                              />
                            ) : (
                              <a
                                href={msg.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 text-xs underline p-2 rounded-lg ${
                                  isOwn ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"
                                }`}
                              >
                                <File className="h-4 w-4" />
                                <span className="truncate">{msg.attachment.split("/").pop()}</span>
                              </a>
                            )}
                          </div>
                        )}

                        <div className={`flex items-center justify-between mt-2 text-xs ${isOwn ? "text-white/70" : "text-gray-500"}`}>
                          <span>{moment(msg.timestamp).format("h:mm A")}</span>
                          {isOwn && msg.read && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Read
                            </span>
                          )}
                        </div>

                        {/* Message Options */}
                        <button
                          onClick={() => setMessageOptionsId(messageOptionsId === msg._id ? null : msg._id)}
                          className={`absolute top-2 ${isOwn ? "left-2" : "right-2"} opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full ${
                            isOwn ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </button>

                        {messageOptionsId === msg._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`absolute ${isOwn ? "left-0" : "right-0"} top-10 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10 min-w-[120px]`}
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
                        {ticket[isBuyer ? "buyerId" : "sellerId"]?.fullName?.charAt(0) || "Y"}
                      </div>
                    )}
                    {isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}
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
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="h-2 w-2 bg-[#1E88E5] rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="h-2 w-2 bg-[#1E88E5] rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="h-2 w-2 bg-[#1E88E5] rounded-full"
                  />
                </div>
                <span className="italic">{typingUser} is typing...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToBottom}
                className="fixed bottom-32 right-8 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white p-3 rounded-full shadow-lg hover:shadow-xl z-50 transition-all transform hover:scale-110"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Input Footer */}
          {ticket.status !== "closed" && (
            <div className="border-t border-gray-100 bg-gradient-to-r from-blue-50/30 to-purple-50/30 p-4">
              {/* Reply Preview */}
              {replyingTo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 bg-white rounded-lg p-3 border border-gray-200 flex items-start justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1">Replying to {replyingTo.senderName}</p>
                    <p className="text-sm text-gray-800 truncate">{replyingTo.content}</p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* File Preview */}
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
                          src={filePreview}
                          alt="Preview"
                          className="h-12 w-12 object-cover rounded-lg border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <File className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFile(null);
                        setFilePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Input Area */}
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
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent text-sm resize-none max-h-32 bg-white/80 backdrop-blur-sm transition-all"
                  rows="1"
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
                  className="p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all shadow-sm"
                  title="Attach file"
                >
                  <Paperclip className="h-5 w-5 text-gray-600" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAIResponse}
                  disabled={isSending || !message.trim()}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  title="AI suggestion"
                >
                  <MessageSquare className="h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={isSending || (!message.trim() && !file)}
                  className="p-3 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0D47A1] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
            <div className="border-t border-gray-100 bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                This ticket is closed
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ---------- MODALS ---------- */}

      {/* Rating Modal */}
      <AnimatePresence>
        {isRatingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Rate Your Experience
                </h2>
                <p className="text-sm text-gray-600">
                  How was your experience with{" "}
                  <span className="font-semibold text-[#1E88E5]">
                    {isBuyer ? ticket.sellerId.fullName : ticket.buyerId.fullName}
                  </span>
                  ?
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    className="p-1 transition-all"
                  >
                    <Star
                      className={`h-10 w-10 transition-all ${
                        rating >= star
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                          : "text-gray-300 hover:text-gray-400"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsRatingModalOpen(false);
                    setRating(0);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseTicket}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white rounded-xl hover:from-[#1565C0] hover:to-[#0D47A1] disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  {isSubmittingRating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4" /> Submit Rating
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Rating Modal */}
      <AnimatePresence>
        {isCompletionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Rate the Buyer
                </h2>
                <p className="text-sm text-gray-600">
                  How was your experience with{" "}
                  <span className="font-semibold text-[#1E88E5]">
                    {ticket.buyerId.fullName}
                  </span>
                  ?
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    className="p-1 transition-all"
                  >
                    <Star
                      className={`h-10 w-10 transition-all ${
                        rating >= star
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                          : "text-gray-300 hover:text-gray-400"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsCompletionModalOpen(false);
                    setRating(0);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitCompletionRating}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white rounded-xl hover:from-[#1565C0] hover:to-[#0D47A1] disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  {isSubmittingRating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4" /> Submit Rating
                    </>
                  )}
                </motion.button>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Ticket Details</h2>
                    <p className="text-sm opacity-90 mt-1