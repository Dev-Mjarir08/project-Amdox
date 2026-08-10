import Inventory from "../models/Inventory.js";

// Get all inventory
const getInventory = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, search, category, sortBy = "name", sortOrder = "asc" } = req.query;

    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const items = await Inventory.find(query);

    let mapped = items.map((i) => ({
      id: i._id,
      name: i.name,
      sku: i.sku,
      category: i.category,
      stock: i.stock,
      unit: i.unit,
      price: i.price,
      status: i.status,
    }));

    // Sorting
    mapped.sort((a, b) => {
      let valA = a[sortBy] || "";
      let valB = b[sortBy] || "";
      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = mapped.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      message: "Inventory items fetched successfully.",
      data: paginated,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Get Inventory By ID
const getInventoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const i = await Inventory.findById(id);
    if (!i) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
        data: null,
        errors: ["Inventory item not found."],
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: "Inventory item fetched successfully.",
      data: {
        id: i._id,
        name: i.name,
        sku: i.sku,
        category: i.category,
        stock: i.stock,
        unit: i.unit,
        price: i.price,
        status: i.status,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Create inventory item
const createInventoryItem = async (req, res, next) => {
  try {
    const { name, sku, category, stock, unit, price, status } = req.body;
    if (!name || !sku || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, SKU, and Category are required.",
        data: null,
        errors: ["Name, SKU, and Category are required."],
        timestamp: new Date().toISOString()
      });
    }

    const existing = await Inventory.findOne({ sku });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Item with this SKU already exists.",
        data: null,
        errors: ["Item with this SKU already exists."],
        timestamp: new Date().toISOString()
      });
    }

    let calculatedStatus = status || "in-stock";
    if (stock === 0) calculatedStatus = "out-of-stock";
    else if (stock <= 2) calculatedStatus = "low-stock";

    const item = new Inventory({
      name,
      sku,
      category,
      stock: stock || 0,
      unit: unit || "Units",
      price: price || 0,
      status: calculatedStatus,
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully.",
      data: {
        id: item._id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        stock: item.stock,
        unit: item.unit,
        price: item.price,
        status: item.status,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Update inventory item
const updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, category, stock, unit, price, status } = req.body;

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
        data: null,
        errors: ["Inventory item not found."],
        timestamp: new Date().toISOString()
      });
    }

    if (name) item.name = name;
    if (sku) {
      const taken = await Inventory.findOne({ sku, _id: { $ne: id } });
      if (taken) {
        return res.status(400).json({
          success: false,
          message: "SKU is already in use by another item.",
          data: null,
          errors: ["SKU is already in use by another item."],
          timestamp: new Date().toISOString()
        });
      }
      item.sku = sku;
    }
    if (category) item.category = category;
    if (stock !== undefined) {
      item.stock = stock;
      if (stock === 0) item.status = "out-of-stock";
      else if (stock <= 2) item.status = "low-stock";
      else item.status = "in-stock";
    }
    if (unit) item.unit = unit;
    if (price !== undefined) item.price = price;
    if (status && stock > 2) item.status = status;

    await item.save();

    res.json({
      success: true,
      message: "Inventory item updated successfully.",
      data: {
        id: item._id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        stock: item.stock,
        unit: item.unit,
        price: item.price,
        status: item.status,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Delete inventory item
const deleteInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
        data: null,
        errors: ["Item not found."],
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: "Inventory item deleted successfully.",
      data: { id },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Bulk Delete Inventory
const bulkDeleteInventory = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "Inventory IDs array is required.",
        data: null,
        errors: ["Inventory IDs array is required."],
        timestamp: new Date().toISOString()
      });
    }

    await Inventory.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: "Inventory items bulk deleted successfully.",
      data: { deletedCount: ids.length },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  bulkDeleteInventory,
};
