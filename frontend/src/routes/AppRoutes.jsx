import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext.jsx";

const AdminLayout = lazy(() => import("../layouts/AdminLayout.jsx"));
const EmployeeLayout = lazy(() => import("../layouts/EmployeeLayout.jsx"));
const HRLayout = lazy(() => import("../layouts/HRLayout.jsx"));
const ManagerLayout = lazy(() => import("../layouts/ManagerLayout.jsx"));

const Login = lazy(() => import("../pages/auth/Login.jsx"));
const Register = lazy(() => import("../pages/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword.jsx"));

const AdminDashboard = lazy(() => import("../pages/admin/Dashboard.jsx"));
const EmployeeDashboard = lazy(() => import("../pages/employee/Dashboard.jsx"));
const HRDashboard = lazy(() => import("../pages/hr/Dashboard.jsx"));
const ManagerDashboard = lazy(() => import("../pages/manager/Dashboard.jsx"));

// Protected Modules
const Employees = lazy(() => import("../pages/admin/Employees.jsx"));
const Departments = lazy(() => import("../pages/admin/Departments.jsx"));
const Attendance = lazy(() => import("../pages/admin/Attendance.jsx"));
const LeaveManagement = lazy(() => import("../pages/admin/LeaveManagement.jsx"));
const Projects = lazy(() => import("../pages/admin/Projects.jsx"));
const Tasks = lazy(() => import("../pages/admin/Tasks.jsx"));
const Inventory = lazy(() => import("../pages/admin/Inventory.jsx"));
const Reports = lazy(() => import("../pages/admin/Reports.jsx"));
const Settings = lazy(() => import("../pages/admin/Settings.jsx"));

const HREmployees = lazy(() => import("../pages/hr/Employees.jsx"));
const HRAttendance = lazy(() => import("../pages/hr/Attendance.jsx"));
const HRLeaveRequests = lazy(() => import("../pages/hr/LeaveRequests.jsx"));
const HRPayroll = lazy(() => import("../pages/hr/Payroll.jsx"));

const ManagerProjects = lazy(() => import("../pages/manager/Projects.jsx"));
const ManagerTasks = lazy(() => import("../pages/manager/Tasks.jsx"));
const ManagerTeamMembers = lazy(() => import("../pages/manager/TeamMembers.jsx"));

const EmployeeMyTasks = lazy(() => import("../pages/employee/MyTasks.jsx"));
const EmployeeAttendance = lazy(() => import("../pages/employee/Attendance.jsx"));
const EmployeeApplyLeave = lazy(() => import("../pages/employee/ApplyLeave.jsx"));
const EmployeeProfile = lazy(() => import("../pages/employee/Profile.jsx"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 dark:bg-slate-950">
      <div className="rounded-xl border border-white/70 bg-white/85 px-6 py-5 text-sm font-semibold text-slate-600 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-350">
        Loading AMDOX ERP...
      </div>
    </div>
  );
}

// Redirect root route based on role
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <RouteFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

// Protection Guard
function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) return <RouteFallback />;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

// Public Route Guard (Redirect home if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <RouteFallback />;
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;

  return children;
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="departments" element={<Departments />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leave-management" element={<LeaveManagement />} />
              <Route path="projects" element={<Projects />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* HR Routes */}
            <Route
              path="/hr"
              element={
                <ProtectedRoute allowedRoles={["hr", "admin"]}>
                  <HRLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HRDashboard />} />
              <Route path="employees" element={<HREmployees />} />
              <Route path="attendance" element={<HRAttendance />} />
              <Route path="leave-requests" element={<HRLeaveRequests />} />
              <Route path="payroll" element={<HRPayroll />} />
            </Route>

            {/* Manager Routes */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={["manager", "admin"]}>
                  <ManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="projects" element={<ManagerProjects />} />
              <Route path="tasks" element={<ManagerTasks />} />
              <Route path="team-members" element={<ManagerTeamMembers />} />
            </Route>

            {/* Employee Routes */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={["employee", "admin", "hr", "manager"]}>
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="my-tasks" element={<EmployeeMyTasks />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="apply-leave" element={<EmployeeApplyLeave />} />
              <Route path="profile" element={<EmployeeProfile />} />
            </Route>

            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
