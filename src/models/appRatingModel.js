import mongoose from 'mongoose';

const appRatingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const AppRating = mongoose.model('AppRating', appRatingSchema);

export default AppRating;