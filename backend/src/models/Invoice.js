import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    items: [
      {
        description: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true, default: 0 },
      },
    ],
    taxRate: {
      type: Number, // Percentage e.g. 18 for GST
      default: 18,
    },
    discount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Paid", "Overdue", "Refunded"],
      default: "Draft",
    },
    invoiceDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    dueDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual for calculations
invoiceSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, item) => sum + item.qty * item.price, 0);
});

invoiceSchema.virtual("taxAmount").get(function () {
  const sub = this.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  return Math.round(sub * (this.taxRate / 100));
});

invoiceSchema.virtual("totalAmount").get(function () {
  const sub = this.items.reduce((sum, item) => sum + item.qty * item.price, 0) - this.discount;
  const tax = Math.round(sub * (this.taxRate / 100));
  return sub + tax;
});

invoiceSchema.set("toJSON", { virtuals: true });
invoiceSchema.set("toObject", { virtuals: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
