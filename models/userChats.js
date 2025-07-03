import mongoose from 'mongoose';

const userChatSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('UserChat', userChatSchema);

// // models/messageModel.js
// import mongoose from "mongoose";

// const messageSchema = new mongoose.Schema({
//   sender: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
//   receiver: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
//   text: { 
//     type: String, 
//     required: true 
//   },
  

//   timestamp: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// export default mongoose.model("Message", messageSchema);
