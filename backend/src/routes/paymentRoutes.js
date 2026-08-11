import express from "express";
const router = express.Router();
import { verifyToken, isEmployee, isAdmin } from "../middlewares/authMiddleware.js";
import {
  testRazorpayConnection,
  createPaymentIntent,
  verifyPayment,
  getTransactions,
  processRefund
} from "../controllers/paymentController.js";

router.post("/test-razorpay", verifyToken, testRazorpayConnection);
router.post("/create-intent", verifyToken, createPaymentIntent);
router.post("/verify", verifyToken, verifyPayment);
router.get("/history", verifyToken, getTransactions);
router.post("/refund", verifyToken, isAdmin, processRefund);

export default router;
