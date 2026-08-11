import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// Get Attendance Logs
const getAttendanceLogs = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "employee") {
      query.employee = req.user._id;
    }

    const { date, department } = req.query;

    if (date && date !== "all") {
      const todayStr = new Date().toISOString().split("T")[0];
      if (date === "today") {
        query.date = todayStr;
      } else if (date === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        query.date = yesterday.toISOString().split("T")[0];
      } else if (date === "this-week") {
        const today = new Date();
        const first = today.getDate() - today.getDay();
        const startOfWeek = new Date(today.setDate(first)).toISOString().split("T")[0];
        query.date = { $gte: startOfWeek, $lte: todayStr };
      } else if (date === "this-month") {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
        query.date = { $gte: startOfMonth, $lte: todayStr };
      }
    }

    const logs = await Attendance.find(query)
      .populate("employee", "name initials")
      .sort({ date: -1, checkIn: -1 });

    const employees = await Employee.find().populate("department");
    const employeeMap = new Map();
    employees.forEach((emp) => {
      if (emp.user) {
        employeeMap.set(emp.user.toString(), emp);
      }
    });

    const mapped = logs.map((log) => {
      if (!log.employee) return null;
      
      let departmentName = "General";
      let employeeCustomId = log.employee._id.toString().slice(-6).toUpperCase();
      const empInfo = employeeMap.get(log.employee._id.toString());
      if (empInfo) {
        if (empInfo.department) {
          departmentName = empInfo.department.departmentName;
        }
        if (empInfo.employeeId) {
          employeeCustomId = empInfo.employeeId;
        }
      }

      return {
        id: log._id,
        user_id: log.employee._id,
        employeeId: employeeCustomId,
        name: log.employee.name,
        initials: log.employee.initials,
        department: departmentName,
        date: log.date,
        check_in: log.checkIn,
        check_out: log.checkOut,
        status: log.status,
        hours_worked: log.totalHours,
      };
    });

    let filtered = mapped.filter(Boolean);

    if (department && department !== "all") {
      filtered = filtered.filter(f => f.department.toLowerCase() === department.toLowerCase());
    }

    res.json({
      success: true,
      message: "Attendance logs fetched successfully.",
      data: filtered,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Check Clock In Status
const getClockInStatus = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const log = await Attendance.findOne({
      employee: req.user._id,
      date: today,
      checkOut: null,
    });

    res.json({
      success: true,
      message: "Clock-in status checked successfully.",
      data: {
        clockedIn: !!log,
        record: log
          ? {
              id: log._id,
              user_id: log.employee,
              date: log.date,
              check_in: log.checkIn,
              check_out: log.checkOut,
              status: log.status,
              hours_worked: log.totalHours,
            }
          : null,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Clock In Operation
const clockIn = async (req, res, next) => {
  try {
    const now = new Date();
    // Prioritize client laptop local time & date
    const checkInTime = req.body.checkIn || req.body.localTime || now.toTimeString().split(" ")[0];
    const today = req.body.date || now.toISOString().split("T")[0];

    // Evaluate Late Arrival: Shift starts at 9:00 AM, 15 mins grace period (9:15 AM = 555 mins)
    const [h, m] = checkInTime.split(":").map(Number);
    const totalMinutes = (h || 0) * 60 + (m || 0);

    let status = req.body.status || "present";
    if (status === "present" || !req.body.status) {
      status = totalMinutes > 555 ? "late" : "present";
    }

    // Check if already clocked in (active open session)
    const existing = await Attendance.findOne({
      employee: req.user._id,
      checkOut: null,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You are already clocked in.",
        data: null,
        errors: ["You are already clocked in."],
        timestamp: new Date().toISOString()
      });
    }

    const log = new Attendance({
      employee: req.user._id,
      date: today,
      checkIn: checkInTime,
      status,
    });

    await log.save();

    const isLateMsg = status === "late" ? " (Marked Late - Clocked in after 9:15 AM)" : " (On Time)";

    res.status(201).json({
      success: true,
      message: `Clocked in successfully at ${checkInTime}${isLateMsg}.`,
      data: {
        id: log._id,
        user_id: log.employee,
        date: log.date,
        check_in: log.checkIn,
        check_out: log.checkOut,
        status: log.status,
        hours_worked: log.totalHours,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Clock Out Operation
const clockOut = async (req, res, next) => {
  try {
    const now = new Date();
    const checkOutTime = req.body.checkOut || req.body.localTime || now.toTimeString().split(" ")[0];

    const log = await Attendance.findOne({
      employee: req.user._id,
      checkOut: null,
    }).sort({ createdAt: -1 });

    if (!log) {
      return res.status(400).json({
        success: false,
        message: "No active clock-in session found.",
        data: null,
        errors: ["No active clock-in session found."],
        timestamp: new Date().toISOString()
      });
    }

    // Calculate hours worked
    const parseTimeToSeconds = (timeStr) => {
      if (!timeStr) return 0;
      const parts = timeStr.split(":").map(Number);
      const h = parts[0] || 0;
      const m = parts[1] || 0;
      const s = parts[2] || 0;
      return h * 3600 + m * 60 + s;
    };

    const inSecs = parseTimeToSeconds(log.checkIn);
    const outSecs = parseTimeToSeconds(checkOutTime);
    let diff = outSecs - inSecs;
    if (diff < 0) {
      diff += 24 * 3600; // handle overnight shift
    }
    const diffHours = parseFloat((diff / 3600).toFixed(2));

    log.checkOut = checkOutTime;
    log.totalHours = diffHours > 0 ? diffHours : 0.01;
    await log.save();

    res.json({
      success: true,
      message: `Clocked out successfully at ${checkOutTime}.`,
      data: {
        id: log._id,
        user_id: log.employee,
        date: log.date,
        check_in: log.checkIn,
        check_out: log.checkOut,
        status: log.status,
        hours_worked: log.totalHours,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Mark Manual Attendance (HR / Admin)
const markAttendance = async (req, res, next) => {
  try {
    const { userId, date, status, checkIn, checkOut } = req.body;
    const targetUser = userId || req.user._id;
    const recordDate = date || new Date().toISOString().split("T")[0];
    const inTime = checkIn || "09:00:00";
    const outTime = checkOut || "17:00:00";

    // Evaluate Late Arrival for manual entry: Cutoff at 9:15 AM (555 mins)
    let statusVal = status || "present";
    if (statusVal === "present" && inTime) {
      const [h, m] = inTime.split(":").map(Number);
      const totalMins = (h || 0) * 60 + (m || 0);
      if (totalMins > 555) {
        statusVal = "late";
      }
    }

    let log = await Attendance.findOne({ employee: targetUser, date: recordDate });
    if (log) {
      log.status = statusVal;
      log.checkIn = inTime;
      log.checkOut = outTime;
      log.totalHours = statusVal === 'absent' ? 0 : 8.0;
      await log.save();
    } else {
      log = new Attendance({
        employee: targetUser,
        date: recordDate,
        checkIn: inTime,
        checkOut: outTime,
        status: statusVal,
        totalHours: statusVal === 'absent' ? 0 : 8.0
      });
      await log.save();
    }

    res.status(201).json({
      success: true,
      message: `Attendance marked successfully as ${statusVal.toUpperCase()}.`,
      data: log,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getAttendanceLogs,
  getClockInStatus,
  clockIn,
  clockOut,
  markAttendance,
};

