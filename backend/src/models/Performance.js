import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewPeriod: {
      type: String,
      required: true, // e.g. "Q1 2026", "Annual 2026"
    },
    kpiScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    feedback: {
      type: String,
      required: true,
    },
    goals: {
      type: String,
      default: "",
    },
    rating: {
      type: String,
      enum: ["Outstanding", "Exceeds Expectations", "Meets Expectations", "Needs Improvement"],
      default: "Meets Expectations",
    },
  },
  { timestamps: true }
);

const Performance = mongoose.model("Performance", performanceSchema);
export default Performance;
