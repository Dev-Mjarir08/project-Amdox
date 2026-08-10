import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["Company", "Regional", "National"],
      default: "Company",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Holiday = mongoose.model("Holiday", holidaySchema);
export default Holiday;
