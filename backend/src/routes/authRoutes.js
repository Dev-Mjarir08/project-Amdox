import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/authMiddleware.js";
import { uploadProfile } from "../middlewares/uploadMiddleware.js";
import { 
  login,
  register,
  logout,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
  refresh,
  createAdminUser,
  sendOTP,
  verifyOTP,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
} from "../controllers/authController.js";

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.post("/create-admin", createAdminUser);
router.get("/me", verifyToken, me);
router.put("/profile", verifyToken, updateProfile);

// Profile Image Upload & Delete Routes (Multer)
router.post("/profile-image", verifyToken, uploadProfile.single("profileImage"), uploadProfileImage);
router.delete("/profile-image", verifyToken, deleteProfileImage);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", verifyToken, changePassword);

// New OTP Verification & Account Lifecycle Routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/deactivate", verifyToken, deactivateAccount);
router.post("/reactivate", reactivateAccount);
router.delete("/delete-account", verifyToken, deleteAccount);
router.post("/delete-account", verifyToken, deleteAccount);

export default router;
