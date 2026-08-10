import express from "express";
const router = express.Router();
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

router.use(verifyToken);

router.get("/", getDepartments);
router.post("/", isAdmin, createDepartment);
router.put("/:id", isAdmin, updateDepartment);
router.delete("/:id", isAdmin, deleteDepartment);

export default router;
