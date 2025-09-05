import mongoose from 'mongoose';
import User from '../../models/userModel.js';
import { createUserSchema } from '../../validations/userValidation.js';
const baseUrl = process.env.BASE_URL;
import fs from 'fs';
import path from 'path';


export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      i_am: user.i_am,
      interested_in: user.interested_in,
      age: user.age,
      location: user.location,
      about: user.about,
      likes: user.likes || [],
      interests: user.interests || [],
      hobbies: user.hobbies || [],
      skin_color: user.skin_color,
      height: user.height,
      weight: user.weight,
      address: user.address,
      marital_status: user?.marital_status || '',
      category: user.category,
      profile_image: user.profile_image || '',
      cover_image: user.cover_image || '',
      subscription: user.subscription,
      match_list: {
        matched_count: user.match_list?.matched_count || 0,
        matched_users: user.match_list?.matched_users || []
      },
      report: {
        reported_count: user.report?.reported_count || 0,
        reports: user.report?.reports || []
      },
      status: user.status,
      created_at: user.createdAt
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
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();

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
      i_am: user.i_am,
      interested_in: user.interested_in,
      age: user.age,
      location: user.location,
      about: user.about,
      likes: user.likes || [],
      interests: user.interests || [],
      hobbies: user.hobbies || [],
      skin_color: user.skin_color,
      marital_status: user?.marital_status || '',
      height: user.height,
      weight: user.weight,
      address: user.address,
      category: user.category,
      profile_image: user.profile_image || '',
      cover_image: user.cover_image || '',
      subscription: user.subscription,
      match_list: {
        matched_count: user.match_list?.matched_count || 0,
        matched_users: user.match_list?.matched_users || []
      },
      report: {
        reported_count: user.report?.reported_count || 0,
        reports: user.report?.reports || []
      },
      status: user.status,
      created_at: user.createdAt
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

