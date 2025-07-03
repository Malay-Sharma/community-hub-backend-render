import mongoose from 'mongoose';
import express from "express";

import Chat from '../models/chat.js';
import UserChat from '../models/userChats.js';

const chatRouter = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 🟢 Create or get chat between two users (always sorted participants)
chatRouter.post('/chat', async (req, res) => {
  const { user1Id, user2Id } = req.body;

  if (!user1Id || !user2Id) {
    return res.status(400).json({ message: 'Both user IDs are required.' });
  }

  if (!isValidObjectId(user1Id) || !isValidObjectId(user2Id)) {
    return res.status(400).json({ message: 'Invalid user IDs.' });
  }

  try {
    // Ensure participant order is consistent
    const participants = [
      new mongoose.Types.ObjectId(user1Id),
      new mongoose.Types.ObjectId(user2Id)
    ].sort((a, b) => a.toString().localeCompare(b.toString()));

    console.log(`Looking for chat between ${participants[0]} and ${participants[1]}`);

    let chat = await Chat.findOne({ participants });

    if (chat) {
      console.log(`Chat found: ${chat._id}`);
    } else {
      console.log(`No chat found. Creating new chat.`);
      chat = await Chat.create({ participants });
    }

    res.json(chat);
  } catch (err) {
    console.error("Error in /chat route:", err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// 🟢 Send message
chatRouter.post('/message', async (req, res) => {
  const { chatId, senderId, message } = req.body;

  if (!chatId || !senderId || !message) {
    return res.status(400).json({ message: 'chatId, senderId, and message are required.' });
  }

  if (!isValidObjectId(chatId) || !isValidObjectId(senderId)) {
    return res.status(400).json({ message: 'Invalid chatId or senderId.' });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found.' });
    }

    const newMessage = await UserChat.create({
      chat: chatId,
      sender: senderId,
      message,
    });

    chat.updatedAt = Date.now();
    await chat.save();

    res.json(newMessage);
  } catch (err) {
    console.error("Error in /message route:", err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// 🟢 Get chat messages
chatRouter.get('/messages/:chatId', async (req, res) => {
  const { chatId } = req.params;

  if (!isValidObjectId(chatId)) {
    return res.status(400).json({ message: 'Invalid chatId.' });
  }

  try {
    const messages = await UserChat.find({ chat: chatId }).sort('createdAt');
    res.json(messages);
  } catch (err) {
    console.error("Error in /messages route:", err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// 🟢 Find existing chat between two users
chatRouter.get('/find/:user1Id/:user2Id', async (req, res) => {
  const { user1Id, user2Id } = req.params;

  if (!isValidObjectId(user1Id) || !isValidObjectId(user2Id)) {
    return res.status(400).json({ message: 'Invalid user IDs.' });
  }

  try {
    const participants = [
      new mongoose.Types.ObjectId(user1Id),
      new mongoose.Types.ObjectId(user2Id)
    ].sort((a, b) => a.toString().localeCompare(b.toString()));

    const chat = await Chat.findOne({ participants });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found.' });
    }

    res.json(chat);
  } catch (err) {
    console.error("Error in /find route:", err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

export default chatRouter;




// router.post("/send", sendMessage);
// router.get("/:userId", getChatWithUser);
// router.patch("/read/:messageId", markMessageRead);

// Get chat history between two users
// chatRouter.get('/:user1Id/:user2Id', async (req, res) => {
//   try {
//     const { user1Id, user2Id } = req.params;
//     const messages = await Message.find({
//       $or: [
//         { sender: user1Id, receiver: user2Id },
//         { sender: user2Id, receiver: user1Id }
//       ]
//     }).sort({ timestamp: 1 });

//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// // Save new message (used by Socket too)
// chatRouter.post('/', async (req, res) => {
//   try {
//     const { senderId, receiverId, text } = req.body;
//     const message = new Message({ senderId, receiverId, text });
//     await message.save();
//     res.json(message);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });



