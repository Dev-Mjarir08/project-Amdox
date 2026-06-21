import Task from "../models/Task.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import { sendTaskAssignmentEmail  } from "../services/mailService.js";

// List Tasks
const getTasks = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "employee") {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name initials email")
      .populate("project", "title");

    const mapped = tasks.map((t) => ({
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
    }));

    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

// Create Task
const createTask = async (req, res, next) => {
  try {
    const { title, description, project_id, assigned_to, status, due_date } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Task title is required." });
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

    // Fetch and populate details
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

      // Send email alert
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
      return res.status(404).json({ error: "Task not found." });
    }

    // Role check: Employee can only update task status
    if (req.user.role === "employee") {
      if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "You can only update tasks assigned to you." });
      }
      if (status) task.status = status;
    } else {
      // Admin / Manager can edit everything
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (project_id !== undefined) task.project = project_id || null;
      if (status) task.status = status;
      if (due_date !== undefined) task.dueDate = due_date ? new Date(due_date) : null;

      // Handle new assignee
      if (assigned_to !== undefined && assigned_to !== (task.assignedTo ? task.assignedTo.toString() : "")) {
        task.assignedTo = assigned_to || null;
        if (assigned_to) {
          // Notify new assignee
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
      return res.status(404).json({ error: "Task not found." });
    }
    res.json({ message: "Task deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
