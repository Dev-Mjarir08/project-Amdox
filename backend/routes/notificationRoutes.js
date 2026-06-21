import express from "express";
const router = express.Router();
import { verifyToken  } from "../middleware/authMiddleware.js";
import { getNotifications,
  markAsRead,
  markAllAsRead,
 } from "../controllers/notificationController.js";

router.use(verifyToken);

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.post("/read-all", markAllAsRead);

export default router;
