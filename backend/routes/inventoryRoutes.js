import express from "express";
const router = express.Router();
import { verifyToken, isAdmin  } from "../middleware/authMiddleware.js";
import { getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
 } from "../controllers/inventoryController.js";

router.use(verifyToken);

router.get("/", getInventory);
router.post("/", isAdmin, createInventoryItem);
router.put("/:id", isAdmin, updateInventoryItem);
router.delete("/:id", isAdmin, deleteInventoryItem);

export default router;
