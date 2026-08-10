import express from "express";
const router = express.Router();
import { verifyToken, isEmployee, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createPaymentIntent,
  verifyPayment,
  getTransactions,
  processRefund
} from "../controllers/paymentController.js";

router.post("/create-intent", verifyToken, createPaymentIntent);
router.post("/verify", verifyToken, verifyPayment);
router.get("/history", verifyToken, getTransactions);
router.post("/refund", verifyToken, isAdmin, processRefund);

export default router;
