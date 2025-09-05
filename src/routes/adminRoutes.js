import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import * as adminController from '../controllers/admin/adminController.js';
import * as authController from '../controllers/admin/authController.js';
import * as userController from '../controllers/admin/userController.js';
import * as quizController from '../controllers/admin/quizController.js';
import * as notificationController from '../controllers/admin/notificationController.js';
import * as paymentController from '../controllers/admin/paymentController.js';
import * as reportController from '../controllers/admin/reportController.js';
import * as interestController from '../controllers/admin/interestController.js';
import * as subscriptionController from '../controllers/admin/subscriptionController.js';
import * as dashboardController from '../controllers/admin/dashboardController.js';
import * as profileController from '../controllers/admin/profileController.js';
import * as activityLogController from '../controllers/admin/activityLogController.js';
import * as bannedUserController from '../controllers/admin/bannedUserController.js';
import * as analyticsController from '../controllers/admin/analyticsController.js';
import * as emailTemplateController from '../controllers/admin/emailTemplateController.js';
import * as supportController from '../controllers/admin/supportController.js';
import { createTemplateSchema, updateTemplateSchema } from '../validations/emailTemplateValidation.js';
import { forgotPassword, resetPassword } from '../controllers/admin/authController.js';

import {
  createQuestionSchema,
  updateQuestionSchema,
  createCategorySchema,
  updateCategorySchema,

} from '../validations/quizValidation.js';

import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  updatePlanStatusSchema,
  purchaseSubscriptionSchema,

} from '../validations/subscriptionValidation.js';
import {
  createAdminSchema,
  updateAdminSchema

} from '../validations/adminValidation.js';

