import Vendor from "../models/Vendor.js";
import { logAction } from "./auditController.js";

// List Vendors
const getVendors = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { vendorId: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const vendors = await Vendor.find(query).sort({ createdAt: -1 });

    const mapped = vendors.map(v => ({
      id: v._id,
      name: v.name,
      code: v.vendorId,
      category: v.category || "General",
      email: v.email,
      phone: v.phone,
      location: v.location || "India",
      totalOrders: v.totalOrders || 0,
      totalSpend: v.totalSpend || 0,
      status: v.status,
      contactPerson: v.contactPerson,
      address: v.address,
      taxId: v.taxId,
      paymentTerms: v.paymentTerms,
      creditLimit: v.creditLimit,
    }));

    res.json({
      success: true,
      message: "Vendors fetched successfully.",
      data: mapped,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Create Vendor
const createVendor = async (req, res, next) => {
  try {
    const { name, contactPerson, email, phone, address, taxId, paymentTerms, creditLimit, category, location } = req.body;

    if (!name || !contactPerson || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, contact person, email, phone, and address are required.",
        data: null,
        errors: ["Required fields missing"],
        timestamp: new Date().toISOString()
      });
    }

    const count = await Vendor.countDocuments();
    const vendorId = `VND-${(count + 1).toString().padStart(4, "0")}`;

    const vendor = new Vendor({
      vendorId,
      name,
      contactPerson,
      email,
      phone,
      address,
      taxId: taxId || "",
      paymentTerms: paymentTerms || "net30",
      creditLimit: creditLimit || 0,
      category: category || "General",
      location: location || "India",
      status: "active",
    });

    await vendor.save();
    await logAction(req.user._id, "CREATE", "Supply Chain", `Created vendor ${name}`);

    res.status(201).json({
      success: true,
      message: "Vendor created successfully.",
      data: {
        id: vendor._id,
        name: vendor.name,
        code: vendor.vendorId,
        category: vendor.category,
        email: vendor.email,
        phone: vendor.phone,
        location: vendor.location,
        totalOrders: vendor.totalOrders,
        totalSpend: vendor.totalSpend,
        status: vendor.status,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Update Vendor
const updateVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const vendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
        data: null,
        errors: ["Vendor not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "UPDATE", "Supply Chain", `Updated vendor ${vendor.name}`);

    res.json({
      success: true,
      message: "Vendor updated successfully.",
      data: vendor,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Delete Vendor
const deleteVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
        data: null,
        errors: ["Vendor not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "Supply Chain", `Deleted vendor ${vendor.name}`);

    res.json({
      success: true,
      message: "Vendor deleted successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
};
