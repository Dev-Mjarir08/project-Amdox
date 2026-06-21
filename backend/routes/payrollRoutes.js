import express from "express";
const router = express.Router();
import { verifyToken, isHR  } from "../middleware/authMiddleware.js";
import { getPayrollRecords,
  generatePayroll,
  updatePayrollStatus,
 } from "../controllers/payrollController.js";

router.use(verifyToken);

router.get("/", getPayrollRecords);
router.post("/generate", isHR, generatePayroll);
router.patch("/:id", isHR, updatePayrollStatus);

export default router;
