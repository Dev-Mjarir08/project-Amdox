import Department from "../models/Department.js";
import User from "../models/User.js";

// Get all departments
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate("head", "name email role initials");
    
    res.json({
      success: true,
      message: "Departments fetched successfully.",
      data: departments,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Create a department
const createDepartment = async (req, res, next) => {
  try {
    const { departmentName, description, head } = req.body;
    if (!departmentName) {
      return res.status(400).json({
        success: false,
        message: "Department name is required.",
        data: null,
        errors: ["Department name is required."],
        timestamp: new Date().toISOString()
      });
    }

    const existing = await Department.findOne({ departmentName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Department with this name already exists.",
        data: null,
        errors: ["Department with this name already exists."],
        timestamp: new Date().toISOString()
      });
    }

    const department = new Department({
      departmentName,
      description: description || "",
      head: head || null,
    });

    await department.save();
    
    const populated = await department.populate("head", "name email role initials");
    
    res.status(201).json({
      success: true,
      message: "Department created successfully.",
      data: populated,
      errors: [],
      timestamp: new Date().toISOString()
    });
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
      return res.status(404).json({
        success: false,
        message: "Department not found.",
        data: null,
        errors: ["Department not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (departmentName) {
      const existing = await Department.findOne({ departmentName, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Department with this name already exists.",
          data: null,
          errors: ["Department with this name already exists."],
          timestamp: new Date().toISOString()
        });
      }
      department.departmentName = departmentName;
    }

    if (description !== undefined) department.description = description;
    if (head !== undefined) department.head = head || null;

    await department.save();
    const populated = await department.populate("head", "name email role initials");
    
    res.json({
      success: true,
      message: "Department updated successfully.",
      data: populated,
      errors: [],
      timestamp: new Date().toISOString()
    });
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
      return res.status(404).json({
        success: false,
        message: "Department not found.",
        data: null,
        errors: ["Department not found."],
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: "Department deleted successfully.",
      data: { id },
      errors: [],
      timestamp: new Date().toISOString()
    });
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
