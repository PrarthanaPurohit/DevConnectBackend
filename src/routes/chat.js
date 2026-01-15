const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    const limit = parseInt(req.query.limit) || 20;
    const before = req.query.before;

    const participants = [userId, targetUserId].sort();

    const chat = await Chat.findOne({
      participants: { $all: participants },
    }).populate("messages.senderId", "firstName");

    const receiver = await User.findById(targetUserId).select(
      "firstName photoUrl"
    );

    if (!chat) {
      return res.json({
        messages: [],
        receiver,
        hasMore: false,
        nextCursor: null,
      });
    }

    let messages = chat.messages;

    if (before) {
      messages = messages.filter(
        (msg) => new Date(msg.createdAt) < new Date(before)
      );
    }

    messages = messages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    const hasMore = messages.length === limit;
    const nextCursor = hasMore ? messages[0].createdAt : null;

    res.json({
      messages: messages.reverse(), // UI-friendly order
      receiver,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = chatRouter;
