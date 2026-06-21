import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { sendPasswordResetEmail  } from "../services/mailService.js";

const JWT_SECRET = process.env.JWT_SECRET || "amdox_erp_secret_key_12345";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Generate JWT token helper
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Login Controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "This user account is suspended." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user);

    // Save token as secure HTTP-only cookie
    res.cookie("amdox_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Populate department details if employee
    let department = "General";
    let title = user.role === "admin" ? "ERP Administrator" : "Staff Member";
    
    const employeeData = await Employee.findOne({ user: user._id }).populate("department");
    if (employeeData) {
      title = employeeData.designation;
      if (employeeData.department) {
        department = employeeData.department.departmentName;
      }
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
        title,
        department,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Register Controller (Workspace / Admin setup)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const assignedRole = role || "admin";
    const user = new User({
      name,
      email,
      password, // will be hashed automatically by pre-save hook
      role: assignedRole,
    });

    await user.save();
    const token = generateToken(user);

    res.cookie("amdox_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
        title: assignedRole === "admin" ? "ERP Administrator" : "Staff Member",
        department: "General",
      },
    });
  } catch (err) {
    next(err);
  }
};

// Logout Controller
const logout = async (req, res, next) => {
  res.clearCookie("amdox_token");
  res.json({ message: "Logged out successfully" });
};

// Get Current Profile (me)
const me = async (req, res, next) => {
  try {
    const user = req.user;
    
    let department = "General";
    let title = user.role === "admin" ? "ERP Administrator" : "Staff Member";
    let salary = 0;
    let joinDate = "";
    
    const employeeData = await Employee.findOne({ user: user._id }).populate("department");
    if (employeeData) {
      title = employeeData.designation;
      salary = employeeData.salary;
      joinDate = employeeData.joiningDate.toISOString().split("T")[0];
      if (employeeData.department) {
        department = employeeData.department.departmentName;
      }
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      initials: user.initials,
      title,
      department,
      join_date: joinDate || user.createdAt.toISOString().split("T")[0],
      salary,
      status: user.status,
    });
  } catch (err) {
    next(err);
  }
};

// Forgot Password Controller
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak exists status in production, but let's return error here for clean flow
      return res.status(404).json({ error: "No account with that email address exists." });
    }

    // Create a 1-hour reset token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    const resetUrl = `${CLIENT_URL}/reset-password/${token}`;

    await sendPasswordResetEmail(user.email, resetUrl);
    res.json({ message: "Password reset link sent to your email address." });
  } catch (err) {
    next(err);
  }
};

// Reset Password Controller
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ error: "Invalid token or user not found." });
    }

    user.password = password; // will trigger pre-save hashing
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Token has expired. Please request another one." });
    }
    next(err);
  }
};

// Change Password Controller
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required." });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    user.password = newPassword; // triggers hashing
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
};

export {
  login,
  register,
  logout,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
};
