import express from "express";
const router = express.Router();
import { verifyToken, isHR  } from "../middleware/authMiddleware.js";
import { getLeaves,
  applyLeave,
  reviewLeave,
 } from "../controllers/leaveController.js";

router.use(verifyToken);

router.get("/", getLeaves);
router.post("/", applyLeave);
router.patch("/:id", isHR, reviewLeave);

export default router;
