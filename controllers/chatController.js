import jwt from "jsonwebtoken";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const getUserFromToken = (req) => {
  const token = req.cookies.token;
  if (!token) throw new Error("Unauthorized: No token");
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const sendMessage = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);

    const { receiver, text, attachments } = req.body;

    if (!receiver || (!text && (!attachments || attachments.length === 0))) {
      return res.status(400).json({ message: "Message text or attachment required" });
    }

    const message = await Message.create({
      sender: decoded.id,
      receiver,
      text,
      attachments,
      status: 'sent'
    });

    res.status(201).json({ message });

  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(401).json({ message: err.message || "Failed to send message" });
  }
};

export const getChatWithUser = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: decoded.id, receiver: userId },
        { sender: userId, receiver: decoded.id }
      ],
      deletedFor: { $ne: decoded.id }
    }).sort({ timestamp: 1 });

    res.json({ messages });

  } catch (err) {
    console.error("Get Chat Error:", err);
    res.status(401).json({ message: err.message || "Failed to load chat" });
  }
};

export const markMessageRead = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (String(message.receiver) !== decoded.id) {
      return res.status(403).json({ message: "Not authorized to mark as read" });
    }

    message.isRead = true;
    message.status = 'read';
    await message.save();

    res.json({ message });

  } catch (err) {
    console.error("Mark Read Error:", err);
    res.status(401).json({ message: err.message || "Failed to mark as read" });
  }
};
