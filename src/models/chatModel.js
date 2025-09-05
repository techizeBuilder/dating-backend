import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'audio', 'doc'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  file_url: {
    type: String,
    required: function() {
      return ['image', 'audio', 'doc'].includes(this.type);
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  deleted_for: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

export default Message;