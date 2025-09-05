import BannedUser from '../../models/bannedUserModel.js';
import Report from '../../models/reportModel.js';
import User from '../../models/userModel.js';

export const getAllReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const skip = (page - 1) * per_page;

        const totalReports = await Report.countDocuments();
        const totalPages = Math.ceil(totalReports / per_page);

        const reports = await Report.find()
            .populate('reported_user', 'name email profile_image')
            .populate('reported_by', 'name')
            .sort('-createdAt')
            .skip(skip)
            .limit(per_page)
            .lean();

        console.log('reports', reports);
        const formattedReports = reports.map(report => ({
            id: report._id,
            reportedUser: report.reported_user ? {
                id: report.reported_user._id,
                name: report.reported_user.name,
                email: report.reported_user.email,
                profile_image: report.reported_user.profile_image
            } : null,
            reason: report.reason,
            reportedBy: report.reported_by ? {
                id: report.reported_by._id,
                name: report.reported_by.name
            } : null,
            status: report.status,
            admin_action: report.admin_action,
            createdAt: report.createdAt
        }));


        res.status(200).json({
            status: true,
            data: {
                current_page: page,
                total_pages: totalPages,
                total_reports: totalReports,
                reports: formattedReports
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const getBannedUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const skip = (page - 1) * per_page;

        const totalBannedUsers = await User.countDocuments({ status: 'banned' });
        const totalPages = Math.ceil(totalBannedUsers / per_page);

        const bannedUsers = await User.find({ status: 'banned' })
            .select('name email mobile status report createdAt')
            .skip(skip)
            .limit(per_page)
            .lean();

        const formattedUsers = bannedUsers.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            status: user.status,
            banned_reason: user.report?.reports[user.report.reports.length - 1]?.reason || 'Not specified',
            banned_at: user.report?.reports[user.report.reports.length - 1]?.created_at || user.updatedAt
        }));

        res.status(200).json({
            status: true,
            data: {
                current_page: page,
                total_pages: totalPages,
                total_banned_users: totalBannedUsers,
                banned_users: formattedUsers
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
    try {
        const { reason } = req.body;
        const userId = req.params.user_id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        user.status = 'banned';
        if (!user.report) {
            user.report = {
                reported_count: 1,
                reports: []
            };
        }

        user.report.reports.push({
            reason,
            created_at: new Date()
        });

        await user.save();

        res.status(200).json({
            status: true,
            message: "User banned successfully",
            user: {
                id: user._id,
                status: user.status,
                banned_reason: reason
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }


};
export const updateReportStatus = async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        const reportId = req.params.reportId;
        const adminId = req.admin._id;

        console.log('action', status);
        const validActions = ['investigating', 'resolved', 'banned'];
        if (!validActions.includes(status)) {
            return res.status(400).json({ status: false, message: "Invalid action" });
        }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ status: false, message: "Report not found" });
        }

        const user = await User.findById(report.reported_user);
        if (!user) {
            return res.status(404).json({ status: false, message: "Reported user not found" });
        }

        if (status === 'resolved') {
            if (!user.report) {
                user.report = { reported_count: 0, reports: [] };
            }

            user.report.reported_count += 1;


            user.report.reports.push({
                reason: report.reason,
                by: report?.reported_by,
                createdAt: new Date()
            });

            if (user.report.reported_count >= 3) {
                user.status = 'banned';
                user.ban_reason = 'Auto-ban due to repeated reports';
                user.banned_at = new Date();
            }

            await user.save();
            report.status = status;
            report.admin_action = status;
            report.admin_notes = admin_notes || '';
            await Report.findByIdAndDelete(reportId);



        } else if (status === 'banned') {
            const reason = admin_notes || "User banned due to serious report";
            const duration = 10; // e.g., 10 days
            const expires_on = new Date();
            expires_on.setDate(expires_on.getDate() + duration);

            await BannedUser.create({
                user: user._id,
                reason,
                duration,
                expires_on,
                banned_by: adminId
            });

            user.status = 'banned';
            user.ban_reason = reason;
            user.banned_at = new Date();
            await user.save();

            report.status = 'pending';
            report.admin_action = status;
            report.admin_notes = admin_notes || '';
            await Report.findByIdAndDelete(reportId);
        }
        else if (status === 'investigating') {

            report.status = status;
            report.admin_action = status;
            report.admin_notes = admin_notes || '';

            await report.save();
        }
        res.status(200).json({
            status: true,
            message: "Report status updated successfully",
            report: {
                id: report._id,
                status: report.status,
                admin_action: report.admin_action,
                admin_notes: report.admin_notes
            }
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
