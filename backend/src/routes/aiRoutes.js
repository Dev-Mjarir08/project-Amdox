import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAttritionForecast,
  getAttendanceForecast,
  getInventoryForecast,
  getFinanceForecast,
  chatAssistant,
  runCustomForecast,
} from "../controllers/aiController.js";

router.use(verifyToken);

router.get("/attrition", getAttritionForecast);
router.get("/attendance", getAttendanceForecast);
router.get("/inventory", getInventoryForecast);
router.get("/finance", getFinanceForecast);
router.post("/chat", chatAssistant);
router.post("/forecast", runCustomForecast);

export default router;
