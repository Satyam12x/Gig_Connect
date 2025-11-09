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
  Search,
  Image as ImageIcon,
} from "lucide-react";
import io from "socket.io-client";
import { debounce } from "lodash";
import moment from "moment";

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [messageOptionsId, setMessageOptionsId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
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
      path: "/socket.io",
      transports: ["websocket", "polling"],
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
      toast.success("Completion confirmed!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleCloseTicket = async () => {
    const isBuyer = userId === ticket.buyerId?._id;
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
      return toast.error("File must be 5MB or less");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1A2A4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A2A4F] mb-2">
            Ticket Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The ticket you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <button
            onClick={() => navigate("/gigs")}
            className="w-full px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:opacity-90 font-semibold transition-all"
          >
            Back to Gigs
          </button>
        </div>
      </div>
    );
  }

  const isBuyer = userId === ticket.buyerId?._id;
  const isSeller = userId === ticket.sellerId?._id;

  const getVisibleActions = () => {
    const actions = [];
    if (["open", "negotiating"].includes(ticket.status))
      actions.push({ id: "price", label: "Propose Price", icon: DollarSign });
    if (ticket.status === "accepted" && isBuyer && ticket.agreedPrice) {
      actions.push({
        id: "accept-price",
        label: "Accept Price",
        icon: CheckCircle,
      });
      actions.push({
        id: "payment",
        label: "Confirm Payment",
        icon: DollarSign,
      });
    }
    if (ticket.status === "paid" && isBuyer)
      actions.push({
        id: "request-complete",
        label: "Request Completion",
        icon: Package,
      });
    if (ticket.status === "pending_completion" && isSeller)
      actions.push({
        id: "confirm-complete",
        label: "Confirm Completion",
        icon: CheckCircle,
      });
    if (ticket.status === "completed")
      actions.push({
        id: "close",
        label: isBuyer ? "Close & Rate" : "Close Ticket",
        icon: Shield,
        disabled: isSubmittingRating,
      });
    if (
      ticket.status !== "closed" &&
      !["paid", "pending_completion", "completed"].includes(ticket.status)
    )
      actions.push({
        id: "close",
        label: "Close Ticket",
        icon: X,
        disabled: isSubmittingRating,
      });
    return actions;
  };

  const renderActionButton = (act) => {
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
        <div key={act.id} className="space-y-3">
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(e.target.value)}
              placeholder="Enter price amount"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 text-sm font-medium transition-all"
              min="0"
              step="0.01"
            />
          </div>
          <button
            onClick={handleSetPrice}
            disabled={!agreedPrice || agreedPrice <= 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DollarSign className="h-5 w-5" /> Set Price
          </button>
        </div>
      );

    return (
      <button
        key={act.id}
        onClick={handler}
        disabled={act.disabled}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {act.id === "close" && isSubmittingRating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Submitting...
          </>
        ) : (
          <>
            <Icon className="h-5 w-5" /> {act.label}
          </>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => navigate("/gigs")}
              className="p-2 text-gray-600 hover:text-[#1A2A4F] hover:bg-gray-100 rounded-xl transition-all flex-shrink-0"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#1A2A4F] truncate">
                {ticket.gigId.title}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {getStatusIcon(ticket.status)}{" "}
                  {ticket.status.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  ID: {ticket._id.slice(-8)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-3 text-gray-600 hover:text-[#1A2A4F] hover:bg-gray-100 rounded-xl transition-all"
          >
            <Users className="h-6 w-6" />
          </button>

          <button
            onClick={() => setIsDetailsModalOpen(true)}
            className="hidden lg:flex items-center gap-2 px-5 py-3 bg-gray-100 text-[#1A2A4F] rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            <Info className="h-5 w-5" /> Details
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Search Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b-2 border-gray-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 text-sm font-medium transition-all"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[#1A2A4F] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {searchQuery && !isSearching && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-6 bg-gray-50"
          >
            {loadingOlder && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-[#1A2A4F] border-t-transparent rounded-full animate-spin inline-block"></div>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  Loading older messages...
                </p>
              </div>
            )}

            {ticket.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xl font-bold text-gray-700 mb-2">
                    No messages yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {ticket.messages.map((msg, i) => {
                  const isOwn = msg.senderId === userId;
                  const isAI = msg.senderId === "AI";
                  const showAvatar =
                    i === 0 || ticket.messages[i - 1].senderId !== msg.senderId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-3 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOwn && showAvatar && (
                        <div className="h-10 w-10 rounded-full bg-[#1A2A4F] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {isAI ? "AI" : msg.senderName?.charAt(0) || "U"}
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
                            {isAI && " (AI)"}
                          </p>
                        )}
                        <div
                          className={`relative px-5 py-3 rounded-2xl shadow-sm text-sm ${
                            isOwn
                              ? "bg-[#1A2A4F] text-white rounded-br-md"
                              : isAI
                              ? "bg-purple-100 text-gray-800 border-2 border-purple-200 rounded-bl-md"
                              : "bg-white text-gray-800 border-2 border-gray-200 rounded-bl-md"
                          }`}
                        >
                          {msg.replyTo && (
                            <div
                              className={`mb-2 pb-2 border-l-2 pl-3 text-xs ${
                                isOwn
                                  ? "border-white/30 text-white/70"
                                  : "border-gray-300 text-gray-500"
                              }`}
                            >
                              <p className="font-bold">Replying to:</p>
                              <p className="truncate">{msg.replyTo.content}</p>
                            </div>
                          )}
                          <p
                            dangerouslySetInnerHTML={{
                              __html: highlightText(msg.content, searchQuery),
                            }}
                            className="break-words leading-relaxed"
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
                                    {msg.attachment.split("/").pop()}
                                  </span>
                                </a>
                              )}
                            </div>
                          )}
                          <div
                            className={`flex items-center justify-between mt-2 text-xs font-medium ${
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
                            } opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full ${
                              isOwn
                                ? "bg-white/10 hover:bg-white/20"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {messageOptionsId === msg._id && (
                            <div
                              className={`absolute ${
                                isOwn ? "left-0" : "right-0"
                              } top-12 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-2 z-10 min-w-[140px]`}
                            >
                              <button
                                onClick={() => {
                                  setReplyingTo(msg);
                                  setMessageOptionsId(null);
                                  messageInputRef.current?.focus();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                              >
                                Reply
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {isOwn && showAvatar && (
                        <div className="h-10 w-10 rounded-full bg-[#1A2A4F] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {ticket[
                            isBuyer ? "buyerId" : "sellerId"
                          ]?.fullName?.charAt(0) || "Y"}
                        </div>
                      )}
                      {isOwn && !showAvatar && (
                        <div className="w-10 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {typingUser && (
              <div className="flex items-center gap-3 text-sm text-gray-600 mt-4">
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
          {ticket.status !== "closed" && (
            <div className="border-t-2 border-gray-200 bg-white p-6 flex-shrink-0">
              {replyingTo && (
                <div className="mb-4 bg-gray-50 rounded-xl p-4 border-2 border-gray-200 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-600 mb-1 uppercase">
                      Replying to {replyingTo.senderName}
                    </p>
                    <p className="text-sm text-gray-800 truncate font-medium">
                      {replyingTo.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="ml-3 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

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
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end gap-3">
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
                  className="flex-1 p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 text-sm font-medium resize-none max-h-32 transition-all"
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
                  className="p-4 bg-gray-100 hover:bg-gray-200 rounded-xl border-2 border-gray-300 transition-all flex-shrink-0"
                  title="Attach file"
                >
                  <Paperclip className="h-5 w-5 text-gray-600" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={isSending || (!message.trim() && !file)}
                  className="p-4 bg-[#1A2A4F] hover:opacity-90 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
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
          )}

          {ticket.status === "closed" && (
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
              transition={{ duration: 0.3 }}
              className={`${
                showSidebar
                  ? "fixed inset-y-0 right-0 w-full sm:w-96 z-40 lg:relative lg:inset-auto"
                  : "hidden"
              } flex flex-col bg-white border-l-2 border-gray-200 w-96 flex-shrink-0 lg:flex`}
            >
              <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-[#1A2A4F]" />
                  <h3 className="text-lg font-bold text-[#1A2A4F]">
                    Participants
                  </h3>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden p-2 text-gray-600 hover:text-[#1A2A4F] hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6 border-b-2 border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#1A2A4F] flex items-center justify-center text-white font-bold flex-shrink-0 text-lg">
                      {ticket.buyerId.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-base">
                        {ticket.buyerId.fullName}
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
                </div>

                <div className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-lg">
                      {ticket.sellerId.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-base">
                        {ticket.sellerId.fullName}
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

              <div className="p-6 border-t-2 border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="space-y-4 text-sm mb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase mb-2">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}{" "}
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase mb-2">
                      Agreed Price
                    </p>
                    <p className="text-2xl font-black text-[#1A2A4F]">
                      ₹
                      {ticket.agreedPrice?.toLocaleString("en-IN") || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase mb-2">
                      Created
                    </p>
                    <p className="text-gray-700 font-semibold">
                      {moment(ticket.createdAt).format("MMM D, YYYY")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {getVisibleActions().map(renderActionButton)}
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(true);
                      setShowSidebar(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all"
                  >
                    <Info className="h-5 w-5" /> Full Details
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
      />

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
                Please rate the seller before closing the ticket.
              </p>
              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-12 w-12 transition-all ${
                        s <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRatingModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseTicket}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:opacity-90 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingRating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
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

      {/* Completion Modal */}
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
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-[#1A2A4F]">
                  Confirm Completion
                </h3>
                <button
                  onClick={() => setIsCompletionModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Are you sure the work is complete? Please rate the buyer.
              </p>
              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-12 w-12 transition-all ${
                        s <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsCompletionModalOpen(false);
                    setRating(0);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCompletionRating}
                  disabled={rating === 0 || isSubmittingRating}
                  className="flex-1 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:opacity-90 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingRating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Confirming...
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
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 my-8"
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
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">
                    Gig Information
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                    <p className="font-bold text-gray-900 text-base mb-2">
                      {ticket.gigId.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {ticket.gigId.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500 font-semibold">
                        Category:
                      </span>
                      <span className="font-bold text-[#1A2A4F]">
                        {ticket.gigId.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">
                    Participants
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-[#1A2A4F] flex items-center justify-center text-white font-bold text-lg">
                          {ticket.buyerId.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Buyer</p>
                          <p className="text-sm text-gray-600 font-medium">
                            {ticket.buyerId.fullName}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {ticket.sellerId.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Seller</p>
                          <p className="text-sm text-gray-600 font-medium">
                            {ticket.sellerId.fullName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">
                      Agreed Price
                    </h4>
                    <p className="text-3xl font-black text-[#1A2A4F]">
                      ₹
                      {ticket.agreedPrice?.toLocaleString("en-IN") || "Not set"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Status</h4>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}{" "}
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Timeline</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-semibold">
                        Created:
                      </span>
                      <span className="font-bold text-gray-900">
                        {moment(ticket.createdAt).format("MMM D, YYYY h:mm A")}
                      </span>
                    </div>
                    {ticket.updatedAt !== ticket.createdAt && (
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 font-semibold">
                          Last Updated:
                        </span>
                        <span className="font-bold text-gray-900">
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
                className="mt-8 w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all"
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
