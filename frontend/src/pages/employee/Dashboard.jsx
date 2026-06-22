import { useEffect, useState, useMemo } from "react";
import { FiBriefcase, FiCalendar, FiCheckSquare, FiDownload, FiUserCheck } from "react-icons/fi";
import AttendanceChart from "../../components/dashboard/AttendanceChart.jsx";
import RecentTasks from "../../components/dashboard/RecentTasks.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import TaskChart from "../../components/dashboard/TaskChart.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";

const iconMap = {
  attendance: FiUserCheck,
  leave: FiCalendar,
  projects: FiBriefcase,
  tasks: FiCheckSquare,
};

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      const [statsData, taskData, attendanceData] = await Promise.all([
        apiFetch("/api/dashboard/stats"),
        apiFetch("/api/tasks"),
        apiFetch("/api/attendance")
      ]);
      setStats(statsData);
      setTasks(taskData);
      setAttendance(attendanceData);
    } catch (err) {
      console.error("Failed to load employee dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeData();
  }, []);

  // Format Task Chart
  const taskChartData = useMemo(() => {
    const totalTasks = tasks.length || 1;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
    const pendingTasks = tasks.filter((t) => t.status === "pending").length;
    const blockedTasks = tasks.filter((t) => t.status === "blocked").length;

    return [
      { name: "Completed", value: Math.round((completedTasks / totalTasks) * 100) },
      { name: "In Progress", value: Math.round((inProgressTasks / totalTasks) * 100) },
      { name: "Pending", value: Math.round((pendingTasks / totalTasks) * 100) },
      { name: "Blocked", value: Math.round((blockedTasks / totalTasks) * 100) },
    ];
  }, [tasks]);

  // Format Recent Tasks
  const recentTasksData = useMemo(() => {
    return tasks.slice(0, 5).map((t) => ({
      id: t.id ? t.id.substring(t.id.length - 8).toUpperCase() : "TASK",
      title: t.title,
      dueDate: t.due_date,
      assignedTo: t.assignee_name || "Self",
      priority: "Medium",
      status: t.status === "in-progress" ? "In Progress" : t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : "Pending",
    }));
  }, [tasks]);

  // Format Attendance Chart
  const attendanceChartData = useMemo(() => {
    return attendance.slice(0, 6).reverse().map((att) => ({
      month: att.date ? att.date.substring(5) : "", // MM-DD
      present: att.status === "present" ? 8 : 0,
      remote: att.status === "remote" ? 8 : 0,
    }));
  }, [attendance]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading personal workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee Dashboard"
        title="My Work Hub"
        description="View assigned tasks, attendance, leave balance, and current project workload."
        actions={
          <button className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats?.statCards ? (
          stats.statCards.map((card) => (
            <StatCard key={card.label} {...card} icon={iconMap[card.icon]} />
          ))
        ) : (
          <p className="text-sm text-slate-400">Loading stats...</p>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <AttendanceChart data={attendanceChartData.length ? attendanceChartData : undefined} />
        <TaskChart data={taskChartData} />
      </section>

      <RecentTasks data={recentTasksData} />
    </div>
  );
}
