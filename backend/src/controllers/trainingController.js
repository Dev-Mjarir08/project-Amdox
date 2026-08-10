import Training from "../models/Training.js";
import { logAction } from "./auditController.js";

const getCourses = async (req, res, next) => {
  try {
    const courses = await Training.find()
      .populate("attendees", "name email initials")
      .sort({ startDate: 1 });

    res.json({
      success: true,
      message: "Training sessions fetched successfully.",
      data: courses,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, instructor, startDate, endDate } = req.body;
    if (!title || !instructor || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Title, instructor, startDate, and endDate are required.",
        data: null,
        errors: ["Title, instructor, startDate, and endDate are required."],
        timestamp: new Date().toISOString()
      });
    }

    const course = new Training({
      title,
      description: description || "",
      instructor,
      startDate,
      endDate,
    });

    await course.save();
    await logAction(req.user._id, "CREATE", "Training", `Created training course: ${title}`);

    res.status(201).json({
      success: true,
      message: "Training course created successfully.",
      data: course,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const joinCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Training.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Training course not found.",
        data: null,
        errors: ["Training course not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (course.attendees.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You have already enrolled in this course.",
        data: null,
        errors: ["You have already enrolled in this course."],
        timestamp: new Date().toISOString()
      });
    }

    course.attendees.push(req.user._id);
    if (course.status === "scheduled" && course.attendees.length > 0) {
      course.status = "ongoing";
    }

    await course.save();
    await logAction(req.user._id, "UPDATE", "Training", `Enrolled in course ${course.title}`);

    res.json({
      success: true,
      message: "Enrolled in course successfully.",
      data: course,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Training.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Training course not found.",
        data: null,
        errors: ["Training course not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "Training", `Deleted course ${course.title}`);

    res.json({
      success: true,
      message: "Training course deleted successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getCourses,
  createCourse,
  joinCourse,
  deleteCourse,
};
