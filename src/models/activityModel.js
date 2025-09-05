import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activity_type: {
        type: String,
        enum: ['Login', 'Profile Update', 'Subscription', 'Message', 'Match', 'Story'],
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;