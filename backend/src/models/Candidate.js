import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    position: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "interviewing", "offered", "hired", "rejected"],
      default: "applied",
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    interviewDate: {
      type: String, // YYYY-MM-DD
      default: "",
    },
    interviewTime: {
      type: String, // HH:MM
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);
export default Candidate;
