import Admin from '../../models/adminModel.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import AdminProfile from '../../models/adminProfileModel.js';

export const createAdmin = async (req, res) => {
  try {
    const { permissions, ...adminData } = req.body;

    const existing = await Admin.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const admin = await Admin.create({
      ...adminData,
      permissions: permissions || {}
    });

    res.status(201).json({
      status: true,
      message: "Admin created successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message
    });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').lean();

    const formattedAdmins = await Promise.all(
      admins.map(async (admin) => {
        const profile = await AdminProfile.findOne({ admin_id: admin._id }).lean();
        return {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          status: admin.status || 'active',
          profile_image: profile?.profile_image || '',
          last_login: profile?.last_login || null,
          last_password_change: profile?.last_password_change || null
        };
      })
    );

    res.status(200).json({
      status: true,
      admins: formattedAdmins
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select('-password')
      .lean();

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      status: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role,
        permissions: admin.permissions,
        status: admin.status || 'active'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};
export const updateAdmin = async (req, res) => {
  try {
    const update = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      role: req.body.role,
      permissions: req.body.permissions
    };

    // If image is uploaded, read and set image data
    if (req.file) {
      update.profile_image = {
        data: fs.readFileSync(req.file.path),
        contentType: req.file.mimetype
      };
    }

    const admin = await Admin.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!admin) {
      return res.status(404).json({ status: false, message: 'Admin not found' });
    }

    let profileImageBase64 = '';
    if (admin.profile_image?.data && admin.profile_image?.contentType) {
      profileImageBase64 = `data:${admin.profile_image.contentType};base64,${admin.profile_image.data.toString('base64')}`;
    }

    res.json({
      status: true,
      message: 'Updated',
      data: {
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role,
        permissions: admin.permissions,
        profile_image: profileImageBase64
      }
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ status: false, message: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      status: true,
      message: "Admin deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

export const updateAdminStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status value"
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      status: true,
      message: "Admin status updated"
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

export const assignRole = async (req, res) => {
  try {
    const { role, permissions } = req.body;

    if (!['admin', 'moderator', 'supervisor'].includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Invalid role"
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        role,
        ...(permissions && { permissions })
      },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      status: true,
      message: "Role and permissions assigned to admin"
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};