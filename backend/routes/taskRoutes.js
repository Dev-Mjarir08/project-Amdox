import express from "express";
const router = express.Router();
import { verifyToken, isManager  } from "../middleware/authMiddleware.js";
import { getTasks,
  createTask,
  updateTask,
  deleteTask,
 } from "../controllers/taskController.js";

router.use(verifyToken);

router.get("/", getTasks);
router.post("/", isManager, createTask);
router.put("/:id", updateTask);
router.delete("/:id", isManager, deleteTask);

export default router;
