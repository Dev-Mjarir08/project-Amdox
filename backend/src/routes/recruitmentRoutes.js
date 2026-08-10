import express from "express";
const router = express.Router();
import { verifyToken, isHR } from "../middlewares/authMiddleware.js";
import {
  getCandidates,
  createCandidate,
  updateCandidateStatus,
  scheduleInterview,
  deleteCandidate,
} from "../controllers/recruitmentController.js";

router.use(verifyToken);

router.get("/", getCandidates);
router.post("/", isHR, createCandidate);
router.put("/:id/status", isHR, updateCandidateStatus);
router.put("/:id/interview", isHR, scheduleInterview);
router.delete("/:id", isHR, deleteCandidate);

export default router;
