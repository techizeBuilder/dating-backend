import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const permissionSchema = new mongoose.Schema({
  dashboard: { type: Boolean, default: false },
  users: { type: Boolean, default: false },
  admins: { type: Boolean, default: false },
  content: { type: Boolean, default: false },
  settings: { type: Boolean, default: false },
  reports: { type: Boolean, default: false },
  payments: { type: Boolean, default: false },
  subscriptions: { type: Boolean, default: false },
  questions: { type: Boolean, default: false },
  notifications: { type: Boolean, default: false },
  reported: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  interests: { type: Boolean, default: false },
  introscreens: { type: Boolean, default: false },
  // verifications: { type: Boolean, default: false },
  // logs: { type: Boolean, default: false },
  emailtemplates: { type: Boolean, default: false },
  emailTemplates: { type: Boolean, default: false },
  support: { type: Boolean, default: false },
  profile: { type: Boolean, default: false }
});

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  profile_image: {
    data: Buffer,
    contentType: String
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters']
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  mobile: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'supervisor'],
    default: 'admin'
  },
  permissions: {
    type: permissionSchema,
    default: () => ({})
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;