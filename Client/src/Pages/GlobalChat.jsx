import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Send, User } from "lucide-react";

const API_BASE = "http://localhost:5000";
const socket = io(API_BASE, {
  auth: { token: localStorage.getItem("token") },
});

const GlobalChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showProfileOptions, setShowProfileOptions] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/chat/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        toast.error("Failed to load chat messages");
      }
    };

    fetchMessages();

    // Socket.io events
    socket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    socket.on("message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("connect_error", (err) => {
      toast.error("Connection error: " + err.message);
    });

    return () => {
      socket.off("message");
      socket.off("connect_error");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");
    const payload = {
      content: message.trim(),
      userId: JSON.parse(atob(token.split(".")[1])).userId,
    };

    socket.emit("sendMessage", payload);
    setMessage("");
  };

  const handleProfileClick = (userId, e) => {
    e.stopPropagation();
    setShowProfileOptions(showProfileOptions === userId ? null : userId);
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
    setShowProfileOptions(null);
  };

  const handleClickOutside = () => {
    setShowProfileOptions(null);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const chatRules = [
    "Be respectful and courteous to all users.",
    "No spamming or posting inappropriate content.",
    "Keep discussions relevant to the platform.",
    "Do not share personal or sensitive information.",
    "Report any violations to the moderators.",
  ];

  return (
    <div className="min-h-screen bg-blue-50 font-sans flex flex-col">
      <Toaster position="top-right" />
      <Navbar />

      <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2A4F] mb-6">
          Global Chat
        </h1>

        <div className="flex-grow bg-white shadow-2xl rounded-3xl border border-gray-300 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-grow p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="max-w-md">
                  <h2 className="text-lg font-semibold text-[#1A2A4F] mb-4">
                    Chat Rules & Regulations
                  </h2>
                  <ul className="text-sm text-[#1A2A4F]/80 space-y-2">
                    {chatRules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#1A2A4F] font-medium">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 mb-4 ${
                    msg.userId ===
                    JSON.parse(
                      atob(localStorage.getItem("token").split(".")[1])
                    ).userId
                      ? "justify-end"
                      : ""
                  }`}
                >
                  {msg.userId !==
                    JSON.parse(
                      atob(localStorage.getItem("token").split(".")[1])
                    ).userId && (
                    <div className="relative">
                      <img
                        src={msg.user.profilePicture || "/default-avatar.png"}
                        alt={msg.user.username}
                        className="w-10 h-10 rounded-full cursor-pointer"
                        onClick={(e) => handleProfileClick(msg.userId, e)}
                      />
                      {showProfileOptions === msg.userId && (
                        <div className="absolute top-12 left-0 bg-white shadow-lg rounded-lg p-2 border border-gray-300 z-10">
                          <button
                            onClick={() => handleViewProfile(msg.userId)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-[#1A2A4F] hover:bg-blue-50 rounded-lg w-full"
                          >
                            <User className="w-4 h-4" />
                            View Profile
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.userId ===
                      JSON.parse(
                        atob(localStorage.getItem("token").split(".")[1])
                      ).userId
                        ? "bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F]"
                        : "bg-gray-100 text-[#1A2A4F]"
                    }`}
                  >
                    <p className="text-sm font-semibold">{msg.user.username}</p>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs text-[#1A2A4F]/60 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-300"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 text-base text-[#1A2A4F] border border-gray-300 rounded-lg focus:ring-2 focus:ring-navyBlue focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-navyBlue to-navyBlueLight text-[#1A2A4F] font-semibold text-base rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GlobalChat;
