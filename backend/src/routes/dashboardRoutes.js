import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAdminDashboardStats,
  getEmployeeDashboardStats,
  getDashboardStats,
} from "../controllers/dashboardController.js";

router.use(verifyToken);

router.get("/stats", getDashboardStats);
router.get("/admin", getAdminDashboardStats);
router.get("/employee", getEmployeeDashboardStats);

export default router;
