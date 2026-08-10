import express from "express";
const router = express.Router();
import { verifyToken, isHR, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
  deletePO,
} from "../controllers/purchaseController.js";

router.use(verifyToken);

router.get("/", getPurchaseOrders);
router.post("/", isHR, createPurchaseOrder);
router.put("/:id/status", isHR, updatePOStatus);
router.delete("/:id", isAdmin, deletePO);

export default router;
