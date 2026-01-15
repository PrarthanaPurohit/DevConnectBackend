const socketIO = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequestModel = require("../models/connectionRequest");
const socketAuth = require("../middleware/socketAuth");

const getSecretRoomId = (userId, targetUserId) =>
  crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "https://dev-connect-frontend-theta.vercel.app/",
      credentials: true,
    },
  });

  // 🔐 AUTH MIDDLEWARE
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socket.user._id; // ✅ AUTHENTIC USER
    const senderName = socket.user.firstName;

    // JOIN CHAT
    socket.on("joinChat", ({ targetUserId }) => {
      if (!targetUserId) return;
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
    });

    // SEND MESSAGE
    socket.on("sendMessage", async ({ targetUserId, text }) => {
      if (!targetUserId || !text?.trim()) return;

      const roomId = getSecretRoomId(userId, targetUserId);
      const participants = [userId, targetUserId].sort();

      try {
        // ✅ FRIEND CHECK
        const isFriend = await ConnectionRequestModel.findOne({
          $or: [
            { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
            { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
          ],
        });

        if (!isFriend) return;

        let chat = await Chat.findOne({
          participants: { $all: participants },
        });

        if (!chat) {
          chat = new Chat({
            participants,
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text,
        });

        await chat.save();

        io.to(roomId).emit("messageReceived", {
          text,
          senderId: userId,
          senderName,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.user.firstName);
    });
  });
};

module.exports = initializeSocket;
