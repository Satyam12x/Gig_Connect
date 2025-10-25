const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Chat Message Schema
const messageSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

// Initialize Socket.io
const setupSocket = (server, authMiddleware) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  console.log("Socket.io server initialized on http://localhost:5000/socket.io/");

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("Socket connection attempt with token:", token);
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = require("jsonwebtoken").verify(
        token,
        process.env.JWT_SECRET
      );
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on("sendMessage", async (payload) => {
      try {
        const { content, userId } = payload;
        if (!content || !content.trim()) {
          return socket.emit("error", "Message content is required");
        }

        const User = mongoose.model("User");
        const user = await User.findOne({ _id: userId });
        if (!user) {
          return socket.emit("error", "User not found");
        }

        const message = new Message({
          _id: uuidv4(),
          content: content.trim(),
          userId,
          username: user.fullName,
          profilePicture: user.profilePicture || "http://localhost:5000/uploads/default-avatar.png",
        });

        await message.save();
        console.log("Message saved:", {
          _id: message._id,
          userId,
          profilePicture: message.profilePicture,
        });
        io.emit("message", {
          _id: message._id,
          content: message.content,
          userId: message.userId,
          user: {
            username: user.fullName,
            profilePicture: user.profilePicture || "http://localhost:5000/uploads/default-avatar.png",
          },
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error("Error sending message:", err);
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// HTTP Route to Fetch Messages
const setupRoutes = (authMiddleware) => {
  router.get("/messages", authMiddleware, async (req, res) => {
    try {
      const messages = await Message.find()
        .sort({ createdAt: 1 })
        .populate("userId", "fullName profilePicture")
        .lean();
      console.log("Messages fetched:", messages.map((msg) => ({
        userId: msg.userId._id,
        profilePicture: msg.userId.profilePicture,
      })));
      res.json(
        messages.map((msg) => ({
          _id: msg._id,
          content: msg.content,
          userId: msg.userId._id,
          user: {
            username: msg.userId.fullName,
            profilePicture: msg.userId.profilePicture || "http://localhost:5000/uploads/default-avatar.png",
          },
          createdAt: msg.createdAt,
        }))
      );
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
};

module.exports = { setupSocket, setupRoutes };