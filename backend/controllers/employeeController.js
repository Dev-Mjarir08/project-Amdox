import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import { sendWelcomeEmail  } from "../services/mailService.js";

// List Employees
const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find()
      .populate("user")
      .populate("department");

    const mapped = employees.map((emp) => {
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
      };
    }).filter(Boolean);

    // If admins do not have a separate Employee record, we should also query Users who have no Employee record (like the main Admin Nadia Wilson) and include them, or ensure Nadia Wilson has an Employee record.
    // Let's also include Admin users who might not have an Employee record to prevent them missing from directory.
    const allUsers = await User.find({ status: "active" });
    const employeeUserIds = employees.map(e => e.user ? e.user._id.toString() : "");
    
    allUsers.forEach(u => {
      if (!employeeUserIds.includes(u._id.toString())) {
        mapped.push({
          id: u._id,
          employeeId: "EMP-SYSTEM",
          name: u.name,
          email: u.email,
          role: u.role,
          title: u.role === "admin" ? "ERP Administrator" : "Staff Member",
          department: "Operations",
          initials: u.initials,
          status: u.status,
          salary: 0,
          join_date: u.createdAt.toISOString().split("T")[0],
          phone: u.phone || "",
        });
      }
    });

    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

// Create Employee
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, title, department, salary, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use." });
    }

    // Find the department. If name is passed, find department by name, else default to first department.
    let deptObj = await Department.findOne({ departmentName: department });
    if (!deptObj) {
      // Create it or find general
      deptObj = await Department.findOne() || new Department({ departmentName: department || "General" });
      if (deptObj.isNew) await deptObj.save();
    }

    // 1. Create User
    const user = new User({
      name,
      email,
      password,
      role,
      phone: phone || "",
    });
    await user.save();

    // 2. Create Employee
    const employeeId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const employee = new Employee({
      employeeId,
      user: user._id,
      department: deptObj._id,
      designation: title || "Staff Member",
      salary: salary || 0,
      joiningDate: new Date(),
    });
    await employee.save();

    // 3. Send welcome email asynchronously
    try {
      await sendWelcomeEmail(email, name, password);
    } catch (mailErr) {
      console.error("Welcome email failed to send:", mailErr.message);
    }

    res.status(201).json({
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
      return res.status(404).json({ error: "Employee not found." });
    }

    // Check if updating another employee's email to a taken email
    if (email && email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) {
        return res.status(400).json({ error: "Email is already taken." });
      }
      user.email = email;
    }

    // Update User details
    if (name) user.name = name;
    if (role && (req.user.role === "admin" || req.user.role === "hr")) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (status && (req.user.role === "admin" || req.user.role === "hr")) user.status = status;
    if (password) user.password = password; // pre-save will hash
    await user.save();

    // Find and update Employee details
    let employee = await Employee.findOne({ user: id });
    if (!employee) {
      // If user had no employee record, let's build one dynamically
      let deptObj = await Department.findOne();
      if (!deptObj) {
        deptObj = new Department({ departmentName: "General" });
        await deptObj.save();
      }
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
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    await Employee.findOneAndDelete({ user: id });
    await User.findByIdAndDelete(id);

    res.json({ message: "Employee deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
