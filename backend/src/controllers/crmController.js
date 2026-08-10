import Lead from "../models/Lead.js";
import { logAction } from "./auditController.js";

const getLeads = async (req, res, next) => {
  try {
    const { stage, search } = req.query;
    const query = {};

    if (stage && stage !== "all") {
      query.stage = stage;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "CRM leads fetched successfully.",
      data: leads,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, stage, value, notes, lastFollowUp } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Customer name and email are required.",
        data: null,
        errors: ["Customer name and email are required."],
        timestamp: new Date().toISOString()
      });
    }

    const lead = new Lead({
      name,
      company: company || "",
      email,
      phone: phone || "",
      stage: stage || "Lead",
      value: value || 0,
      assignedTo: req.user._id,
      notes: notes || "",
      lastFollowUp: lastFollowUp || "",
    });

    await lead.save();
    await logAction(req.user._id, "CREATE", "CRM", `Created lead for ${name} (${company})`);

    res.status(201).json({
      success: true,
      message: "Lead created successfully.",
      data: lead,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const updateLeadStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, value, notes } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
        data: null,
        errors: ["Lead not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (stage) lead.stage = stage;
    if (value !== undefined) lead.value = value;
    if (notes) lead.notes = notes;
    lead.lastFollowUp = new Date().toISOString().split("T")[0];

    await lead.save();
    await logAction(req.user._id, "UPDATE", "CRM", `Updated lead ${lead.name} status to ${stage}`);

    res.json({
      success: true,
      message: "Lead details updated successfully.",
      data: lead,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
        data: null,
        errors: ["Lead not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "CRM", `Deleted lead ${lead.name}`);

    res.json({
      success: true,
      message: "Lead deleted successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getLeads,
  createLead,
  updateLeadStage,
  deleteLead,
};