// Temp upload path
const tempDir = path.join(process.cwd(), 'temp_uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
const adminDir = path.join(process.cwd(), 'uploads/admin');
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

// Filter image files only (optional)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Middleware to accept fields
const uploadUserImages = upload.fields([
  { name: 'profile_image', maxCount: 1 },
  { name: 'cover_image', maxCount: 1 }
]);
const handleUserUploads = (req, res, next) => {
  uploadUserImages(req, res, function (err) {
    console.log("Handling user uploads...");
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: false,
          message: 'Image size should not exceed 5MB',
        });
      }
      return res.status(400).json({
        status: false,
        message: `Multer error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        status: false,
        message: `Upload error: ${err.message || 'Unknown error'}`,
      });
    }
    next(); // Proceed to controller
  });
};


const router = express.Router();
// Auth Routes
router.post('/auth/login', authController.login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Default admin create Global route
router.post('/create', adminController.createAdmin);

// Admin Management
router.post('/admins', protectAdmin, validateRequest(createAdminSchema), adminController.createAdmin);
router.get('/admins', protectAdmin, adminController.getAllAdmins);
router.get('/admins/:id', protectAdmin, adminController.getAdminById);
router.put('/admins/:id', protectAdmin, validateRequest(updateAdminSchema), adminController.updateAdmin);
router.delete('/admins/:id', protectAdmin, adminController.deleteAdmin);
router.patch('/admins/:id/status', protectAdmin, adminController.updateAdminStatus);
router.post('/admins/:id/assign-role', protectAdmin, adminController.assignRole);

// User Management
router.get('/users', protectAdmin, userController.getAllUsers);
router.get('/users/:id', protectAdmin, userController.getSingleUser);
// router.post('/users', handleUserUploads, userController.createUser);
router.post('/users', handleUserUploads, userController.createUser);

router.put('/users/:id', protectAdmin, upload.fields([
  { name: 'profile_image', maxCount: 1 },
  { name: 'cover_image', maxCount: 1 }
]), userController.updateUser);

router.delete('/users/:id', protectAdmin, userController.deleteUser);
router.patch('/users/:id/status', protectAdmin, userController.updateUserStatus);
router.get('/users/premium', protectAdmin, userController.getPremiumUsers);

// Quiz Management
router.post('/quiz/questions', protectAdmin, validateRequest(createQuestionSchema), quizController.createQuestion);
router.get('/quiz/questions', protectAdmin, quizController.getAllQuestions);
router.get('/quiz/questions/:id', protectAdmin, quizController.getQuestionById);
router.put('/quiz/questions/:id', protectAdmin, validateRequest(updateQuestionSchema), quizController.updateQuestion);
router.delete('/quiz/questions/:id', protectAdmin, quizController.deleteQuestion);

router.post('/quiz/categories', protectAdmin, validateRequest(createCategorySchema), quizController.createCategory);
router.get('/quiz/categories', protectAdmin, quizController.getAllCategories);
router.put('/quiz/categories/:id', protectAdmin, validateRequest(updateCategorySchema), quizController.updateCategory);
router.delete('/quiz/categories/:id', protectAdmin, quizController.deleteCategory);

router.get('/quiz/dashboard', protectAdmin, quizController.getQuizDashboardStats);

// Notification Management
router.get('/notifications', protectAdmin, notificationController.getAllNotifications);
router.delete('/notifications/clear', protectAdmin, notificationController.clearAllNotifications);
router.delete('/notifications/:id', protectAdmin, notificationController.deleteNotification);
router.put('/notifications/:id/read', protectAdmin, notificationController.markAsRead);

// Payment Management
router.get('/payments', protectAdmin, paymentController.getAllPayments);
router.put('/payments/:payment_id', protectAdmin, paymentController.updatePayment);
router.delete('/payments/:payment_id', protectAdmin, paymentController.deletePayment);

// Report Management
router.get('/reports', protectAdmin, reportController.getAllReports);
router.put('/reports/:reportId/status', protectAdmin, reportController.updateReportStatus);


// Interest Category Routes
router.post('/interest-categories', protectAdmin, interestController.createCategory);
router.get('/interest-categories', protectAdmin, interestController.getAllCategories);
router.get('/interest-categories/:id', protectAdmin, interestController.getCategoryById);
router.put('/interest-categories/:id', protectAdmin, interestController.updateCategory);
router.delete('/interest-categories/:id', protectAdmin, interestController.deleteCategory);

// Interest Routes
router.post('/interests', protectAdmin, interestController.createInterest);
router.get('/interests', protectAdmin, interestController.getAllInterests);
router.get('/interests/:id', protectAdmin, interestController.getInterestById);
router.put('/interests/:id', protectAdmin, interestController.updateInterest);
router.delete('/interests/:id', protectAdmin, interestController.deleteInterest);


// Subscription Management
router.post('/subscriptions', protectAdmin, validateRequest(createSubscriptionPlanSchema), subscriptionController.createSubscriptionPlan);
router.get('/subscriptions', protectAdmin, subscriptionController.getAllSubscriptionPlans);
router.get('/subscriptions/:id', protectAdmin, subscriptionController.getSubscriptionPlanById);
router.put('/subscriptions/:id', protectAdmin, validateRequest(updateSubscriptionPlanSchema), subscriptionController.updateSubscriptionPlan);
router.patch('/subscriptions/:id/status', protectAdmin, subscriptionController.updatePlanStatus);
router.put('/subscriptions/:subscription_id/expire', protectAdmin, subscriptionController.expireUserSubscription);

// Dashboard
router.get('/dashboard', protectAdmin, dashboardController.getDashboardStats);

// Profile Routes
router.get('/profile', protectAdmin, profileController.getProfile);
// router.put('/profile/update', protectAdmin, upload.single('profile_image'), profileController.updateProfile);
router.put(
  '/profile/update',
  protectAdmin,
  upload.fields([
    { name: 'profile_image', maxCount: 1 }
  ]),
  profileController.updateProfile
);

router.put('/profile/change-password', protectAdmin, profileController.changePassword);

// Activity Log Routes
router.get('/activity-logs', protectAdmin, activityLogController.getAllLogs);
router.post('/activity-logs', protectAdmin, activityLogController.createLog);
router.delete('/activity-logs/all', protectAdmin, activityLogController.clearAllLogs); // Changed from /clear to /all
router.delete('/activity-logs/:id', protectAdmin, activityLogController.deleteLog);


// Banned User Management Routes
router.get('/users/banned/list', protectAdmin, bannedUserController.getBannedUsers);
router.put('/users/:user_id/ban', protectAdmin, bannedUserController.banUser);
router.put('/users/:user_id/unban', protectAdmin, bannedUserController.unbanUser);
router.patch('/users/:user_id/status', protectAdmin, bannedUserController.updateUserStatus);


// Analytics Routes
router.get('/recent-activities', protectAdmin, analyticsController.getRecentActivities);
router.post('/user-growth-chart', protectAdmin, analyticsController.getUserGrowthChart);
router.post('/revenue-chart', protectAdmin, analyticsController.getRevenueChart);


// Admin routes for support
router.get('/support/tickets', protectAdmin, supportController.listTickets);
router.get('/support/tickets/:ticket_id', protectAdmin, supportController.getTicketById);
router.post('/support/tickets/:ticket_id/reply', protectAdmin, supportController.replyToTicket);
router.put('/support/tickets/:ticket_id/status', protectAdmin, supportController.updateStatus);




// Email Template Routes
router.post(
  '/email-templates',
  protectAdmin,
  validateRequest(createTemplateSchema),
  emailTemplateController.createTemplate
);

router.get(
  '/email-templates',
  protectAdmin,
  emailTemplateController.getAllTemplates
);

router.get(
  '/email-templates/:id',
  protectAdmin,
  emailTemplateController.getTemplateById
);

router.put(
  '/email-templates/:id',
  protectAdmin,
  validateRequest(updateTemplateSchema),
  emailTemplateController.updateTemplate
);

router.delete(
  '/email-templates/:id',
  protectAdmin,
  emailTemplateController.deleteTemplate
);

export default router;