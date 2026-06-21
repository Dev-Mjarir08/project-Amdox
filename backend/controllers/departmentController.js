import Department from "../models/Department.js";
import User from "../models/User.js";

// Get all departments
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate("head", "name email role initials");
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

// Create a department
const createDepartment = async (req, res, next) => {
  try {
    const { departmentName, description, head } = req.body;
    if (!departmentName) {
      return res.status(400).json({ error: "Department name is required." });
    }

    const existing = await Department.findOne({ departmentName });
    if (existing) {
      return res.status(400).json({ error: "Department with this name already exists." });
    }

    const department = new Department({
      departmentName,
      description: description || "",
      head: head || null,
    });

    await department.save();
    
    const populated = await department.populate("head", "name email role initials");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// Update department
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentName, description, head } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found." });
    }

    if (departmentName) {
      const existing = await Department.findOne({ departmentName, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ error: "Department with this name already exists." });
      }
      department.departmentName = departmentName;
    }

    if (description !== undefined) department.description = description;
    if (head !== undefined) department.head = head || null;

    await department.save();
    const populated = await department.populate("head", "name email role initials");
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// Delete department
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found." });
    }
    res.json({ message: "Department deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
