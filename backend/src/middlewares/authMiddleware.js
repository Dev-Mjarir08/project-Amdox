import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "amdox_erp_secret_key_12345";

// Authentication Middleware
const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    // Check authorization header
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Fallback to cookies
    if (!token && req.cookies && req.cookies.amdox_token) {
      token = req.cookies.amdox_token;
    }

    if (!token) {
      return res.status(401).json({ error: "Access denied. Token missing." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find active user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Access denied. User not found." });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "Access denied. This user account is suspended." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Role Middlewares
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. Unauthorized role permissions." });
    }
    next();
  };
};

const isAdmin = authorizeRoles("admin");
const isHR = authorizeRoles("admin", "hr");
const isManager = authorizeRoles("admin", "manager");
const isEmployee = authorizeRoles("admin", "hr", "manager", "employee");

const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Access denied. Authentication required." });
    }
    const role = req.user.role || "employee";
    const ROLE_PERMISSIONS = {
      admin: [
        "Employee.Create", "Employee.Edit", "Employee.Delete", "Employee.View",
        "Payroll.View", "Payroll.Edit", "Payroll.Delete",
        "Attendance.Approve", "Attendance.View", "Attendance.Edit",
        "Leave.Approve", "Leave.View", "Leave.Edit",
        "Reports.Export", "Finance.View", "Finance.Edit",
        "Inventory.Manage", "Inventory.View", "CRM.Manage", "CRM.View"
      ],
      hr: [
        "Employee.Create", "Employee.Edit", "Employee.View",
        "Payroll.View", "Payroll.Edit",
        "Attendance.View", "Attendance.Edit",
        "Leave.View", "Leave.Approve",
        "Reports.Export", "CRM.View"
      ],
      manager: [
        "Employee.View",
        "Attendance.View", "Attendance.Approve",
        "Leave.View", "Leave.Approve",
        "Reports.Export", "CRM.Manage", "CRM.View"
      ],
      employee: [
        "Employee.View",
        "Attendance.View",
        "Leave.View",
        "CRM.View"
      ]
    };
    const permissions = ROLE_PERMISSIONS[role] || [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({ error: `Access denied. Requires permission: ${permission}` });
    }
    next();
  };
};

export {
  verifyToken,
  authorizeRoles,
  isAdmin,
  isHR,
  isManager,
  isEmployee,
  hasPermission,
};
