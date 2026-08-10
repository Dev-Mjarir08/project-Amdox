import Asset from "../models/Asset.js";
import { logAction } from "./auditController.js";

const getAssets = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { assetName: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    const assets = await Asset.find(query)
      .populate("assignedTo", "name email initials")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Assets fetched successfully.",
      data: assets,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const createAsset = async (req, res, next) => {
  try {
    const { assetName, code, category, purchaseValue, purchaseDate, depreciationRate } = req.body;
    if (!assetName || !code || !category || !purchaseValue || !purchaseDate) {
      return res.status(400).json({
        success: false,
        message: "AssetName, code, category, purchaseValue, and purchaseDate are required.",
        data: null,
        errors: ["Required details are missing."],
        timestamp: new Date().toISOString()
      });
    }

    const existing = await Asset.findOne({ code });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An asset with this code already exists.",
        data: null,
        errors: ["Asset code must be unique."],
        timestamp: new Date().toISOString()
      });
    }

    const asset = new Asset({
      assetName,
      code,
      category,
      purchaseValue,
      purchaseDate,
      depreciationRate: depreciationRate || 10,
    });

    await asset.save();
    await logAction(req.user._id, "CREATE", "Asset", `Registered asset: ${assetName} (${code})`);

    res.status(201).json({
      success: true,
      message: "Asset registered successfully.",
      data: asset,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const assignAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo, status } = req.body;

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found.",
        data: null,
        errors: ["Asset not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (assignedTo !== undefined) {
      asset.assignedTo = assignedTo || null;
      asset.status = assignedTo ? "Assigned" : "Available";
    }
    if (status) {
      asset.status = status;
    }

    await asset.save();
    await logAction(req.user._id, "UPDATE", "Asset", `Modified assignment state of asset ${asset.assetName}`);

    res.json({
      success: true,
      message: "Asset assignment updated.",
      data: asset,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const deleteAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByIdAndDelete(id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found.",
        data: null,
        errors: ["Asset not found."],
        timestamp: new Date().toISOString()
      });
    }

    await logAction(req.user._id, "DELETE", "Asset", `Removed asset ${asset.assetName}`);

    res.json({
      success: true,
      message: "Asset removed successfully.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getAssets,
  createAsset,
  assignAsset,
  deleteAsset,
};
