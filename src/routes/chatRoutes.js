import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { sendMessageSchema } from '../validations/chatValidation.js';
import {
  getChatUsers,
  getChatHistory,
  sendMessage
} from '../controllers/chatController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image': ['image/jpeg', 'image/png', 'image/gif'],
    'audio': ['audio/mpeg', 'audio/wav'],
    'doc': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const type = req.body.type;
  if (allowedTypes[type] && allowedTypes[type].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Apply authentication middleware
router.use(protect);

// Chat routes
router.get('/users', getChatUsers);
router.get('/history/:user_id', getChatHistory);
router.post('/send',
  upload.single('file'),
  validateRequest(sendMessageSchema),
  sendMessage
);

export default router;