import express from "express";
const router = express.Router();
import { verifyToken, isEmployee, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getLeads,
  createLead,
  updateLeadStage,
  deleteLead,
} from "../controllers/crmController.js";

router.use(verifyToken);

router.get("/", getLeads);
router.post("/", isEmployee, createLead);
router.put("/:id", isEmployee, updateLeadStage);
router.delete("/:id", isAdmin, deleteLead);

export default router;
