import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getSubscriptionPlans,
  purchaseSubscription,
  successPayment,
  getMyActiveSubscriptions,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.get("/plans", getSubscriptionPlans);
router.get("/paypal-success", successPayment);

router.use(protect);

// Subscription routes
router.post("/purchase", purchaseSubscription);
router.get("/my-subscription", getMyActiveSubscriptions);

export default router;
