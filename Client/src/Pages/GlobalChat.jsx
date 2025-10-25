import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Send, User, Search, MoreVertical } from "lucide-react";

const API_BASE = "http://localhost:5000";
const socket = io(API_BASE, {
  auth: { token: localStorage.getItem("token") },
});
console.log(
  "Socket.io client initialized with token:",
  localStorage.getItem("token")
);

const GlobalChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showProfileOptions, setShowProfileOptions] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return null;
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded token payload:", payload);
      return payload.id;
    } catch (err) {
      console.error("Error parsing token:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching messages with token:", token);
        const response = await fetch(`${API_BASE}/api/chat/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched messages:", data);
        setMessages(data);
      } catch (err) {
        console.error("Fetch messages error:", err);
        toast.error("Failed to load chat messages");
      }
    };

    fetchMessages();

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("message", (newMessage) => {
      console.log("Received message:", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.io connect error:", err.message);
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

    const userId = getUserIdFromToken();
    if (!userId) {
      toast.error("Authentication error: Invalid token");
      return;
    }

    const payload = {
      content: message.trim(),
      userId,
    };
    console.log("Sending message:", payload);
    socket.emit("sendMessage", payload);
    setMessage("");
  };

  const handleProfileClick = (userId, e) => {
    e.stopPropagation();
    setShowProfileOptions(showProfileOptions === userId ? null : userId);
  };

  const handleViewProfile = (userId) => {
    navigate(`/users/${userId}`); // Updated to match /users/:id route
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
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Toaster position="top-right" />
      <Navbar />

      <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full">
        {/* WhatsApp-like Header */}
        <div className="bg-[#075E54] text-white p-3 sm:p-4 flex items-center justify-between shadow-md">
          <h1 className="text-lg sm:text-xl font-semibold">Global Chat</h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <Search className="w-5 h-5 cursor-pointer" />
            <MoreVertical className="w-5 h-5 cursor-pointer" />
          </div>
        </div>

        {/* Chat Area */}
        <div
          className="flex-grow bg-[url('/chat-background.jpg')] bg-repeat bg-[length:300px_300px] overflow-y-auto p-3 sm:p-4"
          style={{ backgroundColor: "#E5DDD5" }}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="max-w-xs sm:max-w-sm md:max-w-md bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  Chat Rules & Regulations
                </h2>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                  {chatRules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-800 font-medium">•</span>
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
                className={`flex mb-2 sm:mb-3 ${
                  msg.userId === getUserIdFromToken()
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div className="flex items-end gap-2 max-w-[80%] sm:max-w-[70%]">
                  {msg.userId !== getUserIdFromToken() && (
                    <div className="relative">
                      <img
                        src={msg.user.profilePicture || "/default-avatar.png"}
                        alt={msg.user.username}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer"
                        onClick={(e) => handleProfileClick(msg.userId, e)}
                        onError={(e) => {
                          console.error(
                            "Image failed to load:",
                            msg.user.profilePicture
                          );
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                      {showProfileOptions === msg.userId && (
                        <div className="absolute bottom-10 left-0 bg-white shadow-lg rounded-lg p-2 border border-gray-300 z-10 min-w-[120px]">
                          <button
                            onClick={() => handleViewProfile(msg.userId)}
                            className="flex items-center gap-2 px-3 py-1 text-xs sm:text-sm text-gray-800 hover:bg-gray-100 rounded-lg w-full"
                          >
                            <User className="w-4 h-4" />
                            View Profile
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`p-2 sm:p-3 rounded-lg shadow-sm ${
                      msg.userId === getUserIdFromToken()
                        ? "bg-[#DCF8C6] text-gray-800"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <p className="text-xs sm:text-sm font-semibold">
                        {msg.user.username}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm mt-1">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="bg-[#F0F0F0] p-2 sm:p-3 flex items-center gap-2 border-t border-gray-300"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow px-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-white text-gray-800 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#25D366] focus:border-transparent placeholder-gray-400"
          />
          <button
            type="submit"
            className="p-2 sm:p-2.5 bg-[#25D366] text-white rounded-full hover:bg-[#20C058] transition-all duration-200"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default GlobalChat;
