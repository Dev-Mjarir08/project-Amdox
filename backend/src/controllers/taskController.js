import Task from "../models/Task.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import { sendTaskAssignmentEmail } from "../services/mailService.js";

// List Tasks
const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, search, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    
    let query = {};
    if (req.user.role === "employee") {
      query.assignedTo = req.user._id;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name initials email")
      .populate("project", "title");

    let mapped = tasks.map((t) => ({
      id: t._id,
      title: t.title,
      description: t.description,
      project_id: t.project ? t.project._id : "",
      project_name: t.project ? t.project.title : "Workspace",
      assigned_to: t.assignedTo ? t.assignedTo._id : "",
      assignee_name: t.assignedTo ? t.assignedTo.name : "Unassigned",
      assignee_initials: t.assignedTo ? t.assignedTo.initials : "?",
      status: t.status,
      due_date: t.dueDate ? t.dueDate.toISOString().split("T")[0] : "",
      createdAt: t.createdAt
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
      message: "Tasks fetched successfully.",
      data: paginated,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Get Task By ID
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const t = await Task.findById(id)
      .populate("assignedTo", "name initials email")
      .populate("project", "title");

    if (!t) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
        data: null,
        errors: ["Task not found."],
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: "Task details fetched successfully.",
      data: {
        id: t._id,
        title: t.title,
        description: t.description,
        project_id: t.project ? t.project._id : "",
        project_name: t.project ? t.project.title : "Workspace",
        assigned_to: t.assignedTo ? t.assignedTo._id : "",
        assignee_name: t.assignedTo ? t.assignedTo.name : "Unassigned",
        assignee_initials: t.assignedTo ? t.assignedTo.initials : "?",
        status: t.status,
        due_date: t.dueDate ? t.dueDate.toISOString().split("T")[0] : "",
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Create Task
const createTask = async (req, res, next) => {
  try {
    const { title, description, project_id, assigned_to, status, due_date } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required.",
        data: null,
        errors: ["Task title is required."],
        timestamp: new Date().toISOString()
      });
    }

    const task = new Task({
      title,
      description: description || "",
      project: project_id || null,
      assignedTo: assigned_to || null,
      assignedBy: req.user._id,
      status: status || "pending",
      dueDate: due_date ? new Date(due_date) : null,
    });

    await task.save();

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name initials email")
      .populate("project", "title");

    // Create system notification for assignee
    if (assigned_to) {
      const notification = new Notification({
        user: assigned_to,
        title: "New Task Assigned",
        message: `You have been assigned task: "${title}". Due date: ${due_date || "No limit"}.`,
      });
      await notification.save();

      if (populated.assignedTo && populated.assignedTo.email) {
        try {
          await sendTaskAssignmentEmail(
            populated.assignedTo.email,
            title,
            due_date || "No Limit",
            req.user.name
          );
        } catch (mailErr) {
          console.error("Task assignment email failed:", mailErr.message);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: {
        id: populated._id,
        title: populated.title,
        description: populated.description,
        project_id: populated.project ? populated.project._id : "",
        project_name: populated.project ? populated.project.title : "Workspace",
        assigned_to: populated.assignedTo ? populated.assignedTo._id : "",
        assignee_name: populated.assignedTo ? populated.assignedTo.name : "Unassigned",
        assignee_initials: populated.assignedTo ? populated.assignedTo.initials : "?",
        status: populated.status,
        due_date: populated.dueDate ? populated.dueDate.toISOString().split("T")[0] : "",
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Update Task
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, project_id, assigned_to, status, due_date } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
        data: null,
        errors: ["Task not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (req.user.role === "employee") {
      if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update tasks assigned to you.",
          data: null,
          errors: ["You can only update tasks assigned to you."],
          timestamp: new Date().toISOString()
        });
      }
      if (status) task.status = status;
    } else {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (project_id !== undefined) task.project = project_id || null;
      if (status) task.status = status;
      if (due_date !== undefined) task.dueDate = due_date ? new Date(due_date) : null;

      if (assigned_to !== undefined && assigned_to !== (task.assignedTo ? task.assignedTo.toString() : "")) {
        task.assignedTo = assigned_to || null;
        if (assigned_to) {
          const notification = new Notification({
            user: assigned_to,
            title: "Task Assigned",
            message: `You have been assigned task: "${task.title}".`,
          });
          await notification.save();
        }
      }
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name initials email")
      .populate("project", "title");

    res.json({
      success: true,
      message: "Task updated successfully.",
      data: {
        id: populated._id,
        title: populated.title,
        description: populated.description,
        project_id: populated.project ? populated.project._id : "",
        project_name: populated.project ? populated.project.title : "Workspace",
        assigned_to: populated.assignedTo ? populated.assignedTo._id : "",
        assignee_name: populated.assignedTo ? populated.assignedTo.name : "Unassigned",
        assignee_initials: populated.assignedTo ? populated.assignedTo.initials : "?",
        status: populated.status,
        due_date: populated.dueDate ? populated.dueDate.toISOString().split("T")[0] : "",
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Delete Task
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
        data: null,
        errors: ["Task not found."],
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: "Task deleted successfully.",
      data: { id },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Bulk Delete Tasks
const bulkDeleteTasks = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "Task IDs array is required.",
        data: null,
        errors: ["Task IDs array is required."],
        timestamp: new Date().toISOString()
      });
    }

    await Task.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: "Tasks deleted in bulk successfully.",
      data: { deletedCount: ids.length },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
};
