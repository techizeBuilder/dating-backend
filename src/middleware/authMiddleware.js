import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Not authorized, no token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the token contains role (admin token) or just id (user token)
      if (decoded.role) {
        // Admin authentication
        const admin = await Admin.findOne({
          _id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        }).select("-password");

        if (!admin) {
          return res.status(401).json({
            status: false,
            message: "Admin not found or unauthorized",
          });
        }

        req.admin = admin;
      } else {
        // User authentication
        const user = await User.findById(decoded.id).select("-otp -otpExpiry");

        if (!user) {
          return res.status(401).json({
            status: false,
            message: "User not found or unauthorized",
          });
        }

        req.user = user;
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          status: false,
          message: "Invalid token format or signature",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          status: false,
          message: "Token has expired",
        });
      }

      return res.status(401).json({
        status: false,
        message: "Token validation failed",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error in authentication",
    });
  }
};

export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Not authorized, no token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.role) {
        return res.status(401).json({
          status: false,
          message: "Not authorized as admin",
        });
      }

      const admin = await Admin.findOne({
        _id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      }).select("-password");

      if (!admin) {
        return res.status(401).json({
          status: false,
          message: "Admin not found or unauthorized",
        });
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        status: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error in authentication",
    });
  }
};
