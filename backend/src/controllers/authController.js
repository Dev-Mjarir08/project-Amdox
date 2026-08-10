import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { sendPasswordResetEmail, sendOTPEmail } from "../services/mailService.js";

const JWT_SECRET = process.env.JWT_SECRET || "amdox_erp_secret_key_12345";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const ROLE_PERMISSIONS = {
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

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.amdox_refresh_token || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing.",
        data: null,
        errors: ["Refresh token missing."],
        timestamp: new Date().toISOString()
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive user.",
        data: null,
        errors: ["Invalid or inactive user."],
        timestamp: new Date().toISOString()
      });
    }

    const token = generateAccessToken(user);

    res.cookie("amdox_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          initials: user.initials,
        }
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token.",
      data: null,
      errors: [err.message],
      timestamp: new Date().toISOString()
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
        data: null,
        errors: ["Email and password are required."],
        timestamp: new Date().toISOString()
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        data: null,
        errors: ["Invalid email or password."],
        timestamp: new Date().toISOString()
      });
    }

    if (user.status === "deactivated") {
      if (user.deactivatedUntil && new Date(user.deactivatedUntil) > new Date()) {
        return res.status(403).json({
          success: false,
          isDeactivated: true,
          deactivatedUntil: user.deactivatedUntil,
          message: `Your account is deactivated until ${new Date(user.deactivatedUntil).toLocaleDateString()}. Would you like to reactivate your account?`,
          data: {
            email: user.email,
            deactivatedUntil: user.deactivatedUntil
          },
          errors: ["Account deactivated"],
          timestamp: new Date().toISOString()
        });
      } else {
        user.status = "active";
        user.deactivatedAt = null;
        user.deactivatedUntil = null;
        await user.save();
      }
    } else if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This user account is suspended.",
        data: null,
        errors: ["This user account is suspended."],
        timestamp: new Date().toISOString()
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        data: null,
        errors: ["Invalid email or password."],
        timestamp: new Date().toISOString()
      });
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save tokens as secure HTTP-only cookies
    res.cookie("amdox_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    res.cookie("amdox_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || "",
          profileImage: user.profileImage || "",
          initials: user.initials,
          title,
          department,
          permissions: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.employee,
        },
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
        data: null,
        errors: ["Name, email, and password are required."],
        timestamp: new Date().toISOString()
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
        data: null,
        errors: ["User with this email already exists."],
        timestamp: new Date().toISOString()
      });
    }

    const assignedRole = role || "admin";
    const user = new User({
      name,
      email,
      password,
      role: assignedRole,
    });

    await user.save();
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("amdox_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1 * 60 * 60 * 1000,
    });

    res.cookie("amdox_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          initials: user.initials,
          title: assignedRole === "admin" ? "ERP Administrator" : "Staff Member",
          department: "General",
          permissions: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.employee,
        },
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  res.clearCookie("amdox_token");
  res.clearCookie("amdox_refresh_token");
  res.json({
    success: true,
    message: "Logged out successfully.",
    data: null,
    errors: [],
    timestamp: new Date().toISOString()
  });
};

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
      success: true,
      message: "Current user profile fetched successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        profileImage: user.profileImage || "",
        initials: user.initials,
        title,
        department,
        join_date: joinDate || user.createdAt.toISOString().split("T")[0],
        salary,
        status: user.status,
        permissions: ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.employee,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
        data: null,
        errors: ["Email is required."],
        timestamp: new Date().toISOString()
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account with that email address exists.",
        data: null,
        errors: ["No account with that email address exists."],
        timestamp: new Date().toISOString()
      });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    await sendOTPEmail(user.email, otp, user.name);

    res.json({
      success: true,
      message: `OTP code sent successfully to ${user.email}`,
      data: { email: user.email },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP code, and new password are required.",
        data: null,
        errors: ["Email, OTP code, and new password are required."],
        timestamp: new Date().toISOString()
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
        errors: ["User not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (!user.otp || user.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code provided.",
        data: null,
        errors: ["Invalid OTP code."],
        timestamp: new Date().toISOString()
      });
    }

    if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP code has expired. Please request a new OTP code.",
        data: null,
        errors: ["OTP code expired."],
        timestamp: new Date().toISOString()
      });
    }

    user.password = password;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully. You can now sign in with your new password.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new passwords are required.",
        data: null,
        errors: ["Current and new passwords are required."],
        timestamp: new Date().toISOString()
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
        data: null,
        errors: ["Current password is incorrect."],
        timestamp: new Date().toISOString()
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password, secret } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
        data: null,
        errors: ["Name, email, and password are required."],
        timestamp: new Date().toISOString()
      });
    }

    const adminExists = await User.exists({ role: "admin" });
    if (adminExists) {
      const secretKey = process.env.ADMIN_REGISTRATION_SECRET || "super_secret_admin_key_999";
      if (secret !== secretKey) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized. Admin registration is locked.",
          data: null,
          errors: ["Unauthorized admin registration attempt."],
          timestamp: new Date().toISOString()
        });
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already in use.",
        data: null,
        errors: ["Email already in use."],
        timestamp: new Date().toISOString()
      });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: "admin",
      status: "active"
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Admin user created successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
        data: null,
        errors: ["Email is required."],
        timestamp: new Date().toISOString()
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
        data: null,
        errors: ["User not found."],
        timestamp: new Date().toISOString()
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otp, user.name);

    res.json({
      success: true,
      message: "Verification OTP code sent to your email address.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required.",
        data: null,
        errors: ["Email and OTP are required."],
        timestamp: new Date().toISOString()
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
        errors: ["User not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (!user.otp || user.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please check and try again.",
        data: null,
        errors: ["Invalid OTP."],
        timestamp: new Date().toISOString()
      });
    }

    if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP code has expired. Please request a new one.",
        data: null,
        errors: ["Expired OTP."],
        timestamp: new Date().toISOString()
      });
    }

    user.isEmailVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully!",
      data: { isEmailVerified: true },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deactivateAccount = async (req, res, next) => {
  try {
    const days = parseInt(req.body.days || 15, 10);
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
        errors: ["User not found."],
        timestamp: new Date().toISOString()
      });
    }

    const deactivatedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    user.status = "deactivated";
    user.deactivatedAt = new Date();
    user.deactivatedUntil = deactivatedUntil;
    await user.save();

    res.clearCookie("amdox_token");
    res.clearCookie("amdox_refresh_token");

    res.json({
      success: true,
      message: `Account deactivated successfully for ${days} days until ${deactivatedUntil.toLocaleDateString()}.`,
      data: { deactivatedUntil },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const reactivateAccount = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let targetUser = req.user;

    if (!targetUser && email && password) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        const isMatch = await user.comparePassword(password);
        if (isMatch) {
          targetUser = user;
        }
      }
    }

    if (!targetUser) {
      return res.status(400).json({
        success: false,
        message: "Unable to verify credentials for account reactivation.",
        data: null,
        errors: ["Invalid user or credentials."],
        timestamp: new Date().toISOString()
      });
    }

    targetUser.status = "active";
    targetUser.deactivatedAt = null;
    targetUser.deactivatedUntil = null;
    await targetUser.save();

    const token = generateAccessToken(targetUser);
    const refreshToken = generateRefreshToken(targetUser);

    res.cookie("amdox_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1 * 60 * 60 * 1000,
    });

    res.cookie("amdox_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Account reactivated successfully! Welcome back.",
      data: {
        token,
        user: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          initials: targetUser.initials,
          permissions: ROLE_PERMISSIONS[targetUser.role] || ROLE_PERMISSIONS.employee,
        }
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
        errors: ["User not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (req.body.password) {
      const isMatch = await user.comparePassword(req.body.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect password. Account deletion aborted.",
          data: null,
          errors: ["Incorrect password."],
          timestamp: new Date().toISOString()
        });
      }
    }

    await Employee.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.clearCookie("amdox_token");
    res.clearCookie("amdox_refresh_token");

    res.json({
      success: true,
      message: "Your account and associated profile data have been permanently deleted from MongoDB.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, title, profileImage, password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
        errors: ["User not found"],
        timestamp: new Date().toISOString()
      });
    }

    // Email change check: require password verification
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to update your email address.",
          data: null,
          errors: ["Password required for email change"],
          timestamp: new Date().toISOString()
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect password provided for email update.",
          data: null,
          errors: ["Incorrect password"],
          timestamp: new Date().toISOString()
        });
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use by another user.",
          data: null,
          errors: ["Email already in use"],
          timestamp: new Date().toISOString()
        });
      }

      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    let updatedTitle = title;
    let updatedDept = "General";

    if (title) {
      const emp = await Employee.findOneAndUpdate(
        { user: userId },
        { designation: title },
        { new: true }
      ).populate("department");
      if (emp) {
        updatedTitle = emp.designation;
        if (emp.department) updatedDept = emp.department.departmentName;
      }
    } else {
      const emp = await Employee.findOne({ user: userId }).populate("department");
      if (emp) {
        updatedTitle = emp.designation;
        if (emp.department) updatedDept = emp.department.departmentName;
      }
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        title: updatedTitle || (user.role === "admin" ? "ERP Administrator" : "Staff Member"),
        department: updatedDept,
        profileImage: user.profileImage || "",
        role: user.role
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded.",
        data: null,
        errors: ["No file uploaded"],
        timestamp: new Date().toISOString()
      });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
        errors: ["User not found"],
        timestamp: new Date().toISOString()
      });
    }

    // Remove previous profile image if stored locally
    if (user.profileImage && user.profileImage.startsWith("/uploads/profiles/")) {
      const oldPath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error("Failed to delete old profile image:", e);
        }
      }
    }

    const imageRelativeUrl = `/uploads/profiles/${req.file.filename}`;
    user.profileImage = imageRelativeUrl;
    await user.save();

    res.json({
      success: true,
      message: "Profile image uploaded successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        profileImage: user.profileImage,
        role: user.role
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteProfileImage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
        errors: ["User not found"],
        timestamp: new Date().toISOString()
      });
    }

    if (user.profileImage && user.profileImage.startsWith("/uploads/profiles/")) {
      const oldPath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error("Failed to delete profile image file:", e);
        }
      }
    }

    user.profileImage = "";
    await user.save();

    res.json({
      success: true,
      message: "Profile image removed successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        profileImage: "",
        role: user.role
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
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
  refresh,
  createAdminUser,
  sendOTP,
  verifyOTP,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
};
