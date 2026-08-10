import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: String,
      default: "",
    },
    gateway: {
      type: String,
      enum: ["stripe", "razorpay"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      default: "Pending",
    },
    customerName: {
      type: String,
      default: "Customer",
    },
    customerEmail: {
      type: String,
      default: "",
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    invoiceNumber: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      default: "Card", // Card, UPI, NetBanking, Wallet
    },
    paymentIntentId: {
      type: String,
      default: "",
    },
    receiptUrl: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
