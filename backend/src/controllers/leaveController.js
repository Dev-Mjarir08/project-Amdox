import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendLeaveApprovalEmail } from "../services/mailService.js";

// List Leaves
const getLeaves = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "employee") {
      query.employee = req.user._id;
    }

    const leaves = await Leave.find(query)
      .populate("employee", "name initials email")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    const employees = await Employee.find().populate("department");
    const employeeMap = new Map();
    employees.forEach((emp) => {
      if (emp.user) {
        employeeMap.set(emp.user.toString(), emp);
      }
    });

    const mapped = leaves.map((l) => {
      if (!l.employee) return null;

      let departmentName = "General";
      const empInfo = employeeMap.get(l.employee._id.toString());
      if (empInfo && empInfo.department) {
        departmentName = empInfo.department.departmentName;
      }

      return {
        id: l._id,
        user_id: l.employee._id,
        name: l.employee.name,
        initials: l.employee.initials,
        department: departmentName,
        type: l.leaveType,
        start_date: l.startDate,
        end_date: l.endDate,
        reason: l.reason,
        status: l.status,
        approved_by: l.approvedBy ? l.approvedBy._id : null,
        approved_by_name: l.approvedBy ? l.approvedBy.name : null,
      };
    });

    const filtered = mapped.filter(Boolean);

    res.json({
      success: true,
      message: "Leave requests fetched successfully.",
      data: filtered,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Apply Leave
const applyLeave = async (req, res, next) => {
  try {
    const { type, start_date, end_date, reason } = req.body;
    if (!type || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Leave type, start date, and end date are required.",
        data: null,
        errors: ["Leave type, start date, and end date are required."],
        timestamp: new Date().toISOString()
      });
    }

    const leave = new Leave({
      employee: req.user._id,
      leaveType: type,
      startDate: start_date,
      endDate: end_date,
      reason: reason || "",
      status: "pending",
    });

    await leave.save();

    let departmentName = "General";
    const empInfo = await Employee.findOne({ user: req.user._id }).populate("department");
    if (empInfo && empInfo.department) {
      departmentName = empInfo.department.departmentName;
    }

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully.",
      data: {
        id: leave._id,
        user_id: req.user._id,
        name: req.user.name,
        initials: req.user.initials,
        department: departmentName,
        type: leave.leaveType,
        start_date: leave.startDate,
        end_date: leave.endDate,
        reason: leave.reason,
        status: leave.status,
        approved_by: null,
        approved_by_name: null,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Approve / Reject Leave
const reviewLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // approved or rejected

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
        data: null,
        errors: ["Status must be approved or rejected."],
        timestamp: new Date().toISOString()
      });
    }

    const leave = await Leave.findById(id).populate("employee", "name email");
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
        data: null,
        errors: ["Leave request not found."],
        timestamp: new Date().toISOString()
      });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    await leave.save();

    // Create system notification for employee
    const notification = new Notification({
      user: leave.employee._id,
      title: `Leave request ${status}`,
      message: `Your leave request for ${leave.leaveType} from ${leave.startDate} to ${leave.endDate} has been ${status}.`,
    });
    await notification.save();

    // Send email alert
    if (leave.employee && leave.employee.email) {
      try {
        await sendLeaveApprovalEmail(
          leave.employee.email,
          leave.leaveType,
          leave.startDate,
          leave.endDate,
          status,
          req.user.name
        );
      } catch (mailErr) {
        console.error("Leave review email failed:", mailErr.message);
      }
    }

    let departmentName = "General";
    const empInfo = await Employee.findOne({ user: leave.employee._id }).populate("department");
    if (empInfo && empInfo.department) {
      departmentName = empInfo.department.departmentName;
    }

    res.json({
      success: true,
      message: `Leave request ${status} successfully.`,
      data: {
        id: leave._id,
        user_id: leave.employee._id,
        name: leave.employee.name,
        initials: leave.employee.initials,
        department: departmentName,
        type: leave.leaveType,
        start_date: leave.startDate,
        end_date: leave.endDate,
        reason: leave.reason,
        status: leave.status,
        approved_by: req.user._id,
        approved_by_name: req.user.name,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getLeaves,
  applyLeave,
  reviewLeave,
};
