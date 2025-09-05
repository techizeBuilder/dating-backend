import Notification from '../../models/notificationModel.js';

export const getAllNotifications = async (req, res) => {
    try {
        const { status } = req.query;
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const skip = (page - 1) * per_page;

        const query = status === 'unread' ? { read: false } : {};

        const totalRecords = await Notification.countDocuments(query); // <== total notifications count

        const notifications = await Notification.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(per_page)
            .lean();

        const totalPages = Math.ceil(totalRecords / per_page);

        res.status(200).json({
            status: true,
            notifications: notifications.map(notif => ({
                id: notif._id,
                title: notif.title,
                message: notif.message,
                type: notif.type,
                read: notif.read,
                created_at: notif.createdAt
            })),
            current_page: page,
            total_pages: totalPages,
            total_records: totalRecords
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};



export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({
                status: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            {
                read: true,
                read_at: new Date()
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                status: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Notification marked as read",
            data: {
                id: notification._id,
                read: notification.read,
                read_at: notification.read_at
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({});

        res.status(200).json({
            status: true,
            message: "All notifications cleared successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};