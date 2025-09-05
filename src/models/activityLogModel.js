import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: Object
    },
    ip_address: {
        type: String
    },
    user_agent: {
        type: String
    }
}, {
    timestamps: true
});

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;