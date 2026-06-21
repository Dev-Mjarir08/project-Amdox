import { useEffect, useState } from "react";
import { FiBriefcase, FiCheckSquare, FiDownload, FiPackage, FiUsers } from "react-icons/fi";
import AttendanceChart from "../../components/dashboard/AttendanceChart.jsx";
import ProjectChart from "../../components/dashboard/ProjectChart.jsx";
import RecentEmployees from "../../components/dashboard/RecentEmployees.jsx";
import RecentTasks from "../../components/dashboard/RecentTasks.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import TaskChart from "../../components/dashboard/TaskChart.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";

const iconMap = {
  employees: FiUsers,
  inventory: FiPackage,
  projects: FiBriefcase,
  tasks: FiCheckSquare,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsData = await apiFetch("/api/dashboard/stats");
      setStats(statsData);

      const empData = await apiFetch("/api/employees");
      setEmployees(empData);

      const taskData = await apiFetch("/api/tasks");
      setTasks(taskData);

      const projData = await apiFetch("/api/projects");
      setProjects(projData);

      const attendanceData = await apiFetch("/api/attendance");
      setAttendance(attendanceData);
    } catch (err) {
      console.error("Error loading dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Format Project Chart Data
  const projectChartData = projects.map((p) => ({
    name: p.name.split(" ")[0], // abbreviation
    progress: p.progress,
  }));

  // Format Task Chart Data
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

  // Format Recent Tasks Data
  const recentTasksData = tasks.slice(0, 5).map((t) => ({
    id: t.id.substring(t.id.length - 8).toUpperCase(), // format ID nicely
    title: t.title,
    dueDate: t.due_date,
    assignedTo: t.assignee_name,
    priority: "Medium",
    status: t.status === "in-progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1),
  }));

  // Format Recent Employees Data
  const recentEmployeesData = employees.slice(0, 5).map((e) => ({
    id: e.employeeId || "EMP-SYSTEM",
    name: e.name,
    department: e.department,
    role: e.title,
    status: e.status === "active" ? "Active" : "On Leave",
  }));

  // Format Attendance Chart Data by grouping
  // Simple grouping by date for last 6 records
  const attendanceChartData = attendance.slice(0, 6).reverse().map((att) => ({
    month: att.date.substring(5), // MM-DD
    present: attendance.filter((a) => a.date === att.date && a.status === "present").length * 150 + 800, // scaled for chart look
    remote: attendance.filter((a) => a.date === att.date && a.status === "remote").length * 80 + 150,
  }));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading operations overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Enterprise Operations Overview"
        description="Monitor people, delivery, inventory, and operational workload across AMDOX ERP."
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

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <ProjectChart data={projectChartData.length ? projectChartData : undefined} />
        <RecentTasks data={recentTasksData} />
      </section>

      <RecentEmployees data={recentEmployeesData} />
    </div>
  );
}
