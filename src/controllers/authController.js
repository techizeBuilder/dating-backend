import User from "../models/userModel.js";
import { generateOTP, sendSMS } from "../utils/otp.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const sendOTP = async (req, res) => {
  try {
    const { mobile, countryCode } = req.body;
    const fullMobile = `${countryCode}${mobile}`;

    // Hardcode OTP as "1234" for the test number +972501234567
    const isTestNumber = fullMobile === "+9725012345678";
    const otp = isTestNumber ? "1234" : generateOTP();

    console.log("Generated OTP:", otp);

    // Save OTP and expiry
    const user = await User.findOneAndUpdate(
      { mobile },
      {
        $set: {
          mobile,
          otp,
          otpExpiry: Date.now() + 10 * 60 * 1000,
        },
      },
      { upsert: true, new: true }
    );

    // Send OTP via SMS (skip for test number to avoid SMS costs)
    if (!isTestNumber) {
      const otpMessage = `Heart2Get Verification Code: ${otp}\nThis code is valid for 10 minutes.\nFor your security, do not share this code with anyone.`;
      await sendSMS(fullMobile, otpMessage);
    }

    res.status(200).json({
      status: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    let errorMessage = "Error sending OTP";
    if (error.message.includes("region")) {
      errorMessage =
        "SMS sending is not allowed to this region. Please contact support or use a different number.";
    }

    res.status(500).json({
      status: false,
      message: errorMessage,
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const user = await User.findOne({ mobile });
    console.log("user", user);

    // 🔥 Special case: Test number (5012345678)
    const isTestNumber = mobile === "5012345678";
    if (isTestNumber) {
      if (otp !== "1234") {
        // Only accept "1234" for test number
        return res.status(400).json({
          status: false,
          message: "For test number, use OTP: 1234",
        });
      }
    }
    // Standard OTP validation for other numbers
    else {
      if (!user.otp || user.otpExpiry < Date.now()) {
        return res.status(400).json({
          status: false,
          message: "OTP has expired. Please request a new one.",
        });
      }
      if (user.otp !== otp) {
        return res.status(400).json({
          status: false,
          message: "Invalid OTP. Please check and try again.",
        });
      }
    }

    // ✅ OTP is valid — clear it
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // ✅ Generate JWT token
    const token = generateToken(user);

    // 👇 Check profile completeness
    const isProfileComplete = Boolean(
      user.name && user.email && user.age && user.i_am && user.interested_in
    );

    let responseUser;

    if (isProfileComplete) {
      // 🔄 Fetch full user with all populated fields if needed
      responseUser = await User.findById(user._id)
        .select("-password -otp -otpExpiry") // exclude sensitive fields
        .populate(["interests", "hobbies", "likes"]); // populate only if needed
    } else {
      // Send partial info
      responseUser = {
        _id: user._id,
        mobile: user.mobile,
        name: user.name || "",
        email: user.email || "",
        isProfileComplete,
      };
    }

    res.status(200).json({
      status: true,
      message: "OTP verified successfully",
      data: {
        token,
        user: responseUser,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      status: false,
      message: error.message || "Error verifying OTP",
    });
  }
};
