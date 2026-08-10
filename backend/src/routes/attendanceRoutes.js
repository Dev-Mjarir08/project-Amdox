import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAttendanceLogs,
  getClockInStatus,
  clockIn,
  clockOut,
} from "../controllers/attendanceController.js";

router.use(verifyToken);

router.get("/", getAttendanceLogs);
router.get("/logs", getAttendanceLogs);
router.get("/status", getClockInStatus);
router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);

export default router;
