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

    const mapped = await Promise.all(
      logs.map(async (log) => {
        if (!log.employee) return null;
        
        let departmentName = "General";
        const empInfo = await Employee.findOne({ user: log.employee._id }).populate("department");
        if (empInfo && empInfo.department) {
          departmentName = empInfo.department.departmentName;
        }

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
      })
    );

    res.json(mapped.filter(Boolean));
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
      date: today,
      checkOut: null,
    });

    if (!log) {
      return res.status(400).json({ error: "No active clock-in session found for today." });
    }

    // Calculate hours worked
    const parseTimeToSeconds = (timeStr) => {
      const [h, m, s] = timeStr.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    };

    const inSecs = parseTimeToSeconds(log.checkIn);
    const outSecs = parseTimeToSeconds(checkOutTime);
    const diff = outSecs - inSecs;
    const diffHours = parseFloat((diff / 3600).toFixed(2));

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
