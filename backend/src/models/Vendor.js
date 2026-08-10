import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    vendorId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    taxId: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    location: {
      type: String,
      default: "India",
    },
    paymentTerms: {
      type: String,
      enum: ["net15", "net30", "net45", "net60"],
      default: "net30",
    },
    creditLimit: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "pending"],
      default: "active",
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
