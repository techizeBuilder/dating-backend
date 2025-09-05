import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// const matchedUserSchema = new mongoose.Schema(
//   {
//     id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//   },
//   { _id: false }
// );

const reportSchema = new mongoose.Schema(
  {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    city: {
      type: String,
      required: false,
    },
    pincode: {
      type: String,
      required: false,
    },
    locality: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [2, "Name must be at least 2 characters"],
      maxLength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      unique: true,
      // match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid mobile number']
    },
    country_code: {
      type: String,
      required: false,
    },
    i_am: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be either Male, Female, or Other",
      },
    },
    interested_in: {
      type: String,
      required: [true, "Interest preference is required"],
      enum: {
        values: ["Male", "Female", "Both"],
        message: "Interest must be either Male, Female, or Both",
      },
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18"],
      max: [120, "Age cannot exceed 120"],
    },
    about: {
      type: String,
      trim: true,
      maxLength: [500, "About section cannot exceed 500 characters"],
    },
    likes: [
      {
        required: false,
        type: String,
        trim: true,
      },
    ],
    interests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interest",
      },
    ],
    hobbies: [
      {
        required: false,
        type: String,
        trim: true,
      },
    ],
    skin_color: {
      type: String,
      trim: true,
    },
    height: {
      type: Number,
      min: [100, "Height must be at least 100 cm"],
      max: [250, "Height cannot exceed 250 cm"],
    },
    weight: {
      type: Number,
      min: [30, "Weight must be at least 30 kg"],
      max: [200, "Weight cannot exceed 200 kg"],
    },
    address: addressSchema,
    profession: {
      type: String,
      trim: true,
    },
    marital_status: {
      type: String,
      enum: ["married", "unmarried", "widow", null],
      default: null,
    },
    category: {
      type: String,
      enum: {
        values: ["Casual Dating", "Serious Relationship", "Friendship"],
        message: "Invalid category selected",
      },
      default: "Casual Dating",
    },
    subscription: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    profile_image: {
      type: String,
      trim: true,
    },
    cover_image: {
      type: String,
      trim: true,
    },
    likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    report: {
      reported_count: {
        type: Number,
        default: 0,
      },
      reports: [reportSchema],
    },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
