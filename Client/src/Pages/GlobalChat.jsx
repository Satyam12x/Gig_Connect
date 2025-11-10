import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import {
  Send,
  User,
  Search,
  MoreVertical,
  Smile,
  X,
  CheckCheck,
  MessageCircle,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

// Color theme matching your website
const COLORS = {
  navy: "#1A2A4F",
  navyLight: "#2A3A6F",
  cyan: "#06B6D4",
  cyanLight: "#22D3EE",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray600: "#4B5563",
};

const GlobalChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showProfileOptions, setShowProfileOptions] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const typingTimeoutRef = useRef(null);

  // Common emojis for quick access
  const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "💯", "✨", "👏", "🚀"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to access the chat.");
      navigate("/login");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
      setUsername(decoded.fullName || "User");
    } catch (err) {
      toast.error("Invalid token. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      const token = localStorage.getItem("token");
      const socketInstance = io(API_BASE, {
        auth: { token },
        path: "/socket.io",
      });

      socketInstance.on("connect", () => {
        console.log("Connected to global chat");
        socketInstance.emit("joinGlobalChat");
      });

      socketInstance.on("globalMessage", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      socketInstance.on("userCount", (count) => {
        setOnlineUsers(count);
      });

      socketInstance.on("userTyping", ({ userId: typingUserId }) => {
        if (typingUserId !== userId) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connect error:", err.message);
        if (
          err.message === "Authentication error" ||
          err.message === "Invalid token"
        ) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        }
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [userId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    socket.emit(
      "sendGlobalMessage",
      { content: message.trim() },
      (response) => {
        if (response.error) {
          toast.error(response.error);
        } else {
          setMessage("");
          setShowEmojiPicker(false);
        }
      }
    );
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit("typing", { userId });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { userId });
      }, 1000);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleProfileClick = (msgUserId, e) => {
    e.stopPropagation();
    setShowProfileOptions(showProfileOptions === msgUserId ? null : msgUserId);
  };

  const handleViewProfile = (profileUserId) => {
    navigate(`/users/${profileUserId}`);
    setShowProfileOptions(null);
  };

  const filteredMessages = searchQuery
    ? messages.filter(
        (msg) =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

    return date.toLocaleDateString();
  };

  const chatRules = [
    { icon: "🤝", text: "Be respectful and courteous to all users" },
    { icon: "🚫", text: "No spamming or inappropriate content" },
    { icon: "💬", text: "Keep discussions relevant to the platform" },
    { icon: "🔒", text: "Don't share personal or sensitive information" },
    { icon: "⚠️", text: "Report violations to moderators" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Toaster position="top-right" />
      <Navbar />

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .message-bubble {
          animation: slideIn 0.3s ease-out;
        }

        .typing-indicator span {
          animation: blink 1.4s infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes blink {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }

        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(26, 42, 79, 0.15);
        }
      `}</style>

      {/* Enhanced Header */}
      <div
        className="sticky top-0 z-50 shadow-lg"
        style={{ backgroundColor: COLORS.navy }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${COLORS.cyan}30`,
                  border: `2px solid ${COLORS.cyan}`,
                }}
              >
                <MessageCircle size={24} style={{ color: COLORS.cyan }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Global Chat</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-sm" style={{ color: COLORS.gray200 }}>
                    {onlineUsers} users online
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 transition-all">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="mt-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.cyan}20` }}
              >
                <Users size={16} style={{ color: COLORS.cyan }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Messages</p>
                <p className="text-sm font-bold" style={{ color: COLORS.navy }}>
                  {messages.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.cyan}20` }}
              >
                <TrendingUp size={16} style={{ color: COLORS.cyan }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Now</p>
                <p className="text-sm font-bold" style={{ color: COLORS.navy }}>
                  {onlineUsers}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.cyan}20` }}
              >
                <Zap size={16} style={{ color: COLORS.cyan }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Your Messages</p>
                <p className="text-sm font-bold" style={{ color: COLORS.navy }}>
                  {messages.filter((m) => m.senderId === userId).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-grow flex flex-col max-w-7xl mx-auto w-full">
        {/* Messages Area */}
        <div
          className="flex-grow overflow-y-auto p-4 space-y-3"
          style={{
            backgroundColor: COLORS.gray50,
            minHeight: "calc(100vh - 350px)",
          }}
        >
          {filteredMessages.length === 0 && !searchQuery ? (
            <div className="flex items-center justify-center h-full">
              <div
                className="max-w-md w-full p-8 rounded-2xl shadow-lg hover-lift"
                style={{ backgroundColor: COLORS.white }}
              >
                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${COLORS.cyan}20`,
                      border: `2px solid ${COLORS.cyan}30`,
                    }}
                  >
                    <MessageCircle size={32} style={{ color: COLORS.cyan }} />
                  </div>
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: COLORS.navy }}
                  >
                    Welcome to Global Chat!
                  </h2>
                  <p className="text-sm" style={{ color: COLORS.gray600 }}>
                    Connect with students and professionals worldwide
                  </p>
                </div>

                <div className="space-y-3">
                  <h3
                    className="font-semibold text-sm mb-3"
                    style={{ color: COLORS.navy }}
                  >
                    Chat Guidelines
                  </h3>
                  {chatRules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: COLORS.gray50 }}
                    >
                      <span className="text-xl">{rule.icon}</span>
                      <p className="text-xs" style={{ color: COLORS.gray600 }}>
                        {rule.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {filteredMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex mb-3 message-bubble ${
                    msg.senderId === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-end gap-2 max-w-[75%]">
                    {msg.senderId !== userId && (
                      <div className="relative">
                        <img
                          src={msg.profilePicture || "/default-avatar.png"}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform"
                          onClick={(e) => handleProfileClick(msg.senderId, e)}
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        {showProfileOptions === msg.senderId && (
                          <div
                            className="absolute bottom-10 left-0 shadow-xl rounded-xl p-2 border z-10 min-w-[140px]"
                            style={{
                              backgroundColor: COLORS.white,
                              borderColor: COLORS.gray200,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleViewProfile(msg.senderId)}
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg w-full hover:bg-gray-100 transition-colors"
                              style={{ color: COLORS.navy }}
                            >
                              <User className="w-4 h-4" />
                              View Profile
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl shadow-sm ${
                        msg.senderId === userId
                          ? "rounded-br-none"
                          : "rounded-bl-none"
                      }`}
                      style={{
                        backgroundColor:
                          msg.senderId === userId ? COLORS.cyan : COLORS.white,
                        color:
                          msg.senderId === userId ? COLORS.white : COLORS.navy,
                      }}
                    >
                      {msg.senderId !== userId && (
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{
                            color:
                              msg.senderId === userId
                                ? COLORS.white
                                : COLORS.cyan,
                          }}
                        >
                          {msg.senderName}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <p
                          className="text-[10px]"
                          style={{
                            color:
                              msg.senderId === userId
                                ? "rgba(255,255,255,0.7)"
                                : COLORS.gray600,
                          }}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                        {msg.senderId === userId && (
                          <CheckCheck
                            size={14}
                            style={{
                              color: "rgba(255,255,255,0.7)",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start mb-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white shadow-sm">
                    <div className="typing-indicator flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    </div>
                    <p className="text-xs text-gray-500 ml-1">typing...</p>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Message Input */}
        <div
          className="border-t shadow-lg"
          style={{
            backgroundColor: COLORS.white,
            borderColor: COLORS.gray200,
          }}
        >
          <div className="max-w-7xl mx-auto p-4">
            {showEmojiPicker && (
              <div
                className="mb-3 p-3 rounded-xl border"
                style={{
                  backgroundColor: COLORS.gray50,
                  borderColor: COLORS.gray200,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="text-xs font-medium"
                    style={{ color: COLORS.navy }}
                  >
                    Quick Emojis
                  </p>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X size={14} style={{ color: COLORS.gray600 }} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-all"
              >
                <Smile size={22} style={{ color: COLORS.gray600 }} />
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message..."
                className="flex-grow px-4 py-3 text-sm rounded-xl border-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: COLORS.gray50,
                  color: COLORS.navy,
                  borderColor: COLORS.gray200,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.cyan;
                  e.target.style.backgroundColor = COLORS.white;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.gray200;
                  e.target.style.backgroundColor = COLORS.gray50;
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundColor: COLORS.cyan,
                  boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
                }}
              >
                <Send size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
