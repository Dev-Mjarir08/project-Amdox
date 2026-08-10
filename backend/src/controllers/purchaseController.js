import PurchaseOrder from "../models/PurchaseOrder.js";
import { logAction } from "./auditController.js";

const getPurchaseOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { poNumber: { $regex: search, $options: "i" } },
        { vendorName: { $regex: search, $options: "i" } },
      ];
    }

    const pos = await PurchaseOrder.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Purchase orders fetched successfully.",
      data: pos,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createPurchaseOrder = async (req, res, next) => {
  try {
    const { vendorName, email, items, orderDate, expectedDate, notes } = req.body;
    if (!vendorName || !email || !items || items.length === 0 || !orderDate || !expectedDate) {
      return res.status(400).json({
        success: false,
        message: "VendorName, email, items, orderDate, and expectedDate are required.",
        data: null,
        errors: ["Required details are missing."],
        timestamp: new Date().toISOString()
      });
    }

    const count = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${(count + 1).toString().padStart(4, "0")}`;

    const po = new PurchaseOrder({
      poNumber,
      vendorName,
      email,
      items,
      orderDate,
      expectedDate,
      notes: notes || "",
    });

    await po.save();
    await logAction(req.user._id, "CREATE", "Purchases", `Created PO ${poNumber}`);

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully.",
      data: po,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const updatePOStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found.",
        data: null,
        errors: ["Purchase order not found."],
        timestamp: new Date().toISOString()
      });
    }

    po.status = status;
    await po.save();
    await logAction(req.user._id, "UPDATE", "Purchases", `Updated PO ${po.poNumber} status to ${status}`);

    res.json({
      success: true,
      message: `Purchase order status updated to ${status}.`,
      data: po,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deletePO = async (req, res, next) => {
  try {
    const { id } = req.params;
    const po = await PurchaseOrder.findByIdAndDelete(id);
    if (!po) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found.",
        data: null,
        errors: ["Purchase order not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "Purchases", `Deleted PO ${po.poNumber}`);

    res.json({
      success: true,
      message: "Purchase order deleted successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
  deletePO,
};
