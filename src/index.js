import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

import http from "http";
import { Server as SocketServer } from "socket.io";
import {
  onlineUsers,
  activeChatPartners,
  pendingInvitations,
  pendingAnswers,
  activeGames,
  activeCalls,
} from "./sockets/state.js";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import interestRoutes from "./routes/interestRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import Message from "./models/chatModel.js";
import { autoExpireSubscriptions } from "./utils/cronJobs.js";
import User from "./models/userModel.js";

// Load environment variables
dotenv.config();

const app = express();
app.set("trust proxy", true);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// MongoDB Connection with improved configuration
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/story", storyRoutes);
app.use("/api/location", locationRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Dating API is running ✅" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "MulterError") {
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  }

  res.status(500).json({
    status: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: "Route not found",
  });
});

// ********** Using Socket.IO for real-time communication ********** //
// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
export const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Track online users
// moved to sockets/state.js

// Socket.IO logic - Update the messageRead handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    // Store the user's socket connection
    onlineUsers.set(userId, socket.id);
    // Keep the userId on the socket for later reference
    socket.userId = userId;

    socket.join(userId);
    console.log(`User ${userId} joined their room`);

    // Notify others that this user is now online
    socket.broadcast.emit("userOnline", userId);

    // Send the current user a list of who's online
    const currentlyOnline = Array.from(onlineUsers.keys());
    socket.emit("onlineUsers", currentlyOnline);
  });

  // Mark the chat partner the user is actively viewing
  socket.on("setActiveChat", (partnerUserId) => {
    try {
      const currentUserId = socket.userId;
      if (!currentUserId) return;
      if (partnerUserId) {
        activeChatPartners.set(currentUserId, String(partnerUserId));
      } else {
        activeChatPartners.delete(currentUserId);
      }
    } catch (e) {
      console.error("Error setting active chat:", e);
    }
  });

  // Clear active chat on explicit leave
  socket.on("clearActiveChat", () => {
    try {
      const currentUserId = socket.userId;
      if (!currentUserId) return;
      activeChatPartners.delete(currentUserId);
    } catch (e) {
      console.error("Error clearing active chat:", e);
    }
  });

  // Handle online status check
  socket.on("checkOnlineStatus", (userId) => {
    const isOnline = onlineUsers.has(userId);
    socket.emit("onlineStatusResponse", { userId, isOnline });
  });

  // Improved message read handler
  socket.on("messageRead", async (data) => {
    // Properly destructure with default values
    const { messageId, readerId, senderId } = data || {};

    // Validate all required fields
    if (!messageId || !readerId || !senderId) {
      console.error("Invalid read receipt:", {
        messageId,
        readerId,
        senderId,
      });
      return;
    }

    console.log("Valid read receipt received:", {
      messageId,
      readerId,
      senderId,
    });
    try {
      const updated = await Message.findOneAndUpdate(
        {
          _id: messageId,
          sender_id: senderId,
          receiver_id: readerId,
          read: false,
        },
        { $set: { read: true } },
        { new: true }
      );

      if (updated) {
        // Notify sender that their message was read
        io.to(senderId).emit("messageReadUpdate", {
          messageId: updated._id.toString(),
        });
      }
    } catch (error) {
      console.error("Error updating read status:", error);
    }
  });

  socket.on("callAccept", ({ to, from }) => {
    const userisonline = onlineUsers.get(to);
    if (userisonline) {
      socket.to(userisonline).emit("callAccept", {
        to,
        from,
      });
      setUserbussy(to, from);
    }
  });
  socket.on("callend", (data) => {
    const { to, from } = data;
    console.log("this is call end", data);
    [to, from].forEach((ele) => {
      const userisonline = onlineUsers.get(ele);
      console.log("this is userisonline", userisonline);

      socket.to(userisonline).emit("callend", {
        to,
        from,
      });
      removeUserbussy(to, from);
    });
  });
  socket.on("incoming", (data) => {
    console.log("hee", onlineUsers);
    console.log("socket it", data);
    const chekisuserbusy = activeCalls.has(data?.to);
    console.log("chek", chekisuserbusy);
    if (chekisuserbusy) {
      console.log("this is chek2 ", data?.from);
      const caller = data?.from;
      socket.to(caller).emit("userbussy", { message: "user is bussy" });
    } else {
      const userisonline = onlineUsers.get(data.to);
      console.log("this is online ", userisonline);
      if (userisonline) {
        console.log("this is chek2 ", data?.from);
        io.to(userisonline).emit("incoming", data);
      }
    }
  });

  // GAMING SOCKETS

  // Game invitation handler
  socket.on("sendGameInvite", async ({ senderId, recipientId, level = 1 }) => {
    console.log(
      `🎮 'sendGameInvite' received from ${senderId} to ${recipientId}`
    );

    // Validate users
    if (!onlineUsers.has(recipientId)) {
      console.warn(
        `⚠️ Cannot send invite — recipient ${recipientId} is offline`
      );
      socket.emit("inviteError", {
        error: "User is currently offline",
        recipientId,
      });
      return;
    }

    // ✅ Check if either user has a pending invite (sent or received)
    const hasPendingInvite = Array.from(pendingInvitations.values()).some(
      (inv) =>
        inv.status === "pending" &&
        (inv.senderId === senderId ||
          inv.recipientId === senderId ||
          inv.senderId === recipientId ||
          inv.recipientId === recipientId)
    );

    if (hasPendingInvite) {
      socket.emit("inviteError", {
        error: "Either you or the recipient has a pending invite",
      });
      return;
    }

    // ✅ Fetch sender's name from the database
    const sender = await User.findById(senderId).select("name");
    if (!sender) {
      socket.emit("inviteError", { error: "Sender not found" });
      return;
    }

    // Create invitation
    const invitationId = `invite_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const invitation = {
      invitationId,
      senderId,
      recipientId,
      timestamp: Date.now(),
      status: "pending",
      senderName: sender.name,
      level,
    };

    // Store invitation
    pendingInvitations.set(invitationId, invitation);
    console.log(`📨 Game invite created:`, invitation);

    // Send invitation to recipient
    const recipientSocketId = onlineUsers.get(recipientId);
    io.to(recipientSocketId).emit("receiveGameInvite", invitation);
    console.log(`📤 Sent game invite to recipient socket ${recipientSocketId}`);

    // Confirm to sender
    socket.emit("inviteSent", invitation);

    console.log(`📥 Confirmed to sender ${senderId} that invite was sent`);

    // Set timeout for expiration (e.g., 30 seconds)
    setTimeout(() => {
      if (pendingInvitations.get(invitationId)?.status === "pending") {
        pendingInvitations.delete(invitationId);

        // Notify sender (show modal)
        io.to(socket.id).emit("inviteExpired", { invitationId });

        // Notify receiver (just dismiss modal)
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("inviteAutoDismiss", { invitationId });
        }

        console.log(`⏰ Invite ${invitationId} expired`);
      }
    }, 30000);
  });

  // Invitation response handler
  socket.on(
    "respondToInvite",
    async ({ invitationId, recipientId, accepted }) => {
      console.log(`📬 Received 'respondToInvite':`, {
        invitationId,
        recipientId,
        accepted,
      });

      const invitation = pendingInvitations.get(invitationId);

      // Validate invitation
      if (!invitation || invitation.recipientId !== recipientId) {
        console.error("❌ Invalid or unmatched invitation response");
        socket.emit("inviteError", { error: "Invalid invitation" });
        return;
      }

      // Update invitation status
      invitation.status = accepted ? "accepted" : "rejected";
      pendingInvitations.set(invitationId, invitation);

      const senderSocketId = onlineUsers.get(invitation.senderId);

      if (accepted) {
        // Generate unique game session ID
        const gameSessionId = `quiz_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Mark both users as in-game
        activeGames.set(invitation.senderId, gameSessionId);
        activeGames.set(invitation.recipientId, gameSessionId);

        console.log(
          `✅ Invitation accepted. Game session created: ${gameSessionId}`
        );

        // Notify both users
        io.to(senderSocketId).emit("inviteAccepted", {
          invitationId,
          gameSessionId,
          opponentId: recipientId,
        });

        socket.emit("inviteAccepted", {
          invitationId,
          gameSessionId,
          opponentId: invitation.senderId,
        });

        // Cleanup
        pendingInvitations.delete(invitationId);
      } else {
        try {
          // Fetch recipient's name
          const recipient = await User.findById(recipientId).select("name");
          const recipientName = recipient?.name || "The player";

          console.log(
            `❌ Invitation rejected by ${recipientId} (${recipientName})`
          );

          // Notify sender with recipient name
          io.to(senderSocketId).emit("inviteRejected", {
            invitationId,
            recipientName,
          });

          // Cleanup
          pendingInvitations.delete(invitationId);
        } catch (error) {
          console.error("⚠️ Error fetching recipient name:", error);
          // Still notify rejection without name
          io.to(senderSocketId).emit("inviteRejected", {
            invitationId,
            recipientName: "The player",
          });

          pendingInvitations.delete(invitationId);
        }
      }
    }
  );

  // Submit answer
  socket.on(
    "submitAnswer",
    ({ answerText, userId, receiverId, gameSessionId, questionIndex }) => {
      const sessionKey = `${gameSessionId}_${questionIndex}`; // 👉 key is now session + question

      console.log(
        `📝 Answer from ${userId} for session ${gameSessionId}, question ${questionIndex}`
      );

      // Initialize if not exists
      if (!pendingAnswers.has(sessionKey)) {
        pendingAnswers.set(sessionKey, new Map());
      }

      const gameAnswers = pendingAnswers.get(sessionKey);
      gameAnswers.set(userId, answerText);

      // If both users have answered
      if (gameAnswers.size === 2) {
        const [player1, player2] = Array.from(gameAnswers.keys());
        const answer1 = gameAnswers.get(player1);
        const answer2 = gameAnswers.get(player2);

        if (!answer1 || !answer2) return;

        const socket1 = onlineUsers.get(player1);
        const socket2 = onlineUsers.get(player2);

        if (socket1) {
          io.to(socket1).emit("bothAnswersReceived", {
            gameSessionId,
            questionIndex,
            userId: player1,
            yourAnswer: answer1,
            opponentAnswer: answer2,
          });
        }

        if (socket2) {
          io.to(socket2).emit("bothAnswersReceived", {
            gameSessionId,
            questionIndex,
            userId: player2,
            yourAnswer: answer2,
            opponentAnswer: answer1,
          });
        }

        // Clean this specific question's data
        pendingAnswers.delete(sessionKey);
      }
    }
  );

  // End game between playing games
  socket.on("manualGameEnd", ({ gameSessionId, userId }) => {
    console.log(`🎮 User ${userId} manually ended game ${gameSessionId}`);

    // Find opponent
    const opponentEntry = [...activeGames.entries()].find(
      ([uid, session]) => uid !== userId && session === gameSessionId
    );

    const opponentId = opponentEntry?.[0];

    if (opponentId) {
      const opponentSocketId = onlineUsers.get(opponentId);
      if (opponentSocketId) {
        io.to(opponentSocketId).emit("opponentDisconnected", {
          gameSessionId,
          opponentId: userId,
          manual: true,
        });
      }

      // Clean up both users from activeGames
      activeGames.delete(userId);
      activeGames.delete(opponentId);

      console.log(
        `🧹 Cleaned up game session ${gameSessionId} for users ${userId} and ${opponentId}`
      );
    } else {
      activeGames.delete(userId); // if no opponent
    }

    // ✅ Emit confirmation back to user who ended the game
    socket.emit("gameEnded", {
      userId,
      gameSessionId,
    });
  });

  // End the game after complete game
  socket.on("leaveGameSession", ({ userId, gameSessionId }) => {
    if (activeGames.has(userId)) {
      activeGames.delete(userId);
    }
    socket.leave(gameSessionId);
  });

  // GAMING SOCKETS
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        // Remove from online users
        onlineUsers.delete(userId);
        io.emit("userOffline", userId);
        // Clear any active chat tracking for this user
        activeChatPartners.delete(userId);
        // Handle active call cleanup
        if (activeCalls.has(userId)) {
          const callData = activeCalls.get(userId);
          if (callData) {
            const otherUserId = callData.to || callData.from;
            const targetSocketId = onlineUsers.get(otherUserId);

            if (targetSocketId) {
              io.to(targetSocketId).emit("call-ended", {
                userId,
                reason: "disconnected",
              });
              console.log(`[CALL ENDED] ${userId} disconnected during call`);
            }

            // Clean up both users in call
            activeCalls.delete(userId);
            activeCalls.delete(otherUserId);
            console.log(`[CALL CLEANUP] Removed call tracking for ${userId}`);
          }
        }

        // Handle active game cleanup
        if (activeGames.has(userId)) {
          const gameSessionId = activeGames.get(userId);

          // Find opponent
          const opponentId = [...activeGames.entries()].find(
            ([uid, session]) => uid !== userId && session === gameSessionId
          )?.[0];

          activeGames.delete(userId);

          if (opponentId) {
            activeGames.delete(opponentId);

            const opponentSocket = onlineUsers.get(opponentId);
            if (opponentSocket) {
              io.to(opponentSocket).emit("opponentDisconnected", {
                gameSessionId,
                opponentId: userId,
                manual: false,
              });
            }

            console.log(
              `🎮 Game session ${gameSessionId} ended due to disconnect of ${userId}`
            );
          }
        }

        break; // We've handled the disconnected user
      }
    }
  });
});

function setUserbussy(to, from) {
  activeCalls.set(to, from);
  activeCalls.set(from, to);
}

function removeUserbussy(to, from) {
  activeCalls.delete(to);
  activeCalls.delete(from);
}

// Cron Jobs expiring subscriptions
autoExpireSubscriptions();

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
