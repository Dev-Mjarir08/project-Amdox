import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../controllers/vendorController.js";

router.use(verifyToken);

router.get("/", getVendors);
router.post("/", createVendor);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

export default router;
