import Candidate from "../models/Candidate.js";
import { logAction } from "./auditController.js";

const getCandidates = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    const candidates = await Candidate.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Candidates fetched successfully.",
      data: candidates,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, position, notes } = req.body;
    if (!name || !email || !position) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and position are required.",
        data: null,
        errors: ["Name, email, and position are required."],
        timestamp: new Date().toISOString()
      });
    }

    const candidate = new Candidate({
      name,
      email,
      phone: phone || "",
      position,
      notes: notes || "",
    });

    await candidate.save();
    await logAction(req.user._id, "CREATE", "Candidate", `Added candidate ${name} for ${position}`);

    res.status(201).json({
      success: true,
      message: "Candidate registered successfully.",
      data: candidate,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const updateCandidateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found.",
        data: null,
        errors: ["Candidate not found."],
        timestamp: new Date().toISOString()
      });
    }

    candidate.status = status;
    await candidate.save();
    await logAction(req.user._id, "UPDATE", "Candidate", `Updated status of candidate ${candidate.name} to ${status}`);

    res.json({
      success: true,
      message: `Candidate status updated to ${status}.`,
      data: candidate,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const scheduleInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { interviewDate, interviewTime, notes } = req.body;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found.",
        data: null,
        errors: ["Candidate not found."],
        timestamp: new Date().toISOString()
      });
    }

    candidate.interviewDate = interviewDate;
    candidate.interviewTime = interviewTime;
    candidate.status = "interviewing";
    if (notes) candidate.notes = notes;

    await candidate.save();
    await logAction(req.user._id, "UPDATE", "Candidate", `Scheduled interview for candidate ${candidate.name} on ${interviewDate}`);

    res.json({
      success: true,
      message: "Interview scheduled successfully.",
      data: candidate,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByIdAndDelete(id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found.",
        data: null,
        errors: ["Candidate not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "Candidate", `Deleted candidate ${candidate.name}`);

    res.json({
      success: true,
      message: "Candidate deleted successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getCandidates,
  createCandidate,
  updateCandidateStatus,
  scheduleInterview,
  deleteCandidate,
};
