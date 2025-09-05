import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media_url: {
    type: String,
    required: true
  },
  media_type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active'
  },
  views: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewed_at: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Auto delete after 24 hours
  }
});

const Story = mongoose.model('Story', storySchema);

export default Story;