import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    instructor: {
      type: String,
      required: true,
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    endDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed"],
      default: "scheduled",
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Training = mongoose.model("Training", trainingSchema);
export default Training;
