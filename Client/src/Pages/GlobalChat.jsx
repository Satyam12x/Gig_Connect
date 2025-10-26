import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { Send, User, Search, MoreVertical } from "lucide-react";

const API_BASE = "http://localhost:5000";

const GlobalChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showProfileOptions, setShowProfileOptions] = useState(null);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Initialize userId and username from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      toast.error("Please log in to access the chat.");
      navigate("/login");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
      setUsername(decoded.fullName || "User");
    } catch (err) {
      console.error("Error decoding token:", err);
      toast.error("Invalid token. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // Initialize Socket.io
  useEffect(() => {
    if (userId) {
      const token = localStorage.getItem("token");
      const socketInstance = io(`${API_BASE}/global`, {
        auth: { token },
      });

      socketInstance.on("connect", () => {
        console.log("Connected to global chat WebSocket server:", socketInstance.id);
      });

      socketInstance.on("message", (newMessage) => {
        console.log("Received message:", newMessage);
        setMessages((prev) => [...prev, newMessage]);
      });

      socketInstance.on("error", (error) => {
        console.error("Socket.io error:", error);
        toast.error(error || "Chat error occurred.");
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket.io connect error:", err.message);
        if (err.message === "Authentication error" || err.message === "Invalid token") {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error("Connection error: " + err.message);
        }
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.off("message");
        socketInstance.off("error");
        socketInstance.off("connect_error");
        socketInstance.disconnect();
        console.log("Disconnected from global chat socket");
      };
    }
  }, [userId, navigate]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    if (!userId || !socket) {
      toast.error("Authentication error: Please log in again.");
      navigate("/login");
      return;
    }

    const payload = {
      content: message.trim(),
      userId,
    };
    console.log("Sending message:", payload);
    socket.emit("sendMessage", payload, (response) => {
      if (response.error) {
        console.error("Error sending message:", response.error);
        toast.error(response.error);
      } else {
        setMessage("");
      }
    });
  };

  const handleProfileClick = (userId, e) => {
    e.stopPropagation();
    setShowProfileOptions(showProfileOptions === userId ? null : userId);
  };

  const handleViewProfile = (userId) => {
    navigate(`/users/${userId}`);
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

      <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full mt-4 sm:mt-6 px-2 sm:px-4">
        {/* WhatsApp-like Header */}
        <div className="bg-[#075E54] text-white p-3 sm:p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
          <h1 className="text-base sm:text-lg font-semibold">Global Chat</h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
          </div>
        </div>

        {/* Chat Area */}
        <div
          className="flex-grow bg-[url('/chat-background.jpg')] bg-repeat bg-[length:200px_200px] overflow-y-auto p-2 sm:p-3"
          style={{
            backgroundColor: "#E5DDD5",
            minHeight: "calc(100vh - 180px)",
          }}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="max-w-[90%] sm:max-w-sm bg-white p-3 sm:p-4 rounded-lg shadow-md">
                <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                  Chat Rules & Regulations
                </h2>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
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
                  msg.userId === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-end gap-1 sm:gap-2 max-w-[80%] sm:max-w-[70%]">
                  {msg.userId !== userId && (
                    <div className="relative">
                      <img
                        src={msg.user.profilePicture || "/default-avatar.png"}
                        alt={msg.user.username}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer"
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
                        <div className="absolute bottom-8 sm:bottom-10 left-0 bg-white shadow-lg rounded-lg p-2 border border-gray-300 z-10 min-w-[100px] sm:min-w-[120px]">
                          <button
                            onClick={() => handleViewProfile(msg.userId)}
                            className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-gray-800 hover:bg-gray-100 rounded-lg w-full"
                          >
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            View Profile
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`p-2 sm:p-3 rounded-lg shadow-sm ${
                      msg.userId === userId
                        ? "bg-[#DCF8C6] text-gray-800"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <p className="text-xs sm:text-sm font-semibold">
                        {msg.user.username}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500">
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
          className="bg-[#F0F0F0] p-2 sm:p-3 flex items-center gap-2 border-t border-gray-300 sticky bottom-0"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-gray-800 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#25D366] focus:border-transparent placeholder-gray-400"
          />
          <button
            type="submit"
            className="p-1.5 sm:p-2 bg-[#25D366] text-white rounded-full hover:bg-[#20C058] transition-all duration-200"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GlobalChat;