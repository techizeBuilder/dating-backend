import mongoose from 'mongoose';

const adminProfileSchema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    profile_image: {
        type: String,
        trim: true
    },
    last_login: {
        type: Date
    },
    last_password_change: {
        type: Date
    }
}, {
    timestamps: true
});

const AdminProfile = mongoose.models.AdminProfile || mongoose.model('AdminProfile', adminProfileSchema);

export default AdminProfile;