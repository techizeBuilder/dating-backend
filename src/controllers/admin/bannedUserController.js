import BannedUser from '../../models/bannedUserModel.js';
import User from '../../models/userModel.js';

export const getBannedUsers = async (req, res) => {

    console.log('banned yser---------------')
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const skip = (page - 1) * per_page;
        console.log('banned yser---------------')
        const bannedUsers = await BannedUser.find({ unbanned: false })
            .populate('user', 'name email mobile')
            .populate('banned_by', 'name')
            .sort('-createdAt')
            .skip(skip)
            .limit(per_page)
            .lean();

        console.log('banned yser', bannedUsers)
        // return false;
        const total = await BannedUser.countDocuments({ unbanned: false });

        res.status(200).json({
            status: true,
            data: {
                current_page: page,
                total_pages: Math.ceil(total / per_page),
                total_records: total,
                banned_users: bannedUsers.map(ban => ({
                    _id: ban._id,
                    user: ban.user ? {
                        _id: ban.user._id,
                        full_name: ban.user.name,
                        email: ban.user.email,
                        mobile: ban.user.mobile
                    } : null,
                    reason: ban.reason,
                    banned_on: ban.banned_on,
                    duration: ban.duration,
                    expires_on: ban.expires_on,
                    banned_by: ban.banned_by ? {
                        _id: ban.banned_by._id,
                        name: ban.banned_by.name
                    } : null,
                    createdAt: ban.createdAt,
                    updatedAt: ban.updatedAt
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const banUser = async (req, res) => {
    console.log('banned yser---------------')
    try {
        const { reason, duration = 0 } = req.body;
        const userId = req.params.user_id;
        const adminId = req.admin._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // Calculate expiry date if duration is provided
        const expires_on = duration > 0
            ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
            : null;

        // Create ban record
        const banRecord = await BannedUser.create({
            user: userId,
            reason,
            duration,
            expires_on,
            banned_by: adminId
        });

        // Update user status
        user.status = 'banned';
        await user.save();

        res.status(200).json({
            status: true,
            message: "User banned successfully",
            data: {
                id: user._id,
                status: user.status,
                ban_details: {
                    reason: banRecord.reason,
                    duration: banRecord.duration,
                    expires_on: banRecord.expires_on
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const unbanUser = async (req, res) => {
    try {
        const { reason } = req.body;
        const userId = req.params.user_id;
        const adminId = req.admin._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // Find and update ban record
        const banRecord = await BannedUser.findOne({
            user: userId,
            unbanned: false
        });

        if (!banRecord) {
            return res.status(404).json({
                status: false,
                message: "No active ban found for this user"
            });
        }

        banRecord.unbanned = true;
        banRecord.unbanned_on = new Date();
        banRecord.unbanned_by = adminId;
        banRecord.unban_reason = reason;
        await banRecord.save();

        // Update user status
        user.status = 'active';
        await user.save();

        res.status(200).json({
            status: true,
            message: "User unbanned successfully",
            data: {
                id: user._id,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.params.user_id;

        if (!['active', 'inactive', 'banned'].includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Invalid status value"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        user.status = status;
        await user.save();

        res.status(200).json({
            status: true,
            message: "User status updated successfully",
            data: {
                id: user._id,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};