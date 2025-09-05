import mongoose from 'mongoose';

const bannedUserSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    banned_on: {
        type: Date,
        default: Date.now
    },
    duration: {
        type: Number, // Days
        default: 0 // 0 means permanent ban
    },
    expires_on: {
        type: Date
    },
    banned_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    unbanned: {
        type: Boolean,
        default: false
    },
    unbanned_on: {
        type: Date
    },
    unbanned_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    unban_reason: {
        type: String
    }
}, {
    timestamps: true
});

const BannedUser = mongoose.model('BannedUser', bannedUserSchema);

export default BannedUser;