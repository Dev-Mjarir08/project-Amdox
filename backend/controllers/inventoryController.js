import Inventory from "../models/Inventory.js";

// Get all inventory
const getInventory = async (req, res, next) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    const mapped = items.map((i) => ({
      id: i._id,
      name: i.name,
      sku: i.sku,
      category: i.category,
      stock: i.stock,
      unit: i.unit,
      price: i.price,
      status: i.status,
    }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

// Create inventory item
const createInventoryItem = async (req, res, next) => {
  try {
    const { name, sku, category, stock, unit, price, status } = req.body;
    if (!name || !sku || !category) {
      return res.status(400).json({ error: "Name, SKU, and Category are required." });
    }

    const existing = await Inventory.findOne({ sku });
    if (existing) {
      return res.status(400).json({ error: "Item with this SKU already exists." });
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
      id: item._id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      price: item.price,
      status: item.status,
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
      return res.status(404).json({ error: "Inventory item not found." });
    }

    if (name) item.name = name;
    if (sku) {
      const taken = await Inventory.findOne({ sku, _id: { $ne: id } });
      if (taken) return res.status(400).json({ error: "SKU is already in use by another item." });
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
      id: item._id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      price: item.price,
      status: item.status,
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
      return res.status(404).json({ error: "Item not found." });
    }
    res.json({ message: "Inventory item deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
