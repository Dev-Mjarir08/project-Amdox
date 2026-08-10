import Holiday from "../models/Holiday.js";
import { logAction } from "./auditController.js";

const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json({
      success: true,
      message: "Holidays fetched successfully.",
      data: holidays,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createHoliday = async (req, res, next) => {
  try {
    const { name, date, type, description } = req.body;
    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: "Holiday name and date are required.",
        data: null,
        errors: ["Holiday name and date are required."],
        timestamp: new Date().toISOString()
      });
    }

    const existing = await Holiday.findOne({ date });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A holiday already exists on this date.",
        data: null,
        errors: ["A holiday already exists on this date."],
        timestamp: new Date().toISOString()
      });
    }

    const holiday = new Holiday({
      name,
      date,
      type: type || "Company",
      description: description || "",
    });

    await holiday.save();
    await logAction(req.user._id, "CREATE", "Holiday", `Created holiday ${name} on ${date}`);

    res.status(201).json({
      success: true,
      message: "Holiday created successfully.",
      data: holiday,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findByIdAndDelete(id);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found.",
        data: null,
        errors: ["Holiday not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "Holiday", `Deleted holiday ${holiday.name}`);

    res.json({
      success: true,
      message: "Holiday deleted successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getHolidays,
  createHoliday,
  deleteHoliday,
};
