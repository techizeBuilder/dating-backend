import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reported_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reported_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'dismissed', 'investigating'],
        default: 'pending'
    },
    admin_action: {
        type: String,
        enum: ['none', 'warning', 'banned', 'resolved', 'investigating'],
        default: 'none'
    },
    admin_notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

export default Report;