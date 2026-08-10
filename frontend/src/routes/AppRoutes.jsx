import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ModulePlaceholder from "../components/common/ModulePlaceholder.jsx";
import PrivateRoute from "../components/common/PrivateRoute.jsx";
import useAuthStore from "../stores/useAuthStore.js";

const AdminLayout = lazy(() => import("../layouts/AdminLayout.jsx"));
const EmployeeLayout = lazy(() => import("../layouts/EmployeeLayout.jsx"));
const HRLayout = lazy(() => import("../layouts/HRLayout.jsx"));
const ManagerLayout = lazy(() => import("../layouts/ManagerLayout.jsx"));
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const Register = lazy(() => import("../pages/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard.jsx"));
const EmployeeDashboard = lazy(() => import("../pages/employee/Dashboard.jsx"));
const HRDashboard = lazy(() => import("../pages/hr/Dashboard.jsx"));
const ManagerDashboard = lazy(() => import("../pages/manager/Dashboard.jsx"));

// Finance Module
const GeneralLedger = lazy(() => import("../pages/admin/GeneralLedger.jsx"));
const AccountsPayable = lazy(() => import("../pages/admin/AccountsPayable.jsx"));
const AccountsReceivable = lazy(() => import("../pages/admin/AccountsReceivable.jsx"));
const FinancialReports = lazy(() => import("../pages/admin/FinancialReports.jsx"));

// HR Module
const Employees = lazy(() => import("../pages/admin/Employees.jsx"));
const Attendance = lazy(() => import("../pages/admin/Attendance.jsx"));
const LeaveManagement = lazy(() => import("../pages/admin/LeaveManagement.jsx"));
const Payroll = lazy(() => import("../pages/admin/Payroll.jsx"));

// Supply Chain Module
const PurchaseOrders = lazy(() => import("../pages/admin/PurchaseOrders.jsx"));
const Vendors = lazy(() => import("../pages/admin/Vendors.jsx"));
const Inventory = lazy(() => import("../pages/admin/Inventory.jsx"));

// Project Management Module
const Projects = lazy(() => import("../pages/admin/Projects.jsx"));
const Tasks = lazy(() => import("../pages/admin/Tasks.jsx"));

// Settings
const Settings = lazy(() => import("../pages/admin/Settings.jsx"));

// New ERP Module Pages
const Recruitment = lazy(() => import("../pages/admin/Recruitment.jsx"));
const Performance = lazy(() => import("../pages/admin/Performance.jsx"));
const Training = lazy(() => import("../pages/admin/Training.jsx"));
const Shifts = lazy(() => import("../pages/admin/Shifts.jsx"));
const Holidays = lazy(() => import("../pages/admin/Holidays.jsx"));
const CRM = lazy(() => import("../pages/admin/CRM.jsx"));
const Sales = lazy(() => import("../pages/admin/Sales.jsx"));
const AssetManagement = lazy(() => import("../pages/admin/AssetManagement.jsx"));
const Documents = lazy(() => import("../pages/admin/Documents.jsx"));
const AuditLogs = lazy(() => import("../pages/admin/AuditLogs.jsx"));
const AdminPanel = lazy(() => import("../pages/admin/AdminPanel.jsx"));
const AIForecasting = lazy(() => import("../pages/admin/AIForecasting.jsx"));

const adminModules = [
  ["general-ledger", "General Ledger", GeneralLedger],
  ["accounts-payable", "Accounts Payable", AccountsPayable],
  ["accounts-receivable", "Accounts Receivable", AccountsReceivable],
  ["financial-reports", "Financial Reports", FinancialReports],
  ["employees", "Employees", Employees],
  ["attendance", "Attendance", Attendance],
  ["leave-management", "Leave Management", LeaveManagement],
  ["payroll", "Payroll", Payroll],
  ["purchase-orders", "Purchase Orders", PurchaseOrders],
  ["vendors", "Vendors", Vendors],
  ["inventory", "Inventory", Inventory],
  ["projects", "Projects", Projects],
  ["tasks", "Tasks", Tasks],
  ["recruitment", "Recruitment", Recruitment],
  ["performance", "Performance", Performance],
  ["training", "Training", Training],
  ["shifts", "Shifts", Shifts],
  ["holidays", "Holidays", Holidays],
  ["crm", "CRM", CRM],
  ["sales", "Sales", Sales],
  ["assets", "Assets", AssetManagement],
  ["documents", "Documents", Documents],
  ["audit-logs", "Audit Logs", AuditLogs],
  ["admin-panel", "Admin Panel", AdminPanel],
  ["ai-forecasting", "AI Forecasting", AIForecasting],
  ["settings", "Settings", Settings],
];

const hrModules = [
  ["employees", "Employees", Employees],
  ["attendance", "Attendance", Attendance],
  ["leave-requests", "Leave Requests", LeaveManagement],
  ["payroll", "Payroll", Payroll],
  ["recruitment", "Recruitment", Recruitment],
  ["performance", "Performance", Performance],
  ["training", "Training", Training],
  ["shifts", "Shifts", Shifts],
  ["holidays", "Holidays", Holidays],
  ["documents", "Documents", Documents],
  ["ai-forecasting", "AI Forecasting", AIForecasting],
  ["settings", "Settings", Settings],
];

const managerModules = [
  ["projects", "Projects", Projects],
  ["tasks", "Tasks", Tasks],
  ["team-members", "Team Members", Employees],
  ["performance", "Performance", Performance],
  ["shifts", "Shifts", Shifts],
  ["ai-forecasting", "AI Forecasting", AIForecasting],
  ["settings", "Settings", Settings],
];

const employeeModules = [
  ["my-tasks", "My Tasks", Tasks],
  ["attendance", "Attendance", Attendance],
  ["apply-leave", "Apply Leave", LeaveManagement],
  ["profile", "Profile", Employees],
  ["shifts", "Shifts", Shifts],
  ["training", "Training", Training],
  ["performance", "Performance", Performance],
  ["documents", "Documents", Documents],
  ["ai-forecasting", "AI Forecasting", AIForecasting],
  ["settings", "Settings", Settings],
];

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 dark:bg-slate-950">
      <div className="rounded-xl border border-white/70 bg-white/85 px-6 py-5 text-sm font-semibold text-slate-600 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
        Loading AMDOX ERP...
      </div>
    </div>
  );
}

function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toLowerCase() || 'admin';
  return <Navigate to={`/${role}/dashboard`} replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            {adminModules.map(([path, moduleName, Component]) => (
              <Route
                key={path}
                path={path}
                element={<Component />}
              />
            ))}
          </Route>

          <Route path="/hr" element={<PrivateRoute><HRLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HRDashboard />} />
            {hrModules.map(([path, moduleName, Component]) => (
              <Route
                key={path}
                path={path}
                element={<Component />}
              />
            ))}
          </Route>

          <Route path="/manager" element={<PrivateRoute><ManagerLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            {managerModules.map(([path, moduleName, Component]) => (
              <Route
                key={path}
                path={path}
                element={<Component />}
              />
            ))}
          </Route>

          <Route path="/employee" element={<PrivateRoute><EmployeeLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            {employeeModules.map(([path, moduleName, Component]) => (
              <Route
                key={path}
                path={path}
                element={<Component />}
              />
            ))}
          </Route>

          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
