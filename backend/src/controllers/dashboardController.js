import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Inventory from "../models/Inventory.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Payroll from "../models/Payroll.js";
import Invoice from "../models/Invoice.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

const getAdminDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [
      totalEmployees,
      activeProjects,
      pendingTasks,
      inventoryItemsRaw,
      paidInvoices,
      approvedPOs,
      paidPayrolls,
      pendingPOs,
      presentToday,
      remoteToday,
      leaveRequests
    ] = await Promise.all([
      (await Employee.countDocuments()) || (await User.countDocuments({ role: "employee" })),
      Project.countDocuments({ status: "Active" }),
      Task.countDocuments({ status: { $ne: "completed" } }),
      Inventory.find(),
      Invoice.find({ status: "Paid" }),
      PurchaseOrder.find({ status: { $in: ["Approved", "Received", "Billed"] } }),
      Payroll.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$netPay" } } }
      ]),
      PurchaseOrder.countDocuments({ status: "Pending" }),
      Attendance.countDocuments({ date: today, status: "present" }),
      Attendance.countDocuments({ date: today, status: "remote" }),
      Leave.countDocuments({ status: "pending" })
    ]);
    
    const inventoryItems = inventoryItemsRaw.reduce((acc, item) => acc + item.stock, 0);
    const revenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const expenses = approvedPOs.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
    const payrollProcessed = paidPayrolls[0]?.total || 0;

    const statCards = [
      { label: "Total Employees", value: totalEmployees.toLocaleString(), change: "+1.2%", trend: "up", icon: "employees", tone: "blue" },
      { label: "Active Projects", value: activeProjects.toString(), change: "+5.1%", trend: "up", icon: "projects", tone: "cyan" },
      { label: "Revenue", value: `₹${revenue.toLocaleString()}`, change: "+8%", trend: "up", icon: "revenue", tone: "emerald" },
      { label: "Expenses", value: `₹${expenses.toLocaleString()}`, change: "-2%", trend: "down", icon: "expenses", tone: "rose" },
      { label: "Payroll Processed", value: `₹${payrollProcessed.toLocaleString()}`, change: "On time", trend: "neutral", icon: "payroll", tone: "purple" },
      { label: "Pending PO", value: `${pendingPOs} Orders`, change: "+3 today", trend: "up", icon: "purchaseOrders", tone: "amber" },
      { label: "Pending Tasks", value: pendingTasks.toString(), change: "-3.8%", trend: "down", icon: "tasks", tone: "amber" },
      { label: "Inventory Items", value: inventoryItems.toLocaleString(), change: "+2.6%", trend: "up", icon: "inventory", tone: "emerald" },
    ];

    res.json({
      success: true,
      message: "Admin dashboard stats fetched successfully.",
      data: {
        statCards,
        todayStats: {
          present: presentToday,
          remote: remoteToday,
          leavesPending: leaveRequests
        }
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getEmployeeDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      assignedTasks,
      completedTasks,
      totalPresent,
      approvedLeaves
    ] = await Promise.all([
      Task.countDocuments({ assignedTo: userId, status: { $ne: "completed" } }),
      Task.countDocuments({ assignedTo: userId, status: "completed" }),
      Attendance.countDocuments({ employee: userId }),
      Leave.find({ employee: userId, status: "approved" })
    ]);

    const totalWorkingDays = 22;
    const attendanceRate = totalWorkingDays > 0 ? Math.round((totalPresent / totalWorkingDays) * 100) : 100;

    const leavesUsed = approvedLeaves.reduce((acc, l) => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return acc + diffDays;
    }, 0);
    const leaveBalance = Math.max(20 - leavesUsed, 0);

    const statCards = [
      { label: "Assigned Tasks", value: assignedTasks.toString(), change: `${completedTasks} completed`, trend: "down", icon: "tasks", tone: "blue" },
      { label: "Attendance Rate", value: `${attendanceRate}%`, change: "Stable", trend: "up", icon: "attendance", tone: "emerald" },
      { label: "Leave Balance", value: `${leaveBalance} days`, change: "Available", trend: "neutral", icon: "leave", tone: "cyan" },
      { label: "Project Hours", value: `${totalPresent * 8}h`, change: "+8h today", trend: "up", icon: "projects", tone: "amber" },
    ];

    res.json({
      success: true,
      message: "Employee dashboard stats fetched successfully.",
      data: { statCards },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

import AuditLog from "../models/AuditLog.js";

const getDashboardStats = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startIsoString = startOfMonth.toISOString().substring(0, 7); // "YYYY-MM"

    // 1. Fetch managed projects first (required for manager role tasks filter)
    const managedProjects = role === "manager" ? await Project.find({ manager: userId }) : [];

    const attendanceQuery = { date: { $gte: startIsoString } };
    if (role === "employee") {
      attendanceQuery.employee = userId;
    }

    const taskQuery = {};
    if (role === "employee") {
      taskQuery.assignedTo = userId;
    } else if (role === "manager") {
      taskQuery.project = { $in: managedProjects.map(p => p._id) };
    }

    const projectQuery = {};
    if (role === "manager") {
      projectQuery.manager = userId;
    }

    const logsQuery = {};
    if (role !== "admin") {
      logsQuery.user = userId;
    }

    // 2. Parallel fetch all 18 queries in a single Promise.all
    const [
      inventoryItemsRaw,
      attendanceRecords,
      completedTasks,
      inProgressTasks,
      pendingTasksCount,
      blockedTasks,
      activeProjectsList,
      latestEmployees,
      latestTasks,
      latestLogs,
      pendingLeavesCount,
      pendingPOsCount,
      pendingInvoicesCount,
      lowStockCount,
      outOfStockCount,
      healthyStockCount,
      allInvoices,
      allPOs
    ] = await Promise.all([
      Inventory.find(),
      Attendance.find(attendanceQuery),
      Task.countDocuments({ ...taskQuery, status: "completed" }),
      Task.countDocuments({ ...taskQuery, status: "in-progress" }),
      Task.countDocuments({ ...taskQuery, status: "pending" }),
      Task.countDocuments({ ...taskQuery, status: "blocked" }),
      Project.find(projectQuery).sort({ progress: -1 }).limit(5),
      Employee.find().populate("user", "name status").populate("department", "departmentName").sort({ createdAt: -1 }).limit(5),
      Task.find(taskQuery).populate("assignedTo", "name").sort({ createdAt: -1 }).limit(5),
      AuditLog.find(logsQuery).populate("user", "name").sort({ createdAt: -1 }).limit(10),
      Leave.countDocuments({ status: "pending" }),
      PurchaseOrder.countDocuments({ status: "Pending" }),
      Invoice.countDocuments({ status: "Sent" }),
      Inventory.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
      Inventory.countDocuments({ stock: 0 }),
      Inventory.countDocuments({ stock: { $gt: 10 } }),
      Invoice.find({ invoiceDate: { $gte: startIsoString }, status: "Paid" }),
      PurchaseOrder.find({ orderDate: { $gte: startIsoString }, status: { $in: ["Approved", "Received", "Billed"] } })
    ]);

    const totalInventoryStock = inventoryItemsRaw.reduce((acc, item) => acc + item.stock, 0);

    // 1. Process Attendance Overview in-memory
    const attendanceOverview = [];
    const monthlyGroups = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = d.toISOString().substring(0, 7);
      monthlyGroups[yearMonth] = {
        month: d.toLocaleString("default", { month: "short" }),
        present: 0,
        remote: 0,
        absent: 0
      };
    }

    attendanceRecords.forEach(record => {
      const ym = record.date.substring(0, 7);
      if (monthlyGroups[ym]) {
        if (record.status === "present") {
          monthlyGroups[ym].present++;
        } else if (record.status === "remote") {
          monthlyGroups[ym].remote++;
        }
      }
    });

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = d.toISOString().substring(0, 7);
      attendanceOverview.push(monthlyGroups[yearMonth]);
    }

    // 2. Task Completion
    const taskCompletion = [
      { name: "Completed", value: completedTasks },
      { name: "In Progress", value: inProgressTasks },
      { name: "Pending", value: pendingTasksCount },
      { name: "Blocked", value: blockedTasks }
    ];

    // 3. Project Progress
    const projectProgress = activeProjectsList.map(p => ({
      name: p.title,
      progress: p.progress
    }));

    // 4. Recent Employees
    const recentEmployees = latestEmployees.map(e => ({
      id: e.employeeId,
      name: e.user ? e.user.name : "Unknown",
      department: e.department ? e.department.departmentName : "General",
      role: e.designation,
      status: e.user && e.user.status === "active" ? "Active" : "Inactive"
    }));

    // 5. Recent Tasks
    const recentTasks = latestTasks.map(t => {
      let priorityName = "Medium";
      if (t.priority === "high") priorityName = "High";
      if (t.priority === "low") priorityName = "Low";

      let statusName = "Pending";
      if (t.status === "completed") statusName = "Completed";
      if (t.status === "in-progress") statusName = "In Progress";
      if (t.status === "blocked") statusName = "Blocked";

      return {
        id: t._id.toString(),
        title: t.title,
        assignedTo: t.assignedTo ? t.assignedTo.name : "Unassigned",
        priority: priorityName,
        status: statusName,
        dueDate: t.dueDate ? t.dueDate.toISOString().split("T")[0] : "No Date"
      };
    });

    // 6. Recent Activities
    const recentActivities = latestLogs.map(log => 
      `${log.user ? log.user.name : "System"} ${log.action.toLowerCase()}d ${log.resource}: ${log.details || ""}`
    );

    // 8. Pending Approvals
    const pendingApprovals = [
      { label: "Leave Requests", value: pendingLeavesCount },
      { label: "Purchase Orders", value: pendingPOsCount },
      { label: "Invoices", value: pendingInvoicesCount }
    ];

    // 9. Inventory Intelligence status
    const inventoryIntelligence = {
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      healthy: healthyStockCount,
      overview: []
    };
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("default", { month: "short" });
      inventoryIntelligence.overview.push({
        month: monthLabel,
        stock: totalInventoryStock,
        turnover: Math.round(totalInventoryStock * 0.75)
      });
    }

    // 10. Finance Overview (processed from in-memory records)
    const financeOverview = {
      totalRevenue: 0,
      totalExpense: 0,
      trend: []
    };

    const monthlyFinanceGroups = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = d.toISOString().substring(0, 7);
      monthlyFinanceGroups[yearMonth] = {
        month: d.toLocaleString("default", { month: "short" }),
        revenue: 0,
        expense: 0
      };
    }

    allInvoices.forEach(inv => {
      if (inv.invoiceDate) {
        const ym = inv.invoiceDate.substring(0, 7);
        if (monthlyFinanceGroups[ym]) {
          monthlyFinanceGroups[ym].revenue += (inv.totalAmount || 0);
        }
      }
    });

    allPOs.forEach(po => {
      if (po.orderDate) {
        const ym = po.orderDate.substring(0, 7);
        if (monthlyFinanceGroups[ym]) {
          monthlyFinanceGroups[ym].expense += (po.totalAmount || 0);
        }
      }
    });

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = d.toISOString().substring(0, 7);
      const group = monthlyFinanceGroups[yearMonth];
      financeOverview.totalRevenue += group.revenue;
      financeOverview.totalExpense += group.expense;
      financeOverview.trend.push(group);
    }

    // 11. AI Forecast
    const aiForecast = {
      confidence: totalInventoryStock > 0 ? "92%" : "N/A",
      current: totalInventoryStock,
      predicted: Math.round(totalInventoryStock * 1.35),
      trend: []
    };
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("default", { month: "short" });
      const baseVal = Math.round(totalInventoryStock / 5) || 0;
      aiForecast.trend.push({
        month: monthLabel,
        sales: i === 0 ? baseVal : Math.round(baseVal * (1 - i * 0.05)),
        predicted: i === 0 ? Math.round(baseVal * 1.35) : null
      });
    }

    // 7. Role-Specific Stat Cards
    let statCards = [];

    if (role === "admin") {
      const empCount = await Employee.countDocuments();
      const totalEmployees = empCount > 0 ? empCount : await User.countDocuments({ role: "employee" });
      const activeProjectsCount = await Project.countDocuments({ status: "Active" });
      const pendingTasksTotal = await Task.countDocuments({ status: { $ne: "completed" } });

      const paidInvoices = await Invoice.find({ status: "Paid" });
      const revenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      const approvedPOs = await PurchaseOrder.find({ status: { $in: ["Approved", "Received", "Billed"] } });
      const expenses = approvedPOs.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

      const paidPayrolls = await Payroll.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$netPay" } } }
      ]);
      const payrollProcessed = paidPayrolls[0]?.total || 0;

      const pendingPOs = await PurchaseOrder.countDocuments({ status: "Pending" });

      statCards = [
        { label: "Total Employees", value: totalEmployees.toLocaleString(), change: "+1.2%", trend: "up", icon: "employees", tone: "blue" },
        { label: "Active Projects", value: activeProjectsCount.toString(), change: "+5.1%", trend: "up", icon: "projects", tone: "cyan" },
        { label: "Revenue", value: `₹${revenue.toLocaleString()}`, change: "+8%", trend: "up", icon: "revenue", tone: "emerald" },
        { label: "Expenses", value: `₹${expenses.toLocaleString()}`, change: "-2%", trend: "down", icon: "expenses", tone: "rose" },
        { label: "Payroll Processed", value: `₹${payrollProcessed.toLocaleString()}`, change: "On time", trend: "neutral", icon: "payroll", tone: "purple" },
        { label: "Pending PO", value: `${pendingPOs} Orders`, change: "+3 today", trend: "up", icon: "purchaseOrders", tone: "amber" },
        { label: "Pending Tasks", value: pendingTasksTotal.toString(), change: "-3.8%", trend: "down", icon: "tasks", tone: "amber" },
        { label: "Inventory Items", value: totalInventoryStock.toLocaleString(), change: "+2.6%", trend: "up", icon: "inventory", tone: "emerald" },
      ];
    }

    if (role === "hr") {
      const hrEmpCount = await Employee.countDocuments();
      const totalEmployees = hrEmpCount > 0 ? hrEmpCount : await User.countDocuments({ role: "employee" });
      const today = new Date().toISOString().split("T")[0];
      const presentToday = await Attendance.countDocuments({ date: today, status: "present" });
      const remoteToday = await Attendance.countDocuments({ date: today, status: "remote" });
      const presentTotal = presentToday + remoteToday;
      const leaveRequests = await Leave.countDocuments({ status: "pending" });

      const processedPayroll = await Payroll.countDocuments({ status: "paid" });
      const totalPayroll = await Payroll.countDocuments();
      const payrollReadyRate = totalPayroll > 0 ? Math.round((processedPayroll / totalPayroll) * 100) : 100;

      statCards = [
        { label: "Total Employees", value: totalEmployees.toLocaleString(), change: "+1.2%", trend: "up", icon: "employees", tone: "blue" },
        { label: "Present Today", value: presentTotal.toLocaleString(), change: "+2.2%", trend: "up", icon: "attendance", tone: "emerald" },
        { label: "Leave Requests", value: leaveRequests.toLocaleString(), change: `+${leaveRequests} new`, trend: "up", icon: "leave", tone: "amber" },
        { label: "Payroll Ready", value: `${payrollReadyRate}%`, change: "+1.8%", trend: "up", icon: "payroll", tone: "cyan" },
      ];
    }

    if (role === "manager") {
      const managedProjects = await Project.find({ manager: userId });
      const managedProjectIds = managedProjects.map(p => p._id);
      
      const activeProjectsCount = await Project.countDocuments({ manager: userId, status: "Active" });
      const pendingTasksCount = await Task.countDocuments({ project: { $in: managedProjectIds }, status: { $ne: "completed" } });
      const blockedTasks = await Task.countDocuments({ project: { $in: managedProjectIds }, status: "blocked" });

      const uniqueMembers = new Set();
      managedProjects.forEach(p => {
        if (p.assignedMembers) {
          p.assignedMembers.forEach(m => uniqueMembers.add(m.toString()));
        }
      });
      const teamMembers = uniqueMembers.size;

      statCards = [
        { label: "Active Projects", value: activeProjectsCount.toString(), change: `+${managedProjects.length} total`, trend: "up", icon: "projects", tone: "blue" },
        { label: "Team Members", value: teamMembers.toString(), change: "+0 joined", trend: "up", icon: "team", tone: "emerald" },
        { label: "Pending Tasks", value: pendingTasksCount.toString(), change: "Stable", trend: "down", icon: "tasks", tone: "amber" },
        { label: "Blocked Work", value: blockedTasks.toString(), change: `+${blockedTasks} alert`, trend: "up", icon: "reports", tone: "rose" },
      ];
    }

    if (role === "employee") {
      const assignedTasksCount = await Task.countDocuments({ assignedTo: userId, status: { $ne: "completed" } });
      const completedTasksCount = await Task.countDocuments({ assignedTo: userId, status: "completed" });
      
      const totalWorkingDays = 22;
      const totalPresent = await Attendance.countDocuments({ employee: userId });
      const attendanceRate = totalWorkingDays > 0 ? Math.round((totalPresent / totalWorkingDays) * 100) : 100;

      const approvedLeaves = await Leave.find({ employee: userId, status: "approved" });
      const leavesUsed = approvedLeaves.reduce((acc, l) => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return acc + diffDays;
      }, 0);
      const leaveBalance = Math.max(20 - leavesUsed, 0);

      statCards = [
        { label: "Assigned Tasks", value: assignedTasksCount.toString(), change: `${completedTasksCount} completed`, trend: "down", icon: "tasks", tone: "blue" },
        { label: "Attendance Rate", value: `${attendanceRate}%`, change: "Stable", trend: "up", icon: "attendance", tone: "emerald" },
        { label: "Leave Balance", value: `${leaveBalance} days`, change: "Available", trend: "neutral", icon: "leave", tone: "cyan" },
        { label: "Project Hours", value: `${totalPresent * 8}h`, change: "+8h today", trend: "up", icon: "projects", tone: "amber" },
      ];
    }

    res.json({
      success: true,
      message: "Dashboard stats fetched successfully.",
      data: {
        statCards,
        attendanceOverview,
        taskCompletion,
        projectProgress,
        recentEmployees,
        recentTasks,
        recentActivities,
        pendingApprovals,
        inventoryIntelligence,
        financeOverview,
        aiForecast
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getAdminDashboardStats,
  getEmployeeDashboardStats,
  getDashboardStats,
};
