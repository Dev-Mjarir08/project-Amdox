import Project from "../models/Project.js";
import User from "../models/User.js";

// Get Projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().populate("manager", "name initials");
    const mapped = projects.map((p) => ({
      id: p._id,
      name: p.title,
      manager_id: p.manager ? p.manager._id : null,
      manager_name: p.manager ? p.manager.name : "Unassigned",
      manager_initials: p.manager ? p.manager.initials : "?",
      progress: p.progress,
      status: p.status,
      budget: p.budget,
      description: p.description,
    }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

// Create Project
const createProject = async (req, res, next) => {
  try {
    const { name, manager_id, progress, status, budget, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Project name is required." });
    }

    let managerId = manager_id;
    if (!managerId) {
      // Find first admin/manager as default
      const defaultManager = await User.findOne({ role: { $in: ["manager", "admin"] } });
      managerId = defaultManager ? defaultManager._id : req.user._id;
    }

    const project = new Project({
      title: name,
      manager: managerId,
      progress: progress || 0,
      status: status || "Planning",
      budget: budget || 0,
      description: description || "",
    });

    await project.save();
    const populated = await project.populate("manager", "name initials");

    res.status(201).json({
      id: populated._id,
      name: populated.title,
      manager_id: populated.manager._id,
      manager_name: populated.manager.name,
      manager_initials: populated.manager.initials,
      progress: populated.progress,
      status: populated.status,
      budget: populated.budget,
      description: populated.description,
    });
  } catch (err) {
    next(err);
  }
};

// Update Project
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, manager_id, progress, status, budget, description } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    if (name) project.title = name;
    if (manager_id) project.manager = manager_id;
    if (progress !== undefined) project.progress = progress;
    if (status) project.status = status;
    if (budget !== undefined) project.budget = budget;
    if (description !== undefined) project.description = description;

    await project.save();
    const populated = await project.populate("manager", "name initials");

    res.json({
      id: populated._id,
      name: populated.title,
      manager_id: populated.manager._id,
      manager_name: populated.manager.name,
      manager_initials: populated.manager.initials,
      progress: populated.progress,
      status: populated.status,
      budget: populated.budget,
      description: populated.description,
    });
  } catch (err) {
    next(err);
  }
};

// Delete Project
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }
    res.json({ message: "Project deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
