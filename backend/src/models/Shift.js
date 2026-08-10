import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shiftType: {
      type: String,
      enum: ["Day", "Night", "Rotational"],
      required: true,
    },
    startTime: {
      type: String, // HH:MM
      required: true,
    },
    endTime: {
      type: String, // HH:MM
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
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Shift = mongoose.model("Shift", shiftSchema);
export default Shift;
