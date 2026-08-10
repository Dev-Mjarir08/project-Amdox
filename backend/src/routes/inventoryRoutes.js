import express from "express";
const router = express.Router();
import { verifyToken, isManager } from "../middlewares/authMiddleware.js";
import {
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  bulkDeleteInventory,
} from "../controllers/inventoryController.js";

router.use(verifyToken);

router.get("/", getInventory);
router.get("/:id", getInventoryById);
router.post("/", isManager, createInventoryItem);
router.put("/:id", isManager, updateInventoryItem);
router.delete("/:id", isManager, deleteInventoryItem);
router.post("/bulk-delete", isManager, bulkDeleteInventory);

export default router;
