import Project from "../models/Project.js";
import User from "../models/User.js";

// Helper to normalize status for database querying
const normalizeDbStatus = (status) => {
  if (!status) return null;
  const lower = status.toLowerCase();
  if (lower === "planning") return "Planning";
  if (lower === "active") return "Active";
  if (lower === "completed") return "Completed";
  if (lower === "blocked" || lower === "on_hold") return "Blocked";
  return status;
};

// Helper to normalize status for frontend consumption
const normalizeFrontendStatus = (status) => {
  if (!status) return "planning";
  const lower = status.toLowerCase();
  if (lower === "blocked") return "on_hold";
  return lower;
};

// Get Projects
const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, status, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const query = {};

    if (status && status !== "all") {
      const dbStatus = normalizeDbStatus(status);
      if (dbStatus) query.status = dbStatus;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const projects = await Project.find(query)
      .populate("manager", "name initials");

    let mapped = projects.map((p) => ({
      id: p._id,
      code: `PRJ-${String(p._id).substring(18).toUpperCase()}`,
      name: p.title,
      manager_id: p.manager ? p.manager._id : null,
      manager_name: p.manager ? p.manager.name : "Unassigned",
      manager_initials: p.manager ? p.manager.initials : "?",
      progress: p.progress,
      status: normalizeFrontendStatus(p.status),
      budget: p.budget,
      description: p.description,
      timeline: p.startDate && p.endDate 
        ? `${p.startDate.toISOString().split("T")[0]} to ${p.endDate.toISOString().split("T")[0]}`
        : "No Timeline",
      createdAt: p.createdAt
    }));

    // Sorting
    mapped.sort((a, b) => {
      let valA = a[sortBy] || "";
      let valB = b[sortBy] || "";
      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = mapped.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      message: "Projects fetched successfully.",
      data: paginated,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Get Project By ID
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const p = await Project.findById(id).populate("manager", "name initials");
    if (!p) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
        data: null,
        errors: ["Project not found."],
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: "Project details fetched successfully.",
      data: {
        id: p._id,
        code: `PRJ-${String(p._id).substring(18).toUpperCase()}`,
        name: p.title,
        manager_id: p.manager ? p.manager._id : null,
        manager_name: p.manager ? p.manager.name : "Unassigned",
        manager_initials: p.manager ? p.manager.initials : "?",
        progress: p.progress,
        status: normalizeFrontendStatus(p.status),
        budget: p.budget,
        description: p.description,
        timeline: p.startDate && p.endDate 
          ? `${p.startDate.toISOString().split("T")[0]} to ${p.endDate.toISOString().split("T")[0]}`
          : "No Timeline",
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Create Project
const createProject = async (req, res, next) => {
  try {
    const { name, manager_id, progress, status, budget, description, startDate, endDate } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required.",
        data: null,
        errors: ["Project name is required."],
        timestamp: new Date().toISOString()
      });
    }

    let managerId = manager_id;
    if (!managerId) {
      const defaultManager = await User.findOne({ role: { $in: ["manager", "admin"] } });
      managerId = defaultManager ? defaultManager._id : req.user._id;
    }

    const project = new Project({
      title: name,
      manager: managerId,
      progress: progress || 0,
      status: normalizeDbStatus(status) || "Planning",
      budget: budget || 0,
      description: description || "",
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await project.save();
    const populated = await project.populate("manager", "name initials");

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: {
        id: populated._id,
        code: `PRJ-${String(populated._id).substring(18).toUpperCase()}`,
        name: populated.title,
        manager_id: populated.manager._id,
        manager_name: populated.manager.name,
        manager_initials: populated.manager.initials,
        progress: populated.progress,
        status: normalizeFrontendStatus(populated.status),
        budget: populated.budget,
        description: populated.description,
        timeline: `${populated.startDate.toISOString().split("T")[0]} to ${populated.endDate.toISOString().split("T")[0]}`
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Update Project
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, manager_id, progress, status, budget, description, startDate, endDate } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
        data: null,
        errors: ["Project not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (name) project.title = name;
    if (manager_id) project.manager = manager_id;
    if (progress !== undefined) project.progress = progress;
    if (status) project.status = normalizeDbStatus(status);
    if (budget !== undefined) project.budget = budget;
    if (description !== undefined) project.description = description;
    if (startDate) project.startDate = new Date(startDate);
    if (endDate) project.endDate = new Date(endDate);

    await project.save();
    const populated = await project.populate("manager", "name initials");

    res.json({
      success: true,
      message: "Project updated successfully.",
      data: {
        id: populated._id,
        code: `PRJ-${String(populated._id).substring(18).toUpperCase()}`,
        name: populated.title,
        manager_id: populated.manager._id,
        manager_name: populated.manager.name,
        manager_initials: populated.manager.initials,
        progress: populated.progress,
        status: normalizeFrontendStatus(populated.status),
        budget: populated.budget,
        description: populated.description,
        timeline: `${populated.startDate.toISOString().split("T")[0]} to ${populated.endDate.toISOString().split("T")[0]}`
      },
      errors: [],
      timestamp: new Date().toISOString()
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
      return res.status(404).json({
        success: false,
        message: "Project not found.",
        data: null,
        errors: ["Project not found."],
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: "Project deleted successfully.",
      data: { id },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Bulk Delete Projects
const bulkDeleteProjects = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "Project IDs array is required.",
        data: null,
        errors: ["Project IDs array is required."],
        timestamp: new Date().toISOString()
      });
    }

    await Project.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: "Projects deleted in bulk successfully.",
      data: { deletedCount: ids.length },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  bulkDeleteProjects,
};
