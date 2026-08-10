import Document from "../models/Document.js";
import { logAction } from "./auditController.js";

const getDocuments = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "employee") {
      query.$or = [
        { employee: req.user._id },
        { category: "Policy" },
      ];
    }

    const docs = await Document.find(query)
      .populate("uploadedBy", "name email")
      .populate("employee", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Documents fetched successfully.",
      data: docs,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createDocument = async (req, res, next) => {
  try {
    const { title, category, notes, employee } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Document title is required.",
        data: null,
        errors: ["Title is required."],
        timestamp: new Date().toISOString()
      });
    }

    // Support uploaded files via multer or save a simulated file URL
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : "/uploads/simulated_document.pdf";

    const doc = new Document({
      title,
      category: category || "Other",
      fileUrl,
      uploadedBy: req.user._id,
      employee: employee || null,
      notes: notes || "",
    });

    await doc.save();
    await logAction(req.user._id, "CREATE", "Document", `Uploaded document: ${title}`);

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: doc,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByIdAndDelete(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
        data: null,
        errors: ["Document not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "Document", `Deleted document ${doc.title}`);

    res.json({
      success: true,
      message: "Document deleted successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getDocuments,
  createDocument,
  deleteDocument,
};
