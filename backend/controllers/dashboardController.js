import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Inventory from "../models/Inventory.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";

const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments({ status: "active" });
    const activeProjects = await Project.countDocuments({ status: "Active" });
    const pendingTasks = await Task.countDocuments({ status: { $ne: "completed" } });
    
    const inventoryItemsRaw = await Inventory.find();
    const inventoryItems = inventoryItemsRaw.reduce((acc, item) => acc + item.stock, 0);

    // Stat cards mapping
    const statCards = [
      { label: "Total Employees", value: totalEmployees.toLocaleString(), change: "+1.2%", trend: "up", icon: "employees", tone: "blue" },
      { label: "Active Projects", value: activeProjects.toString(), change: "+5.1%", trend: "up", icon: "projects", tone: "cyan" },
      { label: "Pending Tasks", value: pendingTasks.toString(), change: "-3.8%", trend: "down", icon: "tasks", tone: "amber" },
      { label: "Inventory Items", value: inventoryItems.toLocaleString(), change: "+2.6%", trend: "up", icon: "inventory", tone: "emerald" },
    ];

    // Attendance stats
    const today = new Date().toISOString().split("T")[0];
    const presentToday = await Attendance.countDocuments({ date: today, status: "present" });
    const remoteToday = await Attendance.countDocuments({ date: today, status: "remote" });
    const leaveRequests = await Leave.countDocuments({ status: "pending" });

    res.json({
      statCards,
      todayStats: {
        present: presentToday,
        remote: remoteToday,
        leavesPending: leaveRequests
      }
    });
  } catch (err) {
    next(err);
  }
};

const getEmployeeDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const assignedTasks = await Task.countDocuments({ assignedTo: userId, status: { $ne: "completed" } });
    const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "completed" });
    const totalTasks = assignedTasks + completedTasks;
    
    // Attendance rate
    const totalWorkingDays = 22; // default standard
    const totalPresent = await Attendance.countDocuments({ employee: userId });
    const attendanceRate = totalWorkingDays > 0 ? Math.round((totalPresent / totalWorkingDays) * 100) : 100;

    // Leave balance (out of 20)
    const approvedLeaves = await Leave.find({ employee: userId, status: "approved" });
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
      statCards
    });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const { role } = req.user;

    if (role === "admin") {
      const totalEmployees = await User.countDocuments();
      const activeProjects = await Project.countDocuments({ status: "Active" });
      const pendingTasks = await Task.countDocuments({ status: { $ne: "completed" } });
      const inventoryItemsRaw = await Inventory.find();
      const inventoryItems = inventoryItemsRaw.reduce((acc, item) => acc + item.stock, 0);

      const statCards = [
        { label: "Total Employees", value: totalEmployees.toLocaleString(), change: "+1.2%", trend: "up", icon: "employees", tone: "blue" },
        { label: "Active Projects", value: activeProjects.toString(), change: "+5.1%", trend: "up", icon: "projects", tone: "cyan" },
        { label: "Pending Tasks", value: pendingTasks.toString(), change: "-3.8%", trend: "down", icon: "tasks", tone: "amber" },
        { label: "Inventory Items", value: inventoryItems.toLocaleString(), change: "+2.6%", trend: "up", icon: "inventory", tone: "emerald" },
      ];

      return res.json({ statCards });
    }

    if (role === "hr") {
      const totalEmployees = await User.countDocuments();
      const today = new Date().toISOString().split("T")[0];
      const presentToday = await Attendance.countDocuments({ date: today, status: "present" });
      const remoteToday = await Attendance.countDocuments({ date: today, status: "remote" });
      const presentTotal = presentToday + remoteToday;
      const leaveRequests = await Leave.countDocuments({ status: "pending" });

      const processedPayroll = await Payroll.countDocuments({ status: "paid" });
      const totalPayroll = await Payroll.countDocuments();
      const payrollReadyRate = totalPayroll > 0 ? Math.round((processedPayroll / totalPayroll) * 100) : 100;

      const statCards = [
        { label: "Total Employees", value: totalEmployees.toLocaleString(), change: "+1.2%", trend: "up", icon: "employees", tone: "blue" },
        { label: "Present Today", value: presentTotal.toLocaleString(), change: "+2.2%", trend: "up", icon: "attendance", tone: "emerald" },
        { label: "Leave Requests", value: leaveRequests.toLocaleString(), change: `+${leaveRequests} new`, trend: "up", icon: "leave", tone: "amber" },
        { label: "Payroll Ready", value: `${payrollReadyRate}%`, change: "+1.8%", trend: "up", icon: "payroll", tone: "cyan" },
      ];

      return res.json({
        statCards,
        todayStats: {
          present: presentToday,
          remote: remoteToday,
          leavesPending: leaveRequests
        }
      });
    }

    if (role === "manager") {
      const managedProjects = await Project.find({ manager: req.user._id });
      const managedProjectIds = managedProjects.map(p => p._id);
      
      const activeProjects = await Project.countDocuments({ manager: req.user._id, status: "Active" });
      const pendingTasks = await Task.countDocuments({ project: { $in: managedProjectIds }, status: { $ne: "completed" } });
      const blockedTasks = await Task.countDocuments({ project: { $in: managedProjectIds }, status: "blocked" });

      // Count unique team members assigned to manager's projects
      const uniqueMembers = new Set();
      managedProjects.forEach(p => {
        if (p.assignedMembers) {
          p.assignedMembers.forEach(m => uniqueMembers.add(m.toString()));
        }
      });
      const teamMembers = uniqueMembers.size;

      const statCards = [
        { label: "Active Projects", value: activeProjects.toString(), change: `+${managedProjects.length} total`, trend: "up", icon: "projects", tone: "blue" },
        { label: "Team Members", value: teamMembers.toString(), change: "+0 joined", trend: "up", icon: "team", tone: "emerald" },
        { label: "Pending Tasks", value: pendingTasks.toString(), change: "Stable", trend: "down", icon: "tasks", tone: "amber" },
        { label: "Blocked Work", value: blockedTasks.toString(), change: `+${blockedTasks} alert`, trend: "up", icon: "reports", tone: "rose" },
      ];

      return res.json({ statCards });
    }

    if (role === "employee") {
      const userId = req.user._id;

      const assignedTasks = await Task.countDocuments({ assignedTo: userId, status: { $ne: "completed" } });
      const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "completed" });
      
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

      const statCards = [
        { label: "Assigned Tasks", value: assignedTasks.toString(), change: `${completedTasks} completed`, trend: "down", icon: "tasks", tone: "blue" },
        { label: "Attendance Rate", value: `${attendanceRate}%`, change: "Stable", trend: "up", icon: "attendance", tone: "emerald" },
        { label: "Leave Balance", value: `${leaveBalance} days`, change: "Available", trend: "neutral", icon: "leave", tone: "cyan" },
        { label: "Project Hours", value: `${totalPresent * 8}h`, change: "+8h today", trend: "up", icon: "projects", tone: "amber" },
      ];

      return res.json({ statCards });
    }

    res.status(400).json({ error: "Invalid user role." });
  } catch (err) {
    next(err);
  }
};

export {
  getAdminDashboardStats,
  getEmployeeDashboardStats,
  getDashboardStats,
};
