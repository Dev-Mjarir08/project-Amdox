import express from "express";
const router = express.Router();
import { verifyToken, isHR  } from "../middleware/authMiddleware.js";
import { getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
 } from "../controllers/departmentController.js";

router.use(verifyToken);

router.get("/", getDepartments);
router.post("/", isHR, createDepartment);
router.put("/:id", isHR, updateDepartment);
router.delete("/:id", isHR, deleteDepartment);

export default router;
