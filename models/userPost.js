// models/Post.js
import mongoose from 'mongoose';



const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },

  caption: {
    type: String,
    trim: true,
    maxlength: 1000,
  },

  media: [{
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }],

  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // People in the memory
  }],

  visibility: {
    type: String,
    enum: ['public', 'followers', 'favourite', 'community'],
    default: 'followers',
  },

  reactions: {
    hearts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Like a memory reaction
    smiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Joy
    teardrops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Emotional
  },

  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  }],

  isEdited: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true
});

export default mongoose.model('Post', postSchema);
