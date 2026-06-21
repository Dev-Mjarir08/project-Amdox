import express from "express";
const router = express.Router();
import { verifyToken, isAdmin  } from "../middleware/authMiddleware.js";
import { getAdminDashboardStats,
  getEmployeeDashboardStats,
  getDashboardStats
 } from "../controllers/dashboardController.js";

router.use(verifyToken);

router.get("/admin", isAdmin, getAdminDashboardStats);
router.get("/employee", getEmployeeDashboardStats);
router.get("/stats", getDashboardStats);

export default router;
