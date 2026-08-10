import Shift from "../models/Shift.js";
import { logAction } from "./auditController.js";

const getShifts = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "employee") {
      query.employee = req.user._id;
    }

    const shifts = await Shift.find(query)
      .populate("employee", "name email initials")
      .sort({ startDate: -1 });

    res.json({
      success: true,
      message: "Shifts fetched successfully.",
      data: shifts,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createShift = async (req, res, next) => {
  try {
    const { employee, shiftType, startTime, endTime, startDate, endDate, notes } = req.body;
    if (!employee || !shiftType || !startTime || !endTime || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "All shift details (employee, shiftType, startTime, endTime, startDate, endDate) are required.",
        data: null,
        errors: ["All shift details are required."],
        timestamp: new Date().toISOString()
      });
    }

    const shift = new Shift({
      employee,
      shiftType,
      startTime,
      endTime,
      startDate,
      endDate,
      notes: notes || "",
    });

    await shift.save();
    await logAction(req.user._id, "CREATE", "Shift", `Assigned ${shiftType} shift to user ${employee}`);

    res.status(201).json({
      success: true,
      message: "Shift assigned successfully.",
      data: shift,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findByIdAndDelete(id);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift assignment not found.",
        data: null,
        errors: ["Shift assignment not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "Shift", `Removed shift assignment ${id}`);

    res.json({
      success: true,
      message: "Shift assignment removed successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getShifts,
  createShift,
  deleteShift,
};
