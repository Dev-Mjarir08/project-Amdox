import express from "express";
const router = express.Router();
import { verifyToken, isHR  } from "../middleware/authMiddleware.js";
import { getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
 } from "../controllers/employeeController.js";

router.use(verifyToken);

router.get("/", getEmployees);
router.post("/", isHR, createEmployee);
router.put("/:id", updateEmployee); // employees can update their own details, managers/HR can update anyone
router.delete("/:id", isHR, deleteEmployee);

export default router;
