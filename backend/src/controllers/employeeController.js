import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import { sendWelcomeEmail } from "../services/mailService.js";

// List Employees
const getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, search, department, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const query = {};

    // Filtering by department
    if (department && department !== "all") {
      const dept = await Department.findOne({ departmentName: new RegExp(`^${department}$`, "i") });
      if (dept) query.department = dept._id;
    }

    let employees = await Employee.find(query)
      .populate("user")
      .populate("department");

    // Map database structures to UI structure
    let mapped = employees.map((emp) => {
      if (!emp.user) return null;
      return {
        id: emp.user._id,
        employeeDbId: emp._id,
        employeeId: emp.employeeId,
        name: emp.user.name,
        email: emp.user.email,
        role: emp.user.role,
        title: emp.designation,
        department: emp.department ? emp.department.departmentName : "General",
        departmentId: emp.department ? emp.department._id : null,
        initials: emp.user.initials,
        status: emp.user.status,
        salary: emp.salary,
        join_date: emp.joiningDate ? emp.joiningDate.toISOString().split("T")[0] : "",
        phone: emp.user.phone,
        createdAt: emp.createdAt
      };
    }).filter(Boolean);

    // Apply Search filter in memory
    if (search) {
      const s = search.toLowerCase();
      mapped = mapped.filter(e => 
        e.name.toLowerCase().includes(s) || 
        e.email.toLowerCase().includes(s) || 
        e.employeeId.toLowerCase().includes(s) ||
        e.title.toLowerCase().includes(s)
      );
    }

    // Apply Status filter in memory
    if (status && status !== "all") {
      mapped = mapped.filter(e => e.status === status);
    }

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
      message: "Employees fetched successfully.",
      data: paginated,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Get Employee By ID
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const emp = await Employee.findOne({ user: id }).populate("user").populate("department");
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
        data: null,
        errors: ["Employee not found."],
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: "Employee details fetched successfully.",
      data: {
        id: emp.user._id,
        employeeDbId: emp._id,
        employeeId: emp.employeeId,
        name: emp.user.name,
        email: emp.user.email,
        role: emp.user.role,
        title: emp.designation,
        department: emp.department ? emp.department.departmentName : "General",
        departmentId: emp.department ? emp.department._id : null,
        initials: emp.user.initials,
        status: emp.user.status,
        salary: emp.salary,
        join_date: emp.joiningDate ? emp.joiningDate.toISOString().split("T")[0] : "",
        phone: emp.user.phone,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Create Employee
const createEmployee = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, department, position, salary, joinDate, role } = req.body;

    const emailVal = email ? email.toLowerCase() : "";
    if (!emailVal || !firstName) {
      return res.status(400).json({
        success: false,
        message: "First name and email are required.",
        data: null,
        errors: ["First name and email are required."],
        timestamp: new Date().toISOString()
      });
    }

    const existingUser = await User.findOne({ email: emailVal });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use.",
        data: null,
        errors: ["Email is already in use."],
        timestamp: new Date().toISOString()
      });
    }

    let deptObj = await Department.findOne({ departmentName: department });
    if (!deptObj) {
      deptObj = await Department.findOne() || new Department({ departmentName: department || "General" });
      if (deptObj.isNew) await deptObj.save();
    }

    const name = `${firstName} ${lastName || ""}`.trim();
    const tempPassword = password || `temp_${Math.floor(100000 + Math.random() * 900000)}`;

    console.log(`[INFO] Employee user created with Email: ${emailVal} and Password: ${tempPassword}`);

    const userRole = (role && ["admin", "hr", "manager", "employee"].includes(role.toLowerCase()))
      ? role.toLowerCase()
      : "employee";

    const user = new User({
      name,
      email: emailVal,
      password: tempPassword,
      role: userRole,
      phone: phone || "",
    });
    await user.save();

    const employeeId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const employee = new Employee({
      employeeId,
      user: user._id,
      department: deptObj._id,
      designation: position || "Staff Member",
      salary: salary || 0,
      joiningDate: joinDate ? new Date(joinDate) : new Date(),
    });
    await employee.save();

    try {
      await sendWelcomeEmail(emailVal, name, tempPassword);
    } catch (mailErr) {
      console.error("Welcome email sending failed:", mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Employee profile created successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: employee.designation,
        department: deptObj.departmentName,
        initials: user.initials,
        salary: employee.salary,
        join_date: employee.joiningDate.toISOString().split("T")[0],
        phone: user.phone,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Update Employee
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, title, department, salary, phone, status, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee user not found.",
        data: null,
        errors: ["Employee user not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const taken = await User.findOne({ email: email.toLowerCase() });
      if (taken) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken.",
          data: null,
          errors: ["Email is already taken."],
          timestamp: new Date().toISOString()
        });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role && (req.user.role === "admin" || req.user.role === "hr")) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (status && (req.user.role === "admin" || req.user.role === "hr")) user.status = status;
    if (password) user.password = password;
    await user.save();

    let employee = await Employee.findOne({ user: id });
    if (!employee) {
      let deptObj = await Department.findOne() || new Department({ departmentName: "General" });
      if (deptObj.isNew) await deptObj.save();
      employee = new Employee({
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        user: user._id,
        department: deptObj._id,
        designation: title || "Staff Member",
        salary: salary || 0,
      });
    }

    if (title) employee.designation = title;
    if (salary !== undefined && (req.user.role === "admin" || req.user.role === "hr")) employee.salary = salary;

    if (department) {
      let deptObj = await Department.findOne({ departmentName: department });
      if (!deptObj) {
        deptObj = new Department({ departmentName: department });
        await deptObj.save();
      }
      employee.department = deptObj._id;
    }

    await employee.save();

    res.json({
      success: true,
      message: "Employee updated successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: employee.designation,
        department: department || (employee.department ? (await Department.findById(employee.department)).departmentName : "General"),
        initials: user.initials,
        salary: employee.salary,
        join_date: employee.joiningDate.toISOString().split("T")[0],
        phone: user.phone,
        status: user.status,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Status Update
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
        errors: ["User not found."],
        timestamp: new Date().toISOString()
      });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: "User status updated successfully.",
      data: { id: user._id, status: user.status },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Delete Employee
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
        data: null,
        errors: ["You cannot delete your own account."],
        timestamp: new Date().toISOString()
      });
    }

    await Employee.findOneAndDelete({ user: id });
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Employee deleted successfully.",
      data: { id },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Bulk Delete Employees
const bulkDeleteEmployees = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "User IDs array is required.",
        data: null,
        errors: ["User IDs array is required."],
        timestamp: new Date().toISOString()
      });
    }

    const deleteIds = ids.filter(id => id !== req.user._id.toString());

    await Employee.deleteMany({ user: { $in: deleteIds } });
    await User.deleteMany({ _id: { $in: deleteIds } });

    res.json({
      success: true,
      message: "Employees deleted in bulk successfully.",
      data: { deletedCount: deleteIds.length },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateStatus,
  deleteEmployee,
  bulkDeleteEmployees,
};
