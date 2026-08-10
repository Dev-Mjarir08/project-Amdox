import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
    },
    stage: {
      type: String,
      enum: ["Lead", "Contacted", "Proposal Sent", "Negotiation", "Won", "Lost"],
      default: "Lead",
    },
    value: {
      type: Number,
      default: 0,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    lastFollowUp: {
      type: String, // YYYY-MM-DD
      default: "",
    },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
