import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import genrateRtcToken from "../utils/agoraTokenGenerator.js";
import UserSubscription from "../models/userSubscriptionModel.js";
import CallLog from "../models/callLog.js";

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Get single user
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      status: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    const token = generateToken(savedUser._id);

    res.status(201).json({
      status: true,
      data: {
        user: savedUser,
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      status: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const userToBeBlocked = await User.findById(req.params.id);
    console.log(req.params.id);

    if (!userToBeBlocked) {
      return res.status(404).json({
        status: false,
        message: "User doesn't exist",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $addToSet: { blockedUsers: req.params.id }, // prevents duplicates
      },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "User blocked successfully",
      blockedUsers: updatedUser.blockedUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

//videocall route
export const videoCall = async (req, res) => {
  try {
    const callerId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    const callerPlan = await UserSubscription.findOne({
      user_id: callerId,
      status: "active",
    });

    const receiverPlan = await UserSubscription.findOne({
      user_id: receiverId,
      status: "active",
    });

    const callerHasPlan = !!callerPlan;
    const receiverHasPlan = !!receiverPlan;

    const previousFreeCall = await CallLog.findOne({
      $or: [
        { caller: callerId, receiver: receiverId },
        { caller: receiverId, receiver: callerId },
      ],
      wasFreeCall: true,
    });

    let callDuration;

    if (callerHasPlan && receiverHasPlan) {
      // ✅ Unlimited call
      callDuration = -1;
    } else if (!callerHasPlan && !receiverHasPlan) {
      // ❌ Neither has plan
      if (previousFreeCall) {
        return res.status(403).json({
          message:
            "You’ve already used your free video call. Please purchase a plan to continue.",
        });
      }
      callDuration = 2 * 60;
    } else if (!callerHasPlan || !receiverHasPlan) {
      // ❌ One has plan, one doesn't
      if (previousFreeCall) {
        return res.status(403).json({
          message: "Both users need an active plan to make a call.",
        });
      }
      callDuration = 2 * 60; // 2 min allowed only if it's the first time
    }

    const channelName = `call_${callerId}_${receiverId}`;
    const callerUid = Date.now() % (2 ** 31 - 1);
    const receiverUid = callerUid + 1;

    const callerToken = genrateRtcToken(callerUid, channelName);
    const receiverToken = genrateRtcToken(receiverUid, channelName);

    return res.status(200).json({
      message: "Call tokens generated successfully",
      data: {
        callDuration,
        bothHavePlan: callerHasPlan && receiverHasPlan,
        callerHasPlan,
        receiverHasPlan,
        caller: {
          channeltoken: callerToken,
          channelName: channelName,
          uniqueId: callerUid,
          agoraKey: process.env.AGORA_APPID,
          id: callerId,
          name: req.user.name,
        },
        receiver: {
          channeltoken: receiverToken,
          channelName: channelName,
          uniqueId: receiverUid,
          agoraKey: process.env.AGORA_APPID,
          id: receiverId,
          name: req.user.name,
          profile: req.user.profile_image,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error generating call tokens",
      error: error.message,
    });
  }
};

export const saveCallLog = async (req, res) => {
  try {
    const { caller, receiver, wasFreeCall } = req.body;

    if (!caller || !receiver) {
      return res
        .status(400)
        .json({ message: "Caller and receiver are required" });
    }

    const call = await CallLog.create({
      caller,
      receiver,
      wasFreeCall: !!wasFreeCall,
    });

    return res.status(201).json({
      message: "Call log saved successfully",
      data: call,
    });
  } catch (error) {
    console.error("Error saving call log:", error);
    res.status(500).json({
      message: "Failed to save call log",
      error: error.message,
    });
  }
};
