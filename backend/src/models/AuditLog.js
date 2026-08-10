import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. LOGIN, LOGOUT, CREATE_EMPLOYEE, UPDATE_INVENTORY
    },
    resource: {
      type: String,
      required: true, // e.g. User, Employee, Inventory, Payroll
    },
    details: {
      type: String,
      default: "", // details or changes summary
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
