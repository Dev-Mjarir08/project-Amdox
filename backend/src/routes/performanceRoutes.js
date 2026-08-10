import express from "express";
const router = express.Router();
import { verifyToken, isHR, isManager } from "../middlewares/authMiddleware.js";
import {
  getReviews,
  createReview,
  deleteReview,
} from "../controllers/performanceController.js";

router.use(verifyToken);

router.get("/", getReviews);
router.post("/", isManager, createReview);
router.delete("/:id", isHR, deleteReview);

export default router;
