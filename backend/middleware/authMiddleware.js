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
    return res.status(403).json({ error: "Invalid or expired token." });
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

export {
  verifyToken,
  authorizeRoles,
  isAdmin,
  isHR,
  isManager,
  isEmployee,
};
