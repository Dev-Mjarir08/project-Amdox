import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiEdit3,
  FiGrid,
  FiPackage,
  FiSettings,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiCpu,
} from "react-icons/fi";
import Footer from "../components/common/Footer.jsx";
import Navbar from "../components/common/Navbar.jsx";
import Sidebar from "../components/common/Sidebar.jsx";

const roleConfigs = {
  admin: {
    label: "Admin",
    workspace: "AMDOX Corp Office",
    user: { name: "Administrator", role: "admin", initials: "AD" },
    navItems: [
      { label: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
      { label: "General Ledger", path: "/admin/general-ledger", icon: "expenses" },
      { label: "Accounts Payable", path: "/admin/accounts-payable", icon: "expenses" },
      { label: "Accounts Receivable", path: "/admin/accounts-receivable", icon: "expenses" },
      { label: "Financial Reports", path: "/admin/financial-reports", icon: "reports" },
      { label: "Employees", path: "/admin/employees", icon: "employees" },
      { label: "Attendance", path: "/admin/attendance", icon: "attendance" },
      { label: "Leave Management", path: "/admin/leave-management", icon: "leave" },
      { label: "Payroll", path: "/admin/payroll", icon: "payroll" },
      { label: "Purchase Orders", path: "/admin/purchase-orders", icon: "inventory" },
      { label: "Vendors", path: "/admin/vendors", icon: "vendors" },
      { label: "Inventory", path: "/admin/inventory", icon: "inventory" },
      { label: "Projects", path: "/admin/projects", icon: "projects" },
      { label: "Tasks", path: "/admin/tasks", icon: "tasks" },
      { label: "Recruitment", path: "/admin/recruitment", icon: "recruitment" },
      { label: "Performance", path: "/admin/performance", icon: "performance" },
      { label: "Training", path: "/admin/training", icon: "training" },
      { label: "Shifts", path: "/admin/shifts", icon: "attendance" },
      { label: "Holidays", path: "/admin/holidays", icon: "leave" },
      { label: "CRM", path: "/admin/crm", icon: "crm" },
      { label: "Sales", path: "/admin/sales", icon: "expenses" },
      { label: "Assets", path: "/admin/assets", icon: "inventory" },
      { label: "Documents", path: "/admin/documents", icon: "reports" },
      { label: "Audit Logs", path: "/admin/audit-logs", icon: "reports" },
      { label: "Admin Panel", path: "/admin/admin-panel", icon: "settings" },
      { label: "AI Forecasting", path: "/admin/ai-forecasting", icon: "ai" },
      { label: "Settings", path: "/admin/settings", icon: "settings" },
    ]
  },
  hr: {
    label: "HR Manager",
    workspace: "Human Resources Ops",
    user: { name: "HR Manager", role: "hr", initials: "HR" },
    navItems: [
      { label: "Dashboard", path: "/hr/dashboard", icon: "dashboard" },
      { label: "Employees", path: "/hr/employees", icon: "employees" },
      { label: "Attendance", path: "/hr/attendance", icon: "attendance" },
      { label: "Leave Requests", path: "/hr/leave-requests", icon: "leave" },
      { label: "Payroll", path: "/hr/payroll", icon: "payroll" },
      { label: "Recruitment", path: "/hr/recruitment", icon: "recruitment" },
      { label: "Performance", path: "/hr/performance", icon: "performance" },
      { label: "Training", path: "/hr/training", icon: "training" },
      { label: "Shifts", path: "/hr/shifts", icon: "attendance" },
      { label: "Holidays", path: "/hr/holidays", icon: "leave" },
      { label: "Documents", path: "/hr/documents", icon: "reports" },
      { label: "AI Forecasting", path: "/hr/ai-forecasting", icon: "ai" },
      { label: "Settings", path: "/hr/settings", icon: "settings" },
    ]
  },
  manager: {
    label: "Manager",
    workspace: "Engineering Delivery",
    user: { name: "Manager", role: "manager", initials: "MN" },
    navItems: [
      { label: "Dashboard", path: "/manager/dashboard", icon: "dashboard" },
      { label: "Projects", path: "/manager/projects", icon: "projects" },
      { label: "Tasks", path: "/manager/tasks", icon: "tasks" },
      { label: "Team Members", path: "/manager/team-members", icon: "employees" },
      { label: "Performance", path: "/manager/performance", icon: "performance" },
      { label: "Shifts", path: "/manager/shifts", icon: "attendance" },
      { label: "AI Forecasting", path: "/manager/ai-forecasting", icon: "ai" },
      { label: "Settings", path: "/manager/settings", icon: "settings" },
    ]
  },
  employee: {
    label: "Employee",
    workspace: "Personal Workspace",
    user: { name: "Employee", role: "employee", initials: "EM" },
    navItems: [
      { label: "Dashboard", path: "/employee/dashboard", icon: "dashboard" },
      { label: "My Tasks", path: "/employee/my-tasks", icon: "tasks" },
      { label: "Attendance", path: "/employee/attendance", icon: "attendance" },
      { label: "Apply Leave", path: "/employee/apply-leave", icon: "leave" },
      { label: "Profile", path: "/employee/profile", icon: "profile" },
      { label: "Shifts", path: "/employee/shifts", icon: "attendance" },
      { label: "Training", path: "/employee/training", icon: "training" },
      { label: "Performance", path: "/employee/performance", icon: "performance" },
      { label: "Documents", path: "/employee/documents", icon: "reports" },
      { label: "AI Forecasting", path: "/employee/ai-forecasting", icon: "ai" },
      { label: "Settings", path: "/employee/settings", icon: "settings" },
    ]
  }
};

const iconMap = {
  attendance: FiClock,
  dashboard: FiGrid,
  employees: FiUsers,
  expenses: FiCreditCard,
  inventory: FiPackage,
  leave: FiCalendar,
  payroll: FiCreditCard,
  profile: FiUser,
  projects: FiBriefcase,
  reports: FiBarChart2,
  revenue: FiDollarSign,
  settings: FiSettings,
  tasks: FiCheckSquare,
  team: FiUserCheck,
  vendors: FiUsers,
  edit: FiEdit3,
  recruitment: FiUser,
  performance: FiCheckSquare,
  training: FiBriefcase,
  crm: FiUsers,
  ai: FiCpu,
};

import useAuthStore from "../stores/useAuthStore.js";

const permissionMap = {
  "General Ledger": "Finance.View",
  "Accounts Payable": "Finance.View",
  "Accounts Receivable": "Finance.View",
  "Financial Reports": "Finance.View",
  "Employees": "Employee.View",
  "Attendance": "Attendance.View",
  "Leave Management": "Leave.View",
  "Leave Requests": "Leave.View",
  "Payroll": "Payroll.View",
  "Purchase Orders": "Inventory.View",
  "Vendors": "Inventory.View",
  "Inventory": "Inventory.View",
  "Recruitment": "Employee.View",
  "Performance": "Employee.View",
  "Training": "Employee.View",
  "Shifts": "Attendance.View",
  "Holidays": "Leave.View",
  "CRM": "CRM.View",
  "Sales": "CRM.View",
  "Assets": "Inventory.View",
  "Audit Logs": "Finance.View",
  "Admin Panel": "Employee.Delete"
};

export default function RoleLayout({ role }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const config = roleConfigs[role] || roleConfigs.admin;

  const currentUser = useAuthStore((state) => state.user);
  const permissions = currentUser?.permissions || [];

  const items = useMemo(() => {
    return (config?.navItems || [])
      .filter((item) => {
        const reqPermission = permissionMap[item.label];
        if (!reqPermission) return true;
        return permissions.includes(reqPermission);
      })
      .map((item) => ({
        ...item,
        icon: iconMap[item.icon] ?? FiGrid,
      }));
  }, [config?.navItems, permissions]);

  return (
    <div className="min-h-screen bg-background text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        items={items}
        onCloseMobile={() => setIsMobileOpen(false)}
        onToggleCollapse={() => setIsCollapsed((current) => !current)}
        roleLabel={config.label}
      />

      <div className={`min-h-screen transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <Navbar
          user={config.user}
          workspace={config.workspace}
          onOpenSidebar={() => setIsMobileOpen(true)}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet context={{ role, roleConfig: config }} />
          <Footer />
        </main>
      </div>
    </div>
  );
}
