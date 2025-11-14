//backend code (currently not in use)
const { check, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Server } = require("socket.io");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const Ticket = mongoose.model("Ticket");
const User = mongoose.model("User");
const Gig = mongoose.model("Gig");
const Application = mongoose.model("Application");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rate limiters
const messageLimiter = require("express-rate-limit")({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: "Too many messages sent, please wait a minute.",
  keyGenerator: (req) => req.userId || req.ip,
});

const attachmentLimiter = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many attachment uploads, please try again later.",
  keyGenerator: (req) => req.userId || req.ip,
});

// Validation middleware
const validateMessage = [
  check("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
];

const validatePrice = [
  check("agreedPrice")
    .isFloat({ min: 0.01 })
    .withMessage("Agreed price must be a positive number"),
];

const validateRating = [
  check("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be a number between 1 and 5"),
];

// Ticket participant middleware
const checkTicketParticipant = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id }).lean();
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (![ticket.sellerId, ticket.buyerId].includes(req.userId)) {
      return res
        .status(403)
        .json({ error: "Only ticket participants can perform this action" });
    }
    req.ticket = ticket;
    next();
  } catch (err) {
    console.error("Ticket participant check error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Setup ticket socket
const setupTicketSocket = (httpServer) => {
  const ticketIo = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/ticket-socket",
  });

  console.log(
    "Socket.io ticket chat initialized on http://localhost:5000/ticket-socket"
  );

  ticketIo.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("Ticket chat socket connection attempt with token:", token);
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
      console.error("Ticket chat socket auth error:", err.message);
      next(new Error("Invalid token"));
    }
  });

  ticketIo.on("connection", async (socket) => {
    console.log(`User connected to ticket chat: ${socket.userId}`);

    socket.on("joinTicket", (ticketId) => {
      socket.join(ticketId);
      console.log(`User ${socket.userId} joined ticket room: ${ticketId}`);
    });

    socket.on("sendMessage", async (payload, callback) => {
      try {
        const { ticketId, content } = payload;
        if (!content || !content.trim()) {
          return callback({ error: "Message content is required" });
        }

        const ticket = await Ticket.findOne({ _id: ticketId });
        if (!ticket) {
          return callback({ error: "Ticket not found" });
        }

        const user = await User.findOne({ _id: socket.userId });
        if (!user) {
          return callback({ error: "User not found" });
        }

        ticket.messages.push({
          senderId: socket.userId,
          senderName: user.fullName,
          content: content.trim(),
          timestamp: new Date(),
          read: false,
        });

        ticket.timeline.push({
          action: `Message sent by ${user.fullName}`,
          timestamp: new Date(),
        });

        await ticket.save();
        console.log("Ticket chat message saved:", {
          ticketId,
          userId: socket.userId,
          content,
        });

        ticketIo.to(ticketId).emit("newMessage", ticket);
        callback({ success: true });
      } catch (err) {
        console.error("Error sending ticket chat message:", {
          error: err.message,
          userId: socket.userId,
          ticketId: payload.ticketId,
        });
        callback({ error: "Failed to send message", details: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected from ticket chat: ${socket.userId}`);
    });
  });

  return ticketIo;
};

// Ticket routes
const setupTicketRoutes = (app, authMiddleware, upload) => {
  app.get("/api/tickets", authMiddleware, async (req, res) => {
    try {
      const tickets = await Ticket.find({
        $or: [{ sellerId: req.userId }, { buyerId: req.userId }],
      })
        .populate("gigId", "title")
        .populate("sellerId", "fullName email profilePicture")
        .populate("buyerId", "fullName email profilePicture")
        .sort({ createdAt: -1 })
        .lean();
      console.log("Tickets fetched:", {
        userId: req.userId,
        count: tickets.length,
      });
      res.json({ success: true, tickets });
    } catch (err) {
      console.error("Get tickets error:", err.message, { userId: req.userId });
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

  app.get(
    "/api/tickets/:id",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id })
          .populate("gigId", "title price")
          .populate("sellerId", "fullName email profilePicture")
          .populate("buyerId", "fullName email profilePicture")
          .lean();
        if (!ticket) {
          console.error("Ticket not found for ID:", req.params.id);
          return res.status(404).json({ error: "Ticket not found" });
        }
        console.log("Fetched ticket:", { id: ticket._id, gigId: ticket.gigId });
        res.json(ticket);
      } catch (err) {
        console.error("Get ticket error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.get(
    "/api/tickets/:id/timeline",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticketId = req.params.id;
        if (!/^[0-9a-fA-F]{32}$/.test(ticketId)) {
          console.error("Invalid ticket ID format:", {
            ticketId,
            userId: req.userId,
          });
          return res.status(400).json({ error: "Invalid ticket ID format" });
        }

        const ticket = await Ticket.findOne({ _id: ticketId })
          .select("timeline")
          .lean();
        if (!ticket) {
          console.error("Ticket not found for timeline:", {
            ticketId,
            userId: req.userId,
          });
          return res.status(404).json({ error: "Ticket not found" });
        }
        console.log("Fetched ticket timeline:", {
          ticketId,
          events: ticket.timeline.length,
          userId: req.userId,
        });
        res.json({ success: true, timeline: ticket.timeline });
      } catch (err) {
        console.error("Get ticket timeline error:", {
          error: err.message,
          ticketId: req.params.id,
          userId: req.userId,
        });
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.post(
    "/api/tickets/:id/messages",
    authMiddleware,
    checkTicketParticipant,
    messageLimiter,
    validateMessage,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("Validation errors for message:", errors.array(), {
          ticketId: req.params.id,
          userId: req.userId,
        });
        return res.status(400).json({ errors: errors.array() });
      }

      const { content } = req.body;
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status === "closed") {
          return res.status(400).json({ error: "Ticket is closed" });
        }

        ticket.messages.push({
          senderId: req.userId,
          senderName: req.user.fullName,
          content: sanitizeHtml(content),
          timestamp: new Date(),
          read: false,
        });
        if (ticket.status === "open") {
          ticket.status = "negotiating";
          ticket.timeline.push({
            action: `Ticket moved to negotiating by ${req.user.fullName}`,
            timestamp: new Date(),
          });
        }
        ticket.timeline.push({
          action: `Message sent by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        const recipientId =
          ticket.sellerId === req.userId ? ticket.buyerId : ticket.sellerId;
        const recipient = await User.findOne({ _id: recipientId }).lean();
        if (recipient) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient.email,
            subject: `New Message in Ticket for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${recipient.fullName},</p><p>You have a new message from ${req.user.fullName} in ticket for "${ticket.gigId.title}":</p><p>"${content}"</p><p>View the ticket at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            console.error("Failed to send message notification email:", err);
          });
        }

        console.log("Message sent in ticket:", {
          ticketId: req.params.id,
          senderId: req.userId,
          contentLength: content.length,
        });
        res.json({ success: true, ticket });
      } catch (err) {
        console.error("Send message error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.post(
    "/api/tickets/:id/messages/attachment",
    authMiddleware,
    checkTicketParticipant,
    attachmentLimiter,
    upload.single("attachment"),
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status === "closed") {
          return res.status(400).json({ error: "Ticket is closed" });
        }

        const content = req.body.content ? sanitizeHtml(req.body.content) : "";
        let attachmentUrl = "";
        if (req.file) {
          const fileStream = Readable.from(req.file.buffer);
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "gigconnect/attachments", resource_type: "auto" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            fileStream.pipe(uploadStream);
          });
          attachmentUrl = uploadResult.secure_url;
        }

        if (!content && !attachmentUrl) {
          return res
            .status(400)
            .json({ error: "Message content or attachment is required" });
        }

        ticket.messages.push({
          senderId: req.userId,
          senderName: req.user.fullName,
          content,
          attachment: attachmentUrl,
          timestamp: new Date(),
          read: false,
        });
        if (ticket.status === "open") {
          ticket.status = "negotiating";
          ticket.timeline.push({
            action: `Ticket moved to negotiating by ${req.user.fullName}`,
            timestamp: new Date(),
          });
        }
        ticket.timeline.push({
          action: `Message with ${
            attachmentUrl ? "attachment" : "text"
          } sent by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        const recipientId =
          ticket.sellerId === req.userId ? ticket.buyerId : ticket.sellerId;
        const recipient = await User.findOne({ _id: recipientId }).lean();
        if (recipient) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient.email,
            subject: `New Message in Ticket for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${
              recipient.fullName
            },</p><p>You have a new message from ${
              req.user.fullName
            } in ticket for "${ticket.gigId.title}":</p><p>"${
              content || "Attachment only"
            }"</p>${
              attachmentUrl
                ? `<p><a href="${attachmentUrl}">View Attachment</a></p>`
                : ""
            }<p>View the ticket at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            console.error("Failed to send message notification email:", err);
          });
        }

        console.log("Message with attachment sent:", {
          ticketId: req.params.id,
          senderId: req.userId,
          attachment: attachmentUrl || "None",
          contentLength: content.length,
        });
        res.json({ success: true, ticket });
      } catch (err) {
        console.error("Send message with attachment error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.patch(
    "/api/tickets/:id/price",
    authMiddleware,
    checkTicketParticipant,
    validatePrice,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("Validation errors for price update:", errors.array(), {
          ticketId: req.params.id,
          userId: req.userId,
        });
        return res.status(400).json({ errors: errors.array() });
      }

      const { agreedPrice } = req.body;
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status === "closed") {
          return res.status(400).json({ error: "Ticket is closed" });
        }

        ticket.agreedPrice = parseFloat(agreedPrice);
        ticket.status = "negotiating";
        ticket.timeline.push({
          action: `Price of ₹${agreedPrice.toLocaleString(
            "en-IN"
          )} proposed by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        const otherUserId =
          ticket.sellerId === req.userId ? ticket.buyerId : ticket.sellerId;
        const otherUser = await User.findOne({ _id: otherUserId }).lean();
        if (otherUser) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: otherUser.email,
            subject: `Price Proposed for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${
              otherUser.fullName
            },</p><p>A price of ₹${agreedPrice.toLocaleString(
              "en-IN"
            )} has been proposed for the gig "${
              ticket.gigId.title
            }".</p><p>Accept or negotiate at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            console.error("Failed to send price proposal email:", err);
          });
        }

        console.log("Ticket price proposed:", {
          ticketId: req.params.id,
          agreedPrice,
        });
        res.json({ success: true, ticket });
      } catch (err) {
        console.error("Update ticket price error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.patch(
    "/api/tickets/:id/accept-price",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status !== "negotiating") {
          return res.status(400).json({
            error: "Ticket must be in negotiating status to accept price",
          });
        }
        if (req.userId !== ticket.buyerId) {
          return res
            .status(403)
            .json({ error: "Only the buyer can accept the price" });
        }
        if (!ticket.agreedPrice) {
          return res.status(400).json({ error: "No agreed price set" });
        }

        ticket.status = "accepted";
        ticket.timeline.push({
          action: `Price accepted by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        const seller = await User.findOne({ _id: ticket.sellerId }).lean();
        if (seller) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: seller.email,
            subject: `Price Accepted for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${seller.fullName},</p><p>${
              req.user.fullName
            } has accepted the price of ₹${ticket.agreedPrice.toLocaleString(
              "en-IN"
            )} for "${
              ticket.gigId.title
            }".</p><p>Please wait for payment confirmation at: /tickets/${
              ticket._id
            }</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            console.error("Failed to send price acceptance email:", err);
          });
        }

        console.log("Ticket price accepted:", {
          ticketId: req.params.id,
          agreedPrice: ticket.agreedPrice,
        });
        res.json({ success: true, ticket });
      } catch (err) {
        console.error("Accept ticket price error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.patch(
    "/api/tickets/:id/pay",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.status !== "accepted") {
          return res.status(400).json({
            error: "Ticket must be in accepted status to confirm payment",
          });
        }
        if (req.userId !== ticket.buyerId) {
          return res
            .status(403)
            .json({ error: "Only the buyer can confirm payment" });
        }

        ticket.status = "paid";
        ticket.timeline.push({
          action: `Payment confirmed by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        const seller = await User.findOne({ _id: ticket.sellerId });
        if (seller) {
          seller.credits = (seller.credits || 0) + ticket.agreedPrice;
          seller.orderHistory.push({
            title: ticket.gigId.title,
            status: "paid",
            earnings: ticket.agreedPrice,
            date: new Date(),
          });
          await seller.save();

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: seller.email,
            subject: `Payment Received for Gig "${ticket.gigId.title}"`,
            html: `<p>Dear ${
              seller.fullName
            },</p><p>Payment of ₹${ticket.agreedPrice.toLocaleString(
              "en-IN"
            )} for "${ticket.gigId.title}" has been confirmed by ${
              req.user.fullName
            }.</p><p>Complete the work at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            console.error("Failed to send payment confirmation email:", err);
          });
        }

        console.log("Payment confirmed for ticket:", {
          ticketId: req.params.id,
          agreedPrice: ticket.agreedPrice,
        });
        res.json({ success: true, ticket });
      } catch (err) {
        console.error("Confirm payment error:", {
          error: err.message,
          ticketId: req.params.id,
          userId: req.userId,
        });
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.patch(
    "/api/tickets/:id/complete",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) {
          console.error("Ticket not found for completion:", {
            ticketId: req.params.id,
            userId: req.userId,
          });
          return res.status(404).json({ error: "Ticket not found" });
        }
        if (ticket.status !== "paid") {
          console.error("Invalid ticket status for completion:", {
            ticketId: req.params.id,
            status: ticket.status,
            userId: req.userId,
          });
          return res.status(400).json({
            error: "Ticket must be in paid status to mark as completed",
          });
        }
        if (req.userId !== ticket.sellerId) {
          console.error("Unauthorized completion attempt:", {
            ticketId: req.params.id,
            userId: req.userId,
            sellerId: ticket.sellerId,
          });
          return res
            .status(403)
            .json({
              error: "Only the seller can mark the ticket as completed",
            });
        }

        ticket.status = "completed";
        ticket.timeline.push({
          action: `Ticket marked as completed by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        const buyer = await User.findOne({ _id: ticket.buyerId }).lean();
        if (buyer) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: buyer.email,
            subject: `Gig "${ticket.gigId.title}" Completed`,
            html: `<p>Dear ${buyer.fullName},</p><p>The gig "${ticket.gigId.title}" has been marked as completed by ${req.user.fullName}.</p><p>Please review the work and provide feedback at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            console.error("Failed to send completion email:", err);
          });
        }

        const seller = await User.findOne({ _id: ticket.sellerId });
        if (seller) {
          seller.gigsCompleted = (seller.gigsCompleted || 0) + 1;
          seller.completionRate = seller.totalGigs
            ? ((seller.gigsCompleted / seller.totalGigs) * 100).toFixed(2)
            : 0;
          seller.orderHistory = seller.orderHistory.map((order) =>
            order.title === ticket.gigId.title && order.status === "paid"
              ? { ...order, status: "completed" }
              : order
          );
          await seller.save();
        }

        console.log("Ticket marked as completed:", { ticketId: req.params.id });
        res.json({ success: true, ticket });
      } catch (err) {
        console.error("Complete ticket error:", {
          error: err.message,
          ticketId: req.params.id,
          userId: req.userId,
        });
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.patch(
    "/api/tickets/:id/close",
    authMiddleware,
    checkTicketParticipant,
    validateRating,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("Validation errors for close ticket:", {
          errors: errors.array(),
          ticketId: req.params.id,
          userId: req.userId,
        });
        return res.status(400).json({ errors: errors.array() });
      }

      const { rating } = req.body;
      try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        if (!ticket) {
          console.error("Ticket not found for closing:", {
            ticketId: req.params.id,
            userId: req.userId,
          });
          return res.status(404).json({ error: "Ticket not found" });
        }
        if (ticket.status !== "completed") {
          console.error("Invalid ticket status for closing:", {
            ticketId: req.params.id,
            status: ticket.status,
            userId: req.userId,
          });
          return res
            .status(400)
            .json({ error: "Ticket must be in completed status to close" });
        }
        if (req.userId !== ticket.buyerId) {
          console.error("Unauthorized close attempt:", {
            ticketId: req.params.id,
            userId: req.userId,
            buyerId: ticket.buyerId,
          });
          return res
            .status(403)
            .json({ error: "Only the buyer can close the ticket" });
        }

        ticket.status = "closed";
        ticket.timeline.push({
          action: `Ticket closed by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        if (rating) {
          const seller = await User.findOne({ _id: ticket.sellerId });
          if (seller) {
            seller.ratings.push({
              value: parseInt(rating),
              ticketId: ticket._id,
              giverId: req.userId,
              givenAt: new Date(),
            });
            await seller.save();

            const gig = await Gig.findOne({ _id: ticket.gigId });
            if (gig) {
              const ratings = await User.findOne({ _id: ticket.sellerId })
                .select("ratings")
                .lean();
              gig.rating = ratings.ratings.length
                ? (
                    ratings.ratings.reduce((sum, r) => sum + r.value, 0) /
                    ratings.ratings.length
                  ).toFixed(1)
                : 0;
              await gig.save();
            }
          }
        }

        const seller = await User.findOne({ _id: ticket.sellerId }).lean();
        if (seller) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: seller.email,
            subject: `Ticket for "${ticket.gigId.title}" Closed`,
            html: `<p>Dear ${seller.fullName},</p><p>The ticket for "${
              ticket.gigId.title
            }" has been closed by ${req.user.fullName}.</p>${
              rating ? `<p>You received a rating of ${rating}/5.</p>` : ""
            }<p>View details at: /tickets/${ticket._id}</p>`,
          };
          await transporter.sendMail(mailOptions).catch((err) => {
            console.error("Failed to send ticket close email:", err);
          });
        }

        console.log("Ticket closed:", {
          ticketId: req.params.id,
          rating: rating || "None",
        });
        res.json({ success: true, ticket });
      } catch (err) {
        console.error("Close ticket error:", {
          error: err.message,
          ticketId: req.params.id,
          userId: req.userId,
        });
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.patch(
    "/api/tickets/:id/messages/read",
    authMiddleware,
    checkTicketParticipant,
    async (req, res) => {
      try {
        const ticketId = req.params.id;
        if (!/^[0-9a-fA-F]{32}$/.test(ticketId)) {
          console.error("Invalid ticket ID format:", {
            ticketId,
            userId: req.userId,
          });
          return res.status(400).json({ error: "Invalid ticket ID format" });
        }

        const ticket = await Ticket.findOne({ _id: ticketId });
        if (!ticket) {
          console.error("Ticket not found for marking messages read:", {
            ticketId,
            userId: req.userId,
          });
          return res.status(404).json({ error: "Ticket not found" });
        }

        ticket.messages = ticket.messages.map((msg) =>
          msg.senderId !== req.userId && !msg.read
            ? { ...msg, read: true }
            : msg
        );
        ticket.timeline.push({
          action: `Messages marked as read by ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        console.log("Messages marked as read:", {
          ticketId,
          userId: req.userId,
        });
        res.json({ success: true, ticket });
      } catch (err) {
        console.error("Mark messages read error:", {
          error: err.message,
          ticketId: req.params.id,
          userId: req.userId,
        });
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.get(
    "/api/tickets/:id/messages/search",
    authMiddleware,
    checkTicketParticipant,
    [
      check("query")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("Search query cannot be empty"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("Validation errors for message search:", {
          errors: errors.array(),
          ticketId: req.params.id,
          userId: req.userId,
        });
        return res.status(400).json({ errors: errors.array() });
      }

      const { query } = req.query;
      try {
        const ticketId = req.params.id;
        if (!/^[0-9a-fA-F]{32}$/.test(ticketId)) {
          console.error("Invalid ticket ID format:", {
            ticketId,
            userId: req.userId,
          });
          return res.status(400).json({ error: "Invalid ticket ID format" });
        }

        const ticket = await Ticket.findOne({ _id: ticketId }).lean();
        if (!ticket) {
          console.error("Ticket not found for message search:", {
            ticketId,
            userId: req.userId,
          });
          return res.status(404).json({ error: "Ticket not found" });
        }

        if (!query) {
          console.log("Returning all messages for ticket:", {
            ticketId,
            userId: req.userId,
          });
          return res.json({ success: true, messages: ticket.messages });
        }

        const messages = ticket.messages.filter((msg) =>
          msg.content.toLowerCase().includes(query.toLowerCase())
        );
        console.log("Searched messages in ticket:", {
          ticketId,
          query,
          results: messages.length,
          userId: req.userId,
        });
        res.json({ success: true, messages });
      } catch (err) {
        console.error("Search messages error:", {
          error: err.message,
          ticketId: req.params.id,
          userId: req.userId,
        });
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.post(
    "/api/tickets/:id/ai-response",
    authMiddleware,
    checkTicketParticipant,
    validateMessage,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("Validation errors for AI response:", {
          errors: errors.array(),
          ticketId: req.params.id,
          userId: req.userId,
        });
        return res.status(400).json({ errors: errors.array() });
      }

      const { content } = req.body;
      try {
        const ticketId = req.params.id;
        if (!/^[0-9a-fA-F]{32}$/.test(ticketId)) {
          console.error("Invalid ticket ID format:", {
            ticketId,
            userId: req.userId,
          });
          return res.status(400).json({ error: "Invalid ticket ID format" });
        }

        const ticket = await Ticket.findOne({ _id: ticketId });
        if (!ticket) {
          console.error("Ticket not found for AI response:", {
            ticketId,
            userId: req.userId,
          });
          return res.status(404).json({ error: "Ticket not found" });
        }

        const conversationHistory = ticket.messages
          .map((msg) => `${msg.senderName}: ${msg.content}`)
          .join("\n");

        const prompt = `You are an AI assistant helping with a gig negotiation on a freelance platform. The gig is "${
          ticket.gigId.title
        }" with a price of ₹${ticket.gigId.price.toLocaleString(
          "en-IN"
        )}. Below is the conversation history:\n\n${conversationHistory}\n\nUser (${
          req.user.fullName
        }): ${content}\n\nProvide a professional, concise, and relevant response to assist in the negotiation or clarify the user's message. Keep the tone friendly and professional.`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        ticket.messages.push({
          senderId: "AI",
          senderName: "Gig Connect AI",
          content: sanitizeHtml(aiResponse),
          timestamp: new Date(),
          read: false,
        });
        ticket.timeline.push({
          action: `AI responded to message from ${req.user.fullName}`,
          timestamp: new Date(),
        });
        await ticket.save();

        console.log("AI response generated:", {
          ticketId,
          aiResponseLength: aiResponse.length,
          userId: req.userId,
        });
        res.json({ success: true, aiResponse, ticket });
      } catch (err) {
        console.error("AI response error:", {
          error: err.message,
          ticketId: req.params.id,
          userId: req.userId,
        });
        res.status(500).json({ error: "Server error", details: err.message });
      }
    }
  );

  app.get("/api/debug/tickets/:id", async (req, res) => {
    try {
      const ticketId = req.params.id;
      if (!/^[0-9a-fA-F]{32}$/.test(ticketId)) {
        console.error("Invalid ticket ID format in debug:", { ticketId });
        return res.status(400).json({ error: "Invalid ticket ID format" });
      }

      const ticket = await Ticket.findOne({ _id: ticketId }).lean();
      if (!ticket) {
        console.error("Debug: Ticket not found:", { ticketId });
        return res.status(404).json({ error: "Ticket not found in database" });
      }
      console.log("Debug: Ticket found:", {
        ticketId,
        gigId: ticket.gigId,
        sellerId: ticket.sellerId,
        buyerId: ticket.buyerId,
        status: ticket.status,
      });
      res.json({ success: true, ticket });
    } catch (err) {
      console.error("Debug ticket error:", {
        error: err.message,
        ticketId: req.params.id,
      });
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });
};

module.exports = { setupTicketRoutes, setupTicketSocket };
