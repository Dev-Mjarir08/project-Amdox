import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// Get Attendance Logs
const getAttendanceLogs = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "employee") {
      query.employee = req.user._id;
    }

    const logs = await Attendance.find(query)
      .populate("employee", "name initials")
      .sort({ date: -1, checkIn: -1 });

    const employeeIds = logs.map(l => l.employee?._id).filter(Boolean);
    const employees = await Employee.find({ user: { $in: employeeIds } }).populate("department");
    const empMap = new Map(employees.map(e => [e.user.toString(), e]));

    const mapped = logs.map((log) => {
      if (!log.employee) return null;
      
      const empInfo = empMap.get(log.employee._id.toString());
      const departmentName = empInfo?.department?.departmentName || "General";

      return {
        id: log._id,
        user_id: log.employee._id,
        name: log.employee.name,
        initials: log.employee.initials,
        department: departmentName,
        date: log.date,
        check_in: log.checkIn,
        check_out: log.checkOut,
        status: log.status,
        hours_worked: log.totalHours,
      };
    }).filter(Boolean);

    res.json(mapped);
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
    });
  } catch (err) {
    next(err);
  }
};

// Clock In Operation
const clockIn = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const checkInTime = new Date().toTimeString().split(" ")[0]; // HH:MM:SS
    const status = req.body.status || "present";

    // Check if already clocked in today
    const existing = await Attendance.findOne({
      employee: req.user._id,
      date: today,
      checkOut: null,
    });

    if (existing) {
      return res.status(400).json({ error: "You are already clocked in." });
    }

    const log = new Attendance({
      employee: req.user._id,
      date: today,
      checkIn: checkInTime,
      status,
    });

    await log.save();

    res.status(201).json({
      id: log._id,
      user_id: log.employee,
      date: log.date,
      check_in: log.checkIn,
      check_out: log.checkOut,
      status: log.status,
      hours_worked: log.totalHours,
    });
  } catch (err) {
    next(err);
  }
};

// Clock Out Operation
const clockOut = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const checkOutTime = new Date().toTimeString().split(" ")[0]; // HH:MM:SS

    const log = await Attendance.findOne({
      employee: req.user._id,
      checkOut: null,
    }).sort({ createdAt: -1 });

    if (!log) {
      return res.status(400).json({ error: "No active clock-in session found." });
    }

    // Calculate hours worked using Date objects to handle cross-day clocking
    const checkInDate = new Date(`${log.date}T${log.checkIn}Z`);
    let checkOutDate = new Date(`${today}T${checkOutTime}Z`);

    if (checkOutDate < checkInDate) {
      checkOutDate.setDate(checkOutDate.getDate() + 1);
    }

    const diffMs = checkOutDate - checkInDate;
    const diffHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    log.checkOut = checkOutTime;
    log.totalHours = diffHours > 0 ? diffHours : 0.01;
    await log.save();

    res.json({
      id: log._id,
      user_id: log.employee,
      date: log.date,
      check_in: log.checkIn,
      check_out: log.checkOut,
      status: log.status,
      hours_worked: log.totalHours,
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
};
