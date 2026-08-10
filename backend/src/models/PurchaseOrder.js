import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vendorName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Received", "Billed", "Cancelled"],
      default: "Pending",
    },
    orderDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    expectedDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

purchaseOrderSchema.virtual("totalAmount").get(function () {
  return this.items.reduce((sum, item) => sum + item.qty * item.price, 0);
});

purchaseOrderSchema.set("toJSON", { virtuals: true });
purchaseOrderSchema.set("toObject", { virtuals: true });

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrder;
