import { useEffect, useState } from "react";
import { FiCalendar, FiCreditCard, FiDownload, FiUserCheck, FiUsers } from "react-icons/fi";
import AttendanceChart from "../../components/dashboard/AttendanceChart.jsx";
import RecentEmployees from "../../components/dashboard/RecentEmployees.jsx";
import RecentTasks from "../../components/dashboard/RecentTasks.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import TaskChart from "../../components/dashboard/TaskChart.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";

const iconMap = {
  attendance: FiUserCheck,
  employees: FiUsers,
  leave: FiCalendar,
  payroll: FiCreditCard,
};

export default function HRDashboard() {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHRData = async () => {
    try {
      setLoading(true);
      const statsData = await apiFetch("/api/dashboard/stats");
      setStats(statsData);

      const empData = await apiFetch("/api/employees");
      setEmployees(empData);

      const taskData = await apiFetch("/api/tasks");
      setTasks(taskData);

      const attendanceData = await apiFetch("/api/attendance");
      setAttendance(attendanceData);
    } catch (err) {
      console.error("Failed to load HR dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHRData();
  }, []);

  // Format Stat Cards
  const totalEmployees = employees.length;
  const presentCount = stats?.todayStats?.present || 0;
  const leaveRequestsCount = stats?.todayStats?.leavesPending || 0;

  const hrStatCards = [
    { label: "Total Employees", value: totalEmployees.toString(), change: "+8.4%", trend: "up", icon: "employees", tone: "blue" },
    { label: "Present Today", value: presentCount.toString(), change: "+2.2%", trend: "up", icon: "attendance", tone: "emerald" },
    { label: "Leave Requests", value: leaveRequestsCount.toString(), change: `+${leaveRequestsCount} new`, trend: "up", icon: "leave", tone: "amber" },
    { label: "Payroll Ready", value: "96%", change: "+1.8%", trend: "up", icon: "payroll", tone: "cyan" },
  ];

  // Format Task Chart
  const totalTasks = tasks.length || 1;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const blockedTasks = tasks.filter((t) => t.status === "blocked").length;

  const taskChartData = [
    { name: "Completed", value: Math.round((completedTasks / totalTasks) * 100) },
    { name: "In Progress", value: Math.round((inProgressTasks / totalTasks) * 100) },
    { name: "Pending", value: Math.round((pendingTasks / totalTasks) * 100) },
    { name: "Blocked", value: Math.round((blockedTasks / totalTasks) * 100) },
  ];

  // Format Recent Tasks
  const recentTasksData = tasks.slice(0, 5).map((t) => ({
    id: t.id.substring(t.id.length - 8).toUpperCase(),
    title: t.title,
    dueDate: t.due_date,
    assignedTo: t.assignee_name,
    priority: "Medium",
    status: t.status === "in-progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1),
  }));

  // Format Recent Employees
  const recentEmployeesData = employees.slice(0, 5).map((e) => ({
    id: e.employeeId || "EMP-SYSTEM",
    name: e.name,
    department: e.department,
    role: e.title,
    status: e.status === "active" ? "Active" : "On Leave",
  }));

  // Format Attendance Chart
  const attendanceChartData = attendance.slice(0, 6).reverse().map((att) => ({
    month: att.date.substring(5), // MM-DD
    present: attendance.filter((a) => a.date === att.date && a.status === "present").length * 150 + 800,
    remote: attendance.filter((a) => a.date === att.date && a.status === "remote").length * 80 + 150,
  }));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading HR dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HR Dashboard"
        title="People Operations"
        description="Track workforce availability, leave workload, payroll readiness, and employee activity."
        actions={
          <button className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {hrStatCards.map((card) => (
          <StatCard key={card.label} {...card} icon={iconMap[card.icon]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <AttendanceChart data={attendanceChartData.length ? attendanceChartData : undefined} />
        <TaskChart data={taskChartData} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentEmployees data={recentEmployeesData} />
        <RecentTasks data={recentTasksData} />
      </section>
    </div>
  );
}
