import express from "express";
const router = express.Router();
import { verifyToken, isHR, isManager } from "../middlewares/authMiddleware.js";
import {
  getShifts,
  createShift,
  deleteShift,
} from "../controllers/shiftController.js";

router.use(verifyToken);

router.get("/", getShifts);
router.post("/", isHR, createShift);
router.delete("/:id", isHR, deleteShift);

export default router;
