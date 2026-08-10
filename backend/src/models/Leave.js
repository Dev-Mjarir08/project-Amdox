import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Annual", "Sick", "Casual", "Earned", "Maternity", "Paternity", "annual", "sick", "casual", "earned", "maternity", "paternity"],
      required: true,
    },
    reason: {
      type: String,
      default: "Personal leave request",
    },
    startDate: {
      type: String, // format YYYY-MM-DD
      required: true,
    },
    endDate: {
      type: String, // format YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
