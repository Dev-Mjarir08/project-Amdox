import AuditLog from "../models/AuditLog.js";

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { resource: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const logs = await AuditLog.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      message: "Audit logs fetched successfully.",
      data: {
        logs,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export const logAction = async (userId, action, resource, details, ipAddress = "") => {
  try {
    const log = new AuditLog({
      user: userId,
      action,
      resource,
      details,
      ipAddress,
    });
    await log.save();
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
};

export {
  getAuditLogs,
};
