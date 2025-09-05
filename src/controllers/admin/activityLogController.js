import ActivityLog from '../../models/activityLogModel.js';

export const getAllLogs = async (req, res) => {
    try {
        const { page = 1, per_page = 10, user_id, action, date_from, date_to } = req.query;
        const skip = (page - 1) * per_page;

        const query = {};

        if (user_id) query.user_id = user_id;
        if (action) query.action = action;
        if (date_from || date_to) {
            query.createdAt = {};
            if (date_from) query.createdAt.$gte = new Date(date_from);
            if (date_to) query.createdAt.$lte = new Date(date_to);
        }

        const logs = await ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(per_page))
            .lean();

        const total = await ActivityLog.countDocuments(query);

        res.status(200).json({
            status: true,
            data: {
                logs,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / per_page),
                    total_records: total
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

export const createLog = async (req, res) => {
    try {
        const log = await ActivityLog.create(req.body);

        res.status(201).json({
            status: true,
            message: "Activity log added successfully",
            log
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const deleteLog = async (req, res) => {
    try {
        await ActivityLog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status: true,
            message: "Activity log deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const clearAllLogs = async (req, res) => {
    try {
        await ActivityLog.deleteMany({});

        res.status(200).json({
            status: true,
            message: "All activity logs cleared successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};