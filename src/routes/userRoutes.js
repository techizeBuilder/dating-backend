import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";
import {
  createUserSchema,
  updateUserSchema,
  parseJsonFields,
} from "../validations/userValidation.js";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  videoCall,
  saveCallLog,
  blockUser,
  savePushNotificationToken,
} from "../controllers/userController.js";
import {
  setupProfile,
  getMatches,
  updateProfile,
  getUserDetails,
  likeUser,
  getAllMatchedUsers,
} from "../controllers/userProfileController.js";
import {
  createSupportTicket,
  getUserSupportTickets,
  reportUser,
} from "../controllers/supportController.js";
import { getAllQuestions } from "../controllers/admin/quizController.js";
import {
  getQuizResultsBySession,
  saveQuizResult,
} from "../controllers/quizResultController.js";
import {
  addToFavourites,
  getFavourites,
  removeFromFavourites,
} from "../controllers/favController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Apply protect middleware to all routes
router.use(protect);

router.post("/videocall", videoCall);
router.post("/save-call-log", saveCallLog);

// support tickets
router.get("/tickets", getUserSupportTickets);
router.post("/support-ticket", createSupportTicket);
router.post("/report", reportUser);

// Profile routes
router.post("/profile/setup", validateRequest(createUserSchema), setupProfile);
router.put(
  "/profile/update",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "banner_image", maxCount: 1 },
  ]),
  parseJsonFields(["likes", "interests", "hobbies", "address"]),
  validateRequest(updateUserSchema),
  updateProfile
);
router.post("/add-favourite", addToFavourites);
router.post("/remove-favourite", removeFromFavourites);
router.get("/my-favourites", getFavourites);

router.post("/quiz-result", saveQuizResult);
router.get("/quiz-result/:quizSessionId", getQuizResultsBySession);
router.get("/quiz-games", getAllQuestions);
router.get("/matches", getMatches);
router.post("/like-user", likeUser);
router.get("/get-matched-users", getAllMatchedUsers);
router.get("/details/:id", getUserDetails);

// Basic user routes
router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/:id/block", blockUser);

// NotificationToken
router.post("/notification-token", savePushNotificationToken);

export default router;
