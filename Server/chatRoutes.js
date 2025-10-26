const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const express = require("express");

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

// Initialize Socket.io for Global Chat (Namespace: /global)
const setupSocket = (io) => {
  const globalIo = io.of("/global"); // Use namespace on the provided Socket.io Server instance
  console.log(
    "Socket.io global chat initialized on http://localhost:5000/global"
  );

  globalIo.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("Global chat socket connection attempt with token:", token);
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = require("jsonwebtoken").verify(
        token,
        process.env.JWT_SECRET
      );
      socket.userId = decoded.id;
      socket.user = decoded;
      next();
    } catch (err) {
      console.error("Global chat socket auth error:", err.message);
      next(new Error("Invalid token"));
    }
  });

  globalIo.on("connection", async (socket) => {
    console.log(`User connected to global chat: ${socket.userId}`);

    socket.on("sendMessage", async (payload, callback) => {
      try {
        const { content, userId } = payload;
        if (!content || !content.trim()) {
          console.error("Empty message content:", { userId });
          return callback({ error: "Message content is required" });
        }

        const User = mongoose.model("User");
        const user = await User.findOne({ _id: userId });
        if (!user) {
          console.error("User not found for global chat:", { userId });
          return callback({ error: "User not found" });
        }

        const message = new Message({
          _id: uuidv4(),
          content: content.trim(),
          userId,
          username: user.fullName,
          profilePicture:
            user.profilePicture ||
            "http://localhost:5000/uploads/default-avatar.png",
        });

        await message.save();
        console.log("Global chat message saved:", {
          _id: message._id,
          userId,
          profilePicture: message.profilePicture,
        });

        globalIo.emit("message", {
          _id: message._id,
          content: message.content,
          userId: message.userId,
          user: {
            username: user.fullName,
            profilePicture:
              user.profilePicture ||
              "http://localhost:5000/uploads/default-avatar.png",
          },
          createdAt: message.createdAt,
        });

        callback({ success: true, message });
      } catch (err) {
        console.error("Error sending global chat message:", {
          error: err.message,
          userId: socket.userId,
        });
        callback({ error: "Failed to send message", details: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected from global chat: ${socket.userId}`);
    });
  });

  return globalIo;
};

// HTTP Route to Fetch Messages
const setupRoutes = (authMiddleware) => {
  router.get("/messages", authMiddleware, async (req, res) => {
    try {
      const messages = await Message.find()
        .sort({ createdAt: 1 })
        .populate("userId", "fullName profilePicture")
        .lean();
      console.log(
        "Global chat messages fetched:",
        messages.map((msg) => ({
          userId: msg.userId._id,
          profilePicture: msg.userId.profilePicture,
        }))
      );
      res.json(
        messages.map((msg) => ({
          _id: msg._id,
          content: msg.content,
          userId: msg.userId._id,
          user: {
            username: msg.userId.fullName,
            profilePicture:
              msg.userId.profilePicture ||
              "http://localhost:5000/uploads/default-avatar.png",
          },
          createdAt: msg.createdAt,
        }))
      );
    } catch (err) {
      console.error("Error fetching global chat messages:", {
        error: err.message,
        userId: req.userId,
      });
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  return router;
};

module.exports = { setupSocket, setupRoutes };