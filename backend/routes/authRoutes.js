import express from "express";
const router = express.Router();
import { verifyToken, checkAdminRegistrationAccess  } from "../middleware/authMiddleware.js";
import { login,
  register,
  logout,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
  registerAdmin,
 } from "../controllers/authController.js";

router.post("/login", login);
router.post("/register-admin", checkAdminRegistrationAccess, registerAdmin);
router.post("/register", checkAdminRegistrationAccess, registerAdmin);
router.post("/logout", logout);
router.get("/me", verifyToken, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", verifyToken, changePassword);

export default router;
