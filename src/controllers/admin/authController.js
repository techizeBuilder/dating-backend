import jwt from 'jsonwebtoken';
import Admin from '../../models/adminModel.js';
import sendEmail from '../../utils/sendEmail.js';
import Crypto from 'crypto';
import bcrypt from 'bcrypt';
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const generateToken = (admin) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(
    {
      id: admin._id.toString(),
      role: admin.role,
      email: admin.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  );
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

    const token = generateToken(admin);
    // Prepare permissions array
    const permissions = [];

    if (admin.permissions && typeof admin.permissions === 'object') {
      // Convert the Mongoose object to a plain JavaScript object if necessary
      const permissionsObject = admin.permissions.toObject ? admin.permissions.toObject() : admin.permissions;

      for (const [key, value] of Object.entries(permissionsObject)) {
        // Check if the key is an internal Mongoose property, and skip it
        if (!key.startsWith('$') && value === true) {
          permissions.push(key);
        }
      }
    }

    console.log('admin.permissions:', admin.permissions); // Log the raw permissions object
    console.log('permissions array:', permissions);
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
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: false, message: 'Admin not found' });
    }
    // Generate token
    const resetToken = Crypto.randomBytes(32).toString('hex');

    // Store token and expiration in user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const message = `
      <p>You requested a password reset.</p>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Admin Password Reset',
      html: message,
    });

    res.json({ status: true, message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ status: false, message: err.message });
  }
};


export const resetPassword = async (req, res) => {
  const { password, confirmPassword, token } = req.body;

  try {
    if (password !== confirmPassword)
      return res.status(400).json({ status: false, message: 'Passwords do not match' });

    const user = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ status: false, message: 'Invalid or expired token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ status: true, message: 'Password has been reset' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};