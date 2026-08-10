import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

router.use(verifyToken);

router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);

export default router;
