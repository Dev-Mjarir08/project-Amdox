import mongoose from "mongoose";

const vendorInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
    },
    vendorName: {
      type: String,
      required: true,
    },
    poNumber: {
      type: String,
      required: false,
    },
    items: [
      {
        description: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "rejected"],
      default: "pending",
    },
    invoiceDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    dueDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

vendorInvoiceSchema.virtual("totalAmount").get(function () {
  return this.items.reduce((sum, item) => sum + item.qty * item.price, 0);
});

vendorInvoiceSchema.set("toJSON", { virtuals: true });
vendorInvoiceSchema.set("toObject", { virtuals: true });

const VendorInvoice = mongoose.model("VendorInvoice", vendorInvoiceSchema);
export default VendorInvoice;
