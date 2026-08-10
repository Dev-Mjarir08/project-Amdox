import express from "express";
const router = express.Router();
import { verifyToken, isEmployee, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} from "../controllers/salesController.js";

router.use(verifyToken);

router.get("/", getInvoices);
router.post("/", isEmployee, createInvoice);
router.put("/:id/status", isEmployee, updateInvoiceStatus);
router.delete("/:id", isAdmin, deleteInvoice);

export default router;
