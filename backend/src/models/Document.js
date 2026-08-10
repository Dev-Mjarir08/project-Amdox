import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Contract", "Identity", "Certificate", "Policy", "Other"],
      default: "Other",
    },
    fileUrl: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;
