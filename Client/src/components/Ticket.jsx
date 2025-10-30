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

  /* ---------- REFS ---------- */
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const wasNearBottom = useRef(true);

  /* ---------- HELPERS ---------- */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    const nearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollButton(!nearBottom);
    wasNearBottom.current = nearBottom;

    // Load older messages only when scrolling near top
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
      // Only auto-scroll if user was near bottom
      if (wasNearBottom.current) {
        setTimeout(scrollToBottom, 100);
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
  }, [userId, id, ticket, scrollToBottom]);

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
        setTimeout(() => {
          scrollToBottom();
          wasNearBottom.current = true;
        }, 100);
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
    try {
      const { data } = await axios.get(
        `${API_BASE}/tickets/${id}/messages/search`,
        {
          params: { query: q },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket((t) => ({ ...t, messages: data.messages }));
      toast.success("Messages filtered!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Search failed.");
    }
  }, 500);

  useEffect(() => {
    if (searchQuery) debouncedSearch(searchQuery);
    else if (ticket) {
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
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Message sent!");
      wasNearBottom.current = true;
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
    return text.replace(r, '<span class="bg-yellow-200">$1</span>');
  };

  /* ---------- RENDER ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="h-12 w-12 text-[#1E88E5]" />
        </motion.div>
      </div>
    );
  }
  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
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
            className="mt-4 px-4 py-2 bg-[#1E88E5] text-white rounded-md hover:bg-[#1565C0]"
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
      a.push({ id: "price", label: "Propose Price" });
    if (ticket.status === "accepted" && isBuyer && ticket.agreedPrice) {
      a.push({ id: "accept-price", label: "Accept Price" });
      a.push({ id: "payment", label: "Confirm Payment" });
    }
    if (ticket.status === "paid" && isBuyer)
      a.push({ id: "request-complete", label: "Request Completion" });
    if (ticket.status === "pending_completion" && isSeller)
      a.push({ id: "confirm-complete", label: "Confirm Completion" });
    if (ticket.status === "completed")
      a.push({
        id: "close",
        label: isBuyer ? "Close & Rate" : "Close Ticket",
        disabled: isSubmittingRating,
      });
    if (
      ticket.status !== "closed" &&
      !["paid", "pending_completion", "completed"].includes(ticket.status)
    )
      a.push({
        id: "close",
        label: "Close Ticket",
        disabled: isSubmittingRating,
      });
    return a;
  };

  const renderActionButton = (act) => {
    const base =
      "w-full px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition";
    const styles =
      {
        price: "bg-[#1E88E5] hover:bg-[#1565C0] text-white",
        "accept-price": "bg-[#4CAF50] hover:bg-[#43A047] text-white",
        "request-complete": "bg-[#4CAF50] hover:bg-[#43A047] text-white",
        "confirm-complete": "bg-[#4CAF50] hover:bg-[#43A047] text-white",
        payment: "bg-[#0288D1] hover:bg-[#0277BD] text-white",
        close: "bg-[#D32F2F] hover:bg-[#C62828] text-white",
      }[act.id] || "bg-gray-600 hover:bg-gray-700 text-white";

    const icon = {
      price: <DollarSign className="h-4 w-4" />,
      payment: <DollarSign className="h-4 w-4" />,
      "accept-price": <CheckCircle className="h-4 w-4" />,
      "request-complete": <CheckCircle className="h-4 w-4" />,
      "confirm-complete": <CheckCircle className="h-4 w-4" />,
      close: <X className="h-4 w-4" />,
    }[act.id];

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
          <input
            type="number"
            value={agreedPrice}
            onChange={(e) => setAgreedPrice(e.target.value)}
            placeholder="Enter price (₹)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-sm"
            min="0"
            step="0.01"
          />
          <button
            onClick={handleSetPrice}
            disabled={!agreedPrice || agreedPrice <= 0}
            className={`${base} ${styles}`}
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
        className={`${base} ${styles}`}
      >
        {icon}
        {act.id === "close" && isSubmittingRating ? (
          <>
            <Loader className="h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          act.label
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-300 to-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-300 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-300 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-3000"></div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      {/* ---------- HEADER ---------- */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/gigs")}
              className="text-gray-600 hover:text-[#1E88E5]"
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

          {/* Mobile Menu */}
          <div className="lg:hidden" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-[#1E88E5] rounded-full"
            >
              <Menu className="h-6 w-6" />
            </motion.button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-4 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50"
                >
                  <div className="space-y-2">
                    {getVisibleActions().map(renderActionButton)}
                    <button
                      onClick={() => {
                        setIsDetailsModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-medium text-sm flex items-center gap-2"
                    >
                      <Info className="h-4 w-4" /> More Details
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {getVisibleActions().map(renderActionButton)}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsDetailsModalOpen(true)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-1"
            >
              <Info className="h-4 w-4" /> Details
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ---------- MAIN CHAT (FIXED HEIGHT) ---------- */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 gap-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-white rounded-t-lg shadow-md border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: "calc(100vh - 220px)" }}
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-200 bg-white">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-sm"
            />
          </div>

          {/* Messages - FIXED HEIGHT + SCROLLABLE */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {loadingOlder && (
              <div className="text-center py-2">
                <Loader className="h-5 w-5 animate-spin inline text-[#1E88E5]" />
              </div>
            )}
            {ticket.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              </div>
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
                    className={`max-w-[75%] p-3 rounded-xl shadow-sm text-sm ${
                      msg.senderId === userId
                        ? "bg-[#1E88E5] text-white"
                        : msg.senderId === "AI"
                        ? "bg-[#EDE7F6] text-gray-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.senderId !== userId && (
                      <p className="text-xs font-medium opacity-80 mb-1">
                        {msg.senderName}
                        {msg.senderId === "AI" && " (AI)"}
                      </p>
                    )}
                    <p
                      dangerouslySetInnerHTML={{
                        __html: highlightText(msg.content, searchQuery),
                      }}
                    />
                    {msg.attachment && (
                      <div className="mt-2">
                        {msg.attachment.match(/\.(jpg|jpeg|png)$/i) ? (
                          <img
                            src={msg.attachment}
                            alt="Attachment"
                            className="max-w-full h-auto rounded-md max-h-48"
                          />
                        ) : (
                          <a
                            href={msg.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            {msg.attachment.split("/").pop()}
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {moment(msg.timestamp).fromNow()}
                      {msg.read && msg.senderId !== userId && " Read"}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
            {typingUser && (
              <p className="text-xs text-gray-500 italic text-center">
                {typingUser} is typing...
              </p>
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
                onClick={() => {
                  scrollToBottom();
                  wasNearBottom.current = true;
                  setShowScrollButton(false);
                }}
                className="fixed bottom-24 right-6 bg-[#1E88E5] text-white p-3 rounded-full shadow-lg hover:bg-[#1565C0] z-50"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* INPUT FOOTER - STICKY */}
          {ticket.status !== "closed" && (
            <div className="border-t border-gray-200 bg-white p-3">
              {file && (
                <div className="flex items-center justify-between bg-gray-100 rounded-md p-2 mb-2 text-sm">
                  <div className="flex items-center gap-2">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="h-8 w-8 object-cover rounded"
                      />
                    ) : (
                      <Paperclip className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="truncate max-w-[180px]">{file.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                      fileInputRef.current.value = "";
                    }}
                    className="text-red-500 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-sm resize-none max-h-24"
                  rows="1"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || (!message.trim() && !file)}
                  className="p-3 bg-[#1E88E5] text-white rounded-lg hover:bg-[#1565C0] disabled:bg-gray-400"
                >
                  {isSending ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleAIResponse}
                  disabled={isSending || !message.trim()}
                  className="p-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#43A047] disabled:bg-gray-400"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
              <p className="text-sm text-gray-600 mb-6">
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
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleCloseTicket}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-4 py-2 bg-[#1E88E5] text-white rounded-lg hover:bg-[#1565C0] disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-colors"
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Rate the Buyer
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                How was your experience with{" "}
                <span className="font-semibold">{ticket.buyerId.fullName}</span>
                ?
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setRating(star)}
                    className="p-1"
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
                    setIsCompletionModalOpen(false);
                    setRating(0);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleSubmitCompletionRating}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-4 py-2 bg-[#1E88E5] text-white rounded-lg hover:bg-[#1565C0] disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-colors"
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Ticket Details
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    Status
                  </h3>
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    {isBuyer ? "Seller" : "Buyer"}
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-[#1E88E5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {ticket[
                        isBuyer ? "sellerId" : "buyerId"
                      ]?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {ticket[isBuyer ? "sellerId" : "buyerId"]?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {ticket[isBuyer ? "sellerId" : "buyerId"]?.email}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() =>
                      navigate(
                        `/users/${
                          ticket[isBuyer ? "sellerId" : "buyerId"]?._id
                        }`
                      )
                    }
                    className="w-full px-4 py-2 bg-[#1E88E5] text-white rounded-lg hover:bg-[#1565C0] text-sm font-medium transition-colors"
                  >
                    View Profile
                  </motion.button>
                </div>
                {ticket.agreedPrice && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      Agreed Price
                    </h3>
                    <p className="text-lg font-bold text-[#1E88E5]">
                      ₹{ticket.agreedPrice.toLocaleString()}
                    </p>
                  </div>
                )}
                {ticket.timeline?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
                      <Clock className="h-4 w-4" /> Timeline
                    </h3>
                    <div className="space-y-4">
                      {ticket.timeline.map((event) => (
                        <div key={event._id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="h-3 w-3 bg-[#1E88E5] rounded-full" />
                            <div className="h-20 w-0.5 bg-gray-200 mt-2" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-medium">
                              {event.action}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
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

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Ticket;
