import express from "express";
const router = express.Router();
import { verifyToken, isHR, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getAssets,
  createAsset,
  assignAsset,
  deleteAsset,
} from "../controllers/assetController.js";

router.use(verifyToken);

router.get("/", getAssets);
router.post("/", isHR, createAsset);
router.put("/:id/assign", isHR, assignAsset);
router.delete("/:id", isAdmin, deleteAsset);

export default router;
