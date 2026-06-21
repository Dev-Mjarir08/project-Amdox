import express from "express";
const router = express.Router();
import { verifyToken  } from "../middleware/authMiddleware.js";
import { login,
  register,
  logout,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
 } from "../controllers/authController.js";

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/me", verifyToken, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", verifyToken, changePassword);

export default router;
