import Admin from '../../models/adminModel.js';
import AdminProfile from '../../models/adminProfileModel.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export const getProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id)
            .select('-password')
            .lean();

        const profile = await AdminProfile.findOne({ admin_id: req.admin._id })
            .lean();

        res.status(200).json({
            status: true,
            profile: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                mobile: admin.mobile,
                profile_image: profile?.profile_image,
                role: admin.role,
                last_login: profile?.last_login
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, mobile } = req.body;
        const profile_image_temp = req.files?.profile_image?.[0]?.path; // Get temp image path

        if (!profile_image_temp) {
            return res.status(400).json({ status: false, message: 'No profile image uploaded!' });
        }

        // Move image from temporary directory to permanent directory
        const profile_image = path.join('uploads/admin', path.basename(profile_image_temp));

        // Move the file to the permanent directory
        fs.renameSync(profile_image_temp, profile_image);

        // Update the admin profile
        const admin = await Admin.findByIdAndUpdate(
            req.admin._id,
            { name, mobile },
            { new: true }
        ).select('-password');

        // Check if AdminProfile exists or create new
        let adminProfile = await AdminProfile.findOne({ admin_id: req.admin._id });

        if (!adminProfile) {
            adminProfile = new AdminProfile({ admin_id: req.admin._id });
        }

        // Save the new profile image path to the AdminProfile
        adminProfile.profile_image = profile_image; // Store the permanent image path

        await adminProfile.save();

        // Return success response
        res.status(200).json({
            status: true,
            message: "Profile updated successfully",
            data: {
                id: admin._id,
                name: admin.name,
                mobile: admin.mobile,
                profile_image: adminProfile.profile_image // Send the permanent image path
            }
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;

        if (new_password !== confirm_password) {
            return res.status(400).json({
                status: false,
                message: "New password and confirm password do not match"
            });
        }

        const admin = await Admin.findById(req.admin._id);
        const isMatch = await bcrypt.compare(current_password, admin.password);

        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: "Current password is incorrect"
            });
        }

        admin.password = new_password;
        await admin.save();

        await AdminProfile.findOneAndUpdate(
            { admin_id: req.admin._id },
            { last_password_change: new Date() },
            { upsert: true }
        );

        res.status(200).json({
            status: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};