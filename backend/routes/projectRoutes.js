import express from "express";
const router = express.Router();
import { verifyToken, isManager  } from "../middleware/authMiddleware.js";
import { getProjects,
  createProject,
  updateProject,
  deleteProject,
 } from "../controllers/projectController.js";

router.use(verifyToken);

router.get("/", getProjects);
router.post("/", isManager, createProject);
router.put("/:id", isManager, updateProject);
router.delete("/:id", isManager, deleteProject);

export default router;
