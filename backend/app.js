import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Routes
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import employeeRoutes from "./src/routes/employeeRoutes.js";
import departmentRoutes from "./src/routes/departmentRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import leaveRoutes from "./src/routes/leaveRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import payrollRoutes from "./src/routes/payrollRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import auditRoutes from "./src/routes/auditRoutes.js";
import recruitmentRoutes from "./src/routes/recruitmentRoutes.js";
import performanceRoutes from "./src/routes/performanceRoutes.js";
import trainingRoutes from "./src/routes/trainingRoutes.js";
import shiftRoutes from "./src/routes/shiftRoutes.js";
import holidayRoutes from "./src/routes/holidayRoutes.js";
import crmRoutes from "./src/routes/crmRoutes.js";
import salesRoutes from "./src/routes/salesRoutes.js";
import purchaseRoutes from "./src/routes/purchaseRoutes.js";
import vendorRoutes from "./src/routes/vendorRoutes.js";
import assetRoutes from "./src/routes/assetRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import financeRoutes from "./src/routes/financeRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";

// Error Middleware & Rate Limiter
import errorHandler from "./src/middlewares/errorMiddleware.js";
import { apiLimiter } from "./src/middlewares/rateLimiter.js";

const app = express();

// Trust proxy for rate limiting (essential in cloud environments like Vercel/Render)
app.set("trust proxy", 1);

// Standard Enterprise Middlewares & Bulletproof CORS
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(morgan("dev"));

// Serve static uploaded assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply rate limiting to authentication endpoints
app.use("/api/auth", apiLimiter);
app.use("/auth", apiLimiter);

// Mount API Routes (Supporting both /api/* and /* for absolute compatibility)
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);

app.use("/api/employees", employeeRoutes);
app.use("/api/hr/employees", employeeRoutes);
app.use("/employees", employeeRoutes);
app.use("/hr/employees", employeeRoutes);

app.use("/api/departments", departmentRoutes);
app.use("/departments", departmentRoutes);

app.use("/api/projects", projectRoutes);
app.use("/projects", projectRoutes);

app.use("/api/tasks", taskRoutes);
app.use("/tasks", taskRoutes);

app.use("/api/attendance", attendanceRoutes);
app.use("/api/hr/attendance", attendanceRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/hr/attendance", attendanceRoutes);

app.use("/api/leaves", leaveRoutes);
app.use("/api/leave-requests", leaveRoutes);
app.use("/api/hr/leave-requests", leaveRoutes);
app.use("/leaves", leaveRoutes);
app.use("/leave-requests", leaveRoutes);
app.use("/hr/leave-requests", leaveRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/notifications", notificationRoutes);

app.use("/api/inventory", inventoryRoutes);
app.use("/api/supply-chain/inventory", inventoryRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/supply-chain/inventory", inventoryRoutes);

app.use("/api/payroll", payrollRoutes);
app.use("/payroll", payrollRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/dashboard", dashboardRoutes);

app.use("/api/audit", auditRoutes);
app.use("/audit", auditRoutes);

app.use("/api/recruitment", recruitmentRoutes);
app.use("/recruitment", recruitmentRoutes);

app.use("/api/performance", performanceRoutes);
app.use("/performance", performanceRoutes);

app.use("/api/training", trainingRoutes);
app.use("/training", trainingRoutes);

app.use("/api/shifts", shiftRoutes);
app.use("/shifts", shiftRoutes);

app.use("/api/holidays", holidayRoutes);
app.use("/holidays", holidayRoutes);

app.use("/api/crm", crmRoutes);
app.use("/crm", crmRoutes);

app.use("/api/sales", salesRoutes);
app.use("/api/finance/ar/invoices", salesRoutes);
app.use("/sales", salesRoutes);
app.use("/finance/ar/invoices", salesRoutes);

app.use("/api/purchases", purchaseRoutes);
app.use("/purchases", purchaseRoutes);

app.use("/api/vendors", vendorRoutes);
app.use("/api/supply-chain/vendors", vendorRoutes);
app.use("/vendors", vendorRoutes);
app.use("/supply-chain/vendors", vendorRoutes);

app.use("/api/assets", assetRoutes);
app.use("/assets", assetRoutes);

app.use("/api/documents", documentRoutes);
app.use("/documents", documentRoutes);

app.use("/api/finance", financeRoutes);
app.use("/finance", financeRoutes);

app.use("/api/ai", aiRoutes);
app.use("/ai", aiRoutes);

app.use("/api/payment", paymentRoutes);
app.use("/payment", paymentRoutes);

// Root path diagnostic check
app.get("/health", (req, res) => {
  res.json({
    status: "green",
    message: "AMDOX ERP API is fully operational",
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