const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    console.log(`Creating folder: ${folderPath}`);
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
export const createUser = async (req, res) => {
  try {
    console.log('📦 req.body create user:', req.body);
    console.log('🖼️ req.files:', req.files);

    // Step 1: Create user first (empty image paths)
    const user = await User.create({
      ...req.body,
      profile_image: '',
      cover_image: '',
    });

    const userId = user._id;
    const relativeUserPath = path.join('uploads', 'users', String(userId));
    const absoluteUserPath = path.join(process.cwd(), relativeUserPath);
    createFolderIfNotExists(absoluteUserPath);

    let profileImagePath = '';
    let coverImagePath = '';

    // Handle profile image
    let profileFile = req.files?.['profile_image']?.[0];
    if (profileFile) {
      const cleanFileName = path.basename(profileFile.originalname).replace(/\s+/g, '_');
      const profileFolder = path.join(absoluteUserPath, 'profile');
      createFolderIfNotExists(profileFolder);
      const profileFinalPath = path.join(profileFolder, cleanFileName);

      fs.renameSync(profileFile.path, profileFinalPath);
      profileImagePath = `${baseUrl}/${relativeUserPath}/profile/${cleanFileName}`;
    }

    // Handle cover image
    let coverFile = req.files?.['cover_image']?.[0];
    if (coverFile) {
      const cleanFileName = path.basename(coverFile.originalname).replace(/\s+/g, '_');
      const coverFolder = path.join(absoluteUserPath, 'cover');
      createFolderIfNotExists(coverFolder);
      const coverFinalPath = path.join(coverFolder, cleanFileName);

      if (profileFile && coverFile.path === profileFile.path) {
        // Same file used — copy instead of rename
        const profileFinalPath = path.join(absoluteUserPath, 'profile', cleanFileName);
        fs.copyFileSync(profileFinalPath, coverFinalPath);
      } else {
        fs.renameSync(coverFile.path, coverFinalPath);
      }

      coverImagePath = `${baseUrl}/${relativeUserPath}/cover/${cleanFileName}`;
    }

    // Step 2: Update user with image paths
    await User.findByIdAndUpdate(userId, {
      profile_image: profileImagePath,
      cover_image: coverImagePath,
    });

    const updatedUser = await User.findById(userId);

    res.status(201).json({
      status: true,
      message: 'User created successfully',
      data: updatedUser,
    });

  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    console.log('📦 req.bodyss:', req.body);  // form fields
    console.log('🖼️ req.filessss:', req.files);  // file details

    const userId = req.params.id;

    const baseUrl = `${req.protocol}:/${req.get("host")}`;
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    // Check if mobile is already taken by another user
    if (req.body.mobile && req.body.mobile !== user.mobile) {
      const existingMobile = await User.findOne({
        mobile: req.body.mobile,
        _id: { $ne: userId }  // Exclude the current user
      });
      if (existingMobile) {
        return res.status(400).json({
          status: false,
          message: "Mobile number is already in use"
        });
      }
    }

    // Check if email is already taken by another user
    if (req.body.email && req.body.email !== user.email) {
      const existingEmail = await User.findOne({
        email: req.body.email,
        _id: { $ne: userId }  // Exclude the current user
      });
      if (existingEmail) {
        return res.status(400).json({
          status: false,
          message: "Email address is already in use"
        });
      }
    }

    const userBasePath = path.join('uploads', 'users', userId);
    const absoluteUserBasePath = path.join(process.cwd(), userBasePath);
    createFolderIfNotExists(absoluteUserBasePath);

    // Handle profile image update
    if (req.files?.['profile_image']) {
      const file = req.files['profile_image'][0];
      const profileFolder = path.join(absoluteUserBasePath, 'profile');
      createFolderIfNotExists(profileFolder);

      const cleanFileName = path.basename(file.originalname).replace(/\s+/g, '_');
      const finalPath = path.join(profileFolder, cleanFileName);

      fs.renameSync(file.path, finalPath);

      // Set relative DB path
      req.body.profile_image = `${baseUrl}/uploads/users/${userId}/profile/${cleanFileName}`;
    }

    // Optional: Handle cover image update
    if (req.files?.['cover_image']) {
      const file = req.files['cover_image'][0];
      const coverFolder = path.join(absoluteUserBasePath, 'cover');
      createFolderIfNotExists(coverFolder);

      const cleanFileName = path.basename(file.originalname).replace(/\s+/g, '_');
      const finalPath = path.join(coverFolder, cleanFileName);

      fs.renameSync(file.path, finalPath);

      req.body.cover_image = `${baseUrl}/uploads/users/${userId}/cover/${cleanFileName}`;
    }

    // Update user information in database
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    const formattedUser = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      i_am: updatedUser.i_am,
      interested_in: updatedUser.interested_in,
      age: updatedUser.age,
      location: updatedUser.location,
      about: updatedUser.about,
      likes: updatedUser.likes || [],
      interests: updatedUser.interests || [],
      hobbies: updatedUser.hobbies || [],
      skin_color: updatedUser.skin_color,
      height: updatedUser.height,
      weight: updatedUser.weight,
      address: updatedUser.address,
      category: updatedUser.category,
      profile_image: updatedUser.profile_image,
      cover_image: updatedUser.cover_image,
      subscription: updatedUser.subscription,
      status: updatedUser.status,
      updated_at: updatedUser.updatedAt
    };

    res.status(200).json({
      status: true,
      message: "User updated successfully",
      data: formattedUser
    });

  } catch (error) {
    console.error('Update error:', error);
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

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status value"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      status: true,
      message: "User status updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

export const getPremiumUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPremiumUsers = await User.countDocuments({ subscription: 'premium' });
    const totalPages = Math.ceil(totalPremiumUsers / limit);

    const premiumUsers = await User.find({ subscription: 'premium' })
      .select('name mobile category subscription status createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedUsers = premiumUsers.map(user => ({
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      category: user.category,
      isPremium: true,
      status: user.status,
      joined_at: user.createdAt
    }));

    res.status(200).json({
      status: true,
      message: "Premium users fetched successfully",
      data: {
        current_page: page,
        total_pages: totalPages,
        total_users: totalPremiumUsers,
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