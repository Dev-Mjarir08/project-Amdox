import express from "express";
const router = express.Router();
import { verifyToken, isHR } from "../middlewares/authMiddleware.js";
import {
  getHolidays,
  createHoliday,
  deleteHoliday,
} from "../controllers/holidayController.js";

router.use(verifyToken);

router.get("/", getHolidays);
router.post("/", isHR, createHoliday);
router.delete("/:id", isHR, deleteHoliday);

export default router;
