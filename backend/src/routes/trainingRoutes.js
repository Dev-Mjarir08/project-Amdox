import express from "express";
const router = express.Router();
import { verifyToken, isHR, isEmployee } from "../middlewares/authMiddleware.js";
import {
  getCourses,
  createCourse,
  joinCourse,
  deleteCourse,
} from "../controllers/trainingController.js";

router.use(verifyToken);

router.get("/", getCourses);
router.post("/", isHR, createCourse);
router.post("/:id/join", isEmployee, joinCourse);
router.delete("/:id", isHR, deleteCourse);

export default router;
