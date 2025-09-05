import express from "express";
import { validateRequest } from "../middleware/validationMiddleware.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "../validations/authValidation.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/send-otp",
  validateRequest(sendOtpSchema),
  authController.sendOTP
);
router.post(
  "/verify-otp",
  validateRequest(verifyOtpSchema),
  authController.verifyOTP
);

export default router;
