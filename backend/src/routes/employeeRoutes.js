import express from "express";
const router = express.Router();
import { verifyToken, isHR } from "../middlewares/authMiddleware.js";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateStatus,
  deleteEmployee,
  bulkDeleteEmployees,
} from "../controllers/employeeController.js";

router.use(verifyToken);

router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.post("/", isHR, createEmployee);
router.put("/:id", updateEmployee);
router.patch("/:id/status", isHR, updateStatus);
router.delete("/:id", isHR, deleteEmployee);
router.post("/bulk-delete", isHR, bulkDeleteEmployees);

export default router;
