import express from "express";
const router = express.Router();
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";
import { getAuditLogs } from "../controllers/auditController.js";

router.get("/", verifyToken, isAdmin, getAuditLogs);

export default router;
