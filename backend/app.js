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

// Standard Enterprise Middlewares
// Universal Dynamic CORS & Preflight OPTIONS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, Access-Control-Allow-Origin");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "Cookie"],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(morgan("dev"));

// Serve static uploaded assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply rate limiting to authentication endpoints
app.use("/api/auth", apiLimiter);

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Support both /api/employees and /api/hr/employees for absolute alignment with frontend page fetches
app.use("/api/employees", employeeRoutes);
app.use("/api/hr/employees", employeeRoutes);

app.use("/api/departments", departmentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/hr/attendance", attendanceRoutes);

// Support both /api/leaves and /api/leave-requests
app.use("/api/leaves", leaveRoutes);
app.use("/api/leave-requests", leaveRoutes);
app.use("/api/hr/leave-requests", leaveRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/supply-chain/inventory", inventoryRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/finance/ar/invoices", salesRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/supply-chain/vendors", vendorRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);

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
