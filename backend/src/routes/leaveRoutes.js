import express from "express";
const router = express.Router();
import { verifyToken, isHR } from "../middlewares/authMiddleware.js";
import {
  getLeaves,
  applyLeave,
  reviewLeave,
} from "../controllers/leaveController.js";

router.use(verifyToken);

router.get("/", getLeaves);
router.post("/", applyLeave);
router.put("/:id", isHR, reviewLeave);

// Legacy support for POST /approve and /reject
router.post("/:id/approve", isHR, (req, res, next) => {
  req.body.status = "approved";
  reviewLeave(req, res, next);
});

router.post("/:id/reject", isHR, (req, res, next) => {
  req.body.status = "rejected";
  reviewLeave(req, res, next);
});

export default router;
