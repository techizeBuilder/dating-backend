import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import User from '../models/userModel.js';
import Payment from '../models/paymentModel.js';
import Chat from '../models/chatModel.js';

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: 'Please provide email and password'
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        status: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordCorrect = await admin.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: false,
        message: 'Invalid email or password'
      });
    }
    console.log('admin', admin);
    const token = generateToken(admin._id);

    res.status(200).json({
      status: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          mobile: admin.mobile,
          permissions: permissions
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Server error during login'
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(201).json({
      status: true,
      message: 'Admin created successfully',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message
    });
  }
};

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

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find()
      .select('-__v')
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      gender: user.gender,
      location: user.location,
      age: user.age,
      subscription: user.subscription,
      about_us: user.about_us,
      interest: user.interest,
      status: user.status,
      profile_image: user.profile_image,
      created_at: user.createdAt,
      match_list: {
        matched_count: user.match_list?.matched_count || 0,
        matched_users: user.match_list?.matched_users || []
      },
      report: {
        reported_count: user.report?.reported_count || 0,
        reports: user.report?.reports || []
      }
    }));

    res.status(200).json({
      status: true,
      message: "User list fetched successfully",
      data: {
        current_page: page,
        total_pages: totalPages,
        total_users: totalUsers,
        users: formattedUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    const formattedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      gender: user.gender,
      location: user.location,
      age: user.age,
      subscription: user.subscription,
      about_us: user.about_us,
      interest: user.interest,
      status: user.status,
      profile_image: user.profile_image,
      created_at: user.createdAt,
      match_list: {
        matched_count: user.match_list?.matched_count || 0,
        matched_users: user.match_list?.matched_users || []
      },
      report: {
        reported_count: user.report?.reported_count || 0,
        reports: user.report?.reports || []
      }
    };

    res.status(200).json({
      status: true,
      message: "User fetched successfully",
      data: formattedUser
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      status: true,
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profile_image: user.profile_image,
        status: user.status,
        created_at: user.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    const formattedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      gender: user.gender,
      location: user.location,
      age: user.age,
      subscription: user.subscription,
      about_us: user.about_us,
      interest: user.interest,
      status: user.status,
      profile_image: user.profile_image,
      created_at: user.createdAt,
      match_list: {
        matched_count: user.match_list?.matched_count || 0,
        matched_users: user.match_list?.matched_users || []
      },
      report: {
        reported_count: user.report?.reported_count || 0,
        reports: user.report?.reports || []
      }
    };

    res.status(200).json({
      status: true,
      message: "User updated successfully",
      data: formattedUser
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      status: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};