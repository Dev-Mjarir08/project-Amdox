export const roleConfigs = {
  admin: {
    label: "Admin",
    workspace: "Enterprise Control Center",
    user: {
      name: "Admin User",
      role: "ERP Administrator",
      initials: "AD",
    },
    navItems: [
      { label: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
      { label: "Employees", path: "/admin/employees", icon: "employees" },
      { label: "Departments", path: "/admin/departments", icon: "team" },
      { label: "Attendance", path: "/admin/attendance", icon: "attendance" },
      { label: "Leave Management", path: "/admin/leave-management", icon: "leave" },
      { label: "Projects", path: "/admin/projects", icon: "projects" },
      { label: "Tasks", path: "/admin/tasks", icon: "tasks" },
      { label: "Inventory", path: "/admin/inventory", icon: "inventory" },
      { label: "Reports", path: "/admin/reports", icon: "reports" },
      { label: "Settings", path: "/admin/settings", icon: "settings" },
    ],
  },
  hr: {
    label: "HR",
    workspace: "People Operations",
    user: {
      name: "HR Specialist",
      role: "HR Partner",
      initials: "HR",
    },
    navItems: [
      { label: "Dashboard", path: "/hr/dashboard", icon: "dashboard" },
      { label: "Employees", path: "/hr/employees", icon: "employees" },
      { label: "Attendance", path: "/hr/attendance", icon: "attendance" },
      { label: "Leave Requests", path: "/hr/leave-requests", icon: "leave" },
      { label: "Payroll", path: "/hr/payroll", icon: "payroll" },
    ],
  },
  manager: {
    label: "Manager",
    workspace: "Delivery Workspace",
    user: {
      name: "Project Manager",
      role: "Manager",
      initials: "PM",
    },
    navItems: [
      { label: "Dashboard", path: "/manager/dashboard", icon: "dashboard" },
      { label: "Projects", path: "/manager/projects", icon: "projects" },
      { label: "Tasks", path: "/manager/tasks", icon: "tasks" },
      { label: "Team Members", path: "/manager/team-members", icon: "team" },
    ],
  },
  employee: {
    label: "Employee",
    workspace: "Personal Workspace",
    user: {
      name: "Staff Member",
      role: "Employee",
      initials: "EM",
    },
    navItems: [
      { label: "Dashboard", path: "/employee/dashboard", icon: "dashboard" },
      { label: "My Tasks", path: "/employee/my-tasks", icon: "tasks" },
      { label: "Attendance", path: "/employee/attendance", icon: "attendance" },
      { label: "Apply Leave", path: "/employee/apply-leave", icon: "leave" },
      { label: "Profile", path: "/employee/profile", icon: "profile" },
    ],
  },
};

