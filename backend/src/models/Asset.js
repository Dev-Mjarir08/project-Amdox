import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    assetName: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["Hardware", "Software", "Furniture", "Vehicles", "Real Estate"],
      required: true,
    },
    purchaseValue: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ["Available", "Assigned", "Under Maintenance", "Disposed"],
      default: "Available",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    maintenanceDate: {
      type: String,
      default: "",
    },
    depreciationRate: {
      type: Number, // percentage annually
      default: 10,
    },
  },
  { timestamps: true }
);

const Asset = mongoose.model("Asset", assetSchema);
export default Asset;
