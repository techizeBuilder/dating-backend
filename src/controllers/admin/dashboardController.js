import User from '../../models/userModel.js';
import Payment from '../../models/paymentModel.js';
import Chat from '../../models/chatModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ subscription: 'premium' });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const reportedUsers = await User.countDocuments({ 'report.reported_count': { $gt: 0 } });

    const payments = await Payment.find({ status: 'success' });
    const totalPayments = payments.reduce((acc, curr) => acc + curr.amount, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyPayments = await Payment.find({
      status: 'success',
      createdAt: { $gte: startOfMonth }
    });
    const monthlyRevenue = monthlyPayments.reduce((acc, curr) => acc + curr.amount, 0);

    const activeChats = await Chat.countDocuments({ isActive: true });

    res.status(200).json({
      status: true,
      message: 'Dashboard stats fetched successfully',
      data: {
        totalUsers,
        premiumUsers,
        activeUsers,
        bannedUsers,
        reportedUsers,
        totalPayments,
        monthlyRevenue,
        activeChats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};