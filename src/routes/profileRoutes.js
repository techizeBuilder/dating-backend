import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { rateAppSchema } from '../validations/profileValidation.js';
import {
  getProfile,
  deleteAccount,
  rateApp
} from '../controllers/profileController.js';

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// Profile routes
router.get('/', getProfile);
router.delete('/delete-account', deleteAccount);
router.post('/rate', validateRequest(rateAppSchema), rateApp);

export default router;