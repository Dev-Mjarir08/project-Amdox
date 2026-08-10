import express from "express";
const router = express.Router();
import { verifyToken, isManager } from "../middlewares/authMiddleware.js";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
} from "../controllers/taskController.js";

router.use(verifyToken);

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", isManager, createTask);
router.put("/:id", updateTask);
router.delete("/:id", isManager, deleteTask);
router.post("/bulk-delete", isManager, bulkDeleteTasks);

export default router;
