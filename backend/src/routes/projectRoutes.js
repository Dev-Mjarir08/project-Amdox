import express from "express";
const router = express.Router();
import { verifyToken, isManager } from "../middlewares/authMiddleware.js";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  bulkDeleteProjects,
} from "../controllers/projectController.js";

router.use(verifyToken);

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", isManager, createProject);
router.put("/:id", isManager, updateProject);
router.delete("/:id", isManager, deleteProject);
router.post("/bulk-delete", isManager, bulkDeleteProjects);

export default router;
