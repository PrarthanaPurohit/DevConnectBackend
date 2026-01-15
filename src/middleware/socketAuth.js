const jwt = require("jsonwebtoken");
const User = require("../models/user");

const socketAuth = async (socket, next) => {
  try {
    const cookie = socket.handshake.headers.cookie;
    if (!cookie) return next(new Error("No auth cookie"));

    const token = cookie
      .split("; ")
      .find(c => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return next(new Error("Token missing"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select(
      "_id firstName photoUrl"
    );

    if (!user) return next(new Error("User not found"));

    socket.user = user; // 🔥 VERY IMPORTANT
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
};

module.exports = socketAuth;
