import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  media: [{
    url: { type: String, required: true },
    fileId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  visibility: {
    type: String,
    enum: ['public', 'followers', 'favourite', 'community'],
    default: 'followers'
  }
}, {
  timestamps: true
});

export default mongoose.model('UserStory', storySchema);
