import Performance from "../models/Performance.js";
import { logAction } from "./auditController.js";

const getReviews = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "employee") {
      query.employee = req.user._id;
    }

    const reviews = await Performance.find(query)
      .populate("employee", "name email initials")
      .populate("evaluator", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Performance reviews fetched successfully.",
      data: reviews,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { employee, reviewPeriod, kpiScore, feedback, goals, rating } = req.body;
    if (!employee || !reviewPeriod || !kpiScore || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Employee, reviewPeriod, kpiScore, and feedback are required.",
        data: null,
        errors: ["Employee, reviewPeriod, kpiScore, and feedback are required."],
        timestamp: new Date().toISOString()
      });
    }

    const review = new Performance({
      employee,
      evaluator: req.user._id,
      reviewPeriod,
      kpiScore,
      feedback,
      goals: goals || "",
      rating: rating || "Meets Expectations",
    });

    await review.save();
    await logAction(req.user._id, "CREATE", "Performance", `Created performance review for user ${employee}`);

    res.status(201).json({
      success: true,
      message: "Performance review submitted successfully.",
      data: review,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Performance.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Performance review not found.",
        data: null,
        errors: ["Performance review not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "Performance", `Deleted review ${id}`);

    res.json({
      success: true,
      message: "Performance review deleted successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getReviews,
  createReview,
  deleteReview,
};
