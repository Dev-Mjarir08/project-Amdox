import { useEffect, useState } from "react";
import { FiBarChart2, FiBriefcase, FiCheckSquare, FiDownload, FiUserCheck } from "react-icons/fi";
import ProjectChart from "../../components/dashboard/ProjectChart.jsx";
import RecentEmployees from "../../components/dashboard/RecentEmployees.jsx";
import RecentTasks from "../../components/dashboard/RecentTasks.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import TaskChart from "../../components/dashboard/TaskChart.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";

const iconMap = {
  projects: FiBriefcase,
  reports: FiBarChart2,
  tasks: FiCheckSquare,
  team: FiUserCheck,
};

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadManagerData = async () => {
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
    } catch (err) {
      console.error("Failed to load Manager dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerData();
  }, []);

  const managerStatCards = stats?.statCards || [
    { label: "Active Projects", value: "0", change: "+0 total", trend: "up", icon: "projects", tone: "blue" },
    { label: "Team Members", value: "0", change: "+0 joined", trend: "up", icon: "team", tone: "emerald" },
    { label: "Pending Tasks", value: "0", change: "Stable", trend: "down", icon: "tasks", tone: "amber" },
    { label: "Blocked Work", value: "0", change: "+0 alert", trend: "up", icon: "reports", tone: "rose" },
  ];

  // Format Project Chart
  const projectChartData = projects.map((p) => ({
    name: p.name.split(" ")[0],
    progress: p.progress,
  }));

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading Manager dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manager Dashboard"
        title="Delivery Command Center"
        description="Keep project progress, team capacity, and priority tasks aligned from one workspace."
        actions={
          <button className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {managerStatCards.map((card) => (
          <StatCard key={card.label} {...card} icon={iconMap[card.icon]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <ProjectChart data={projectChartData.length ? projectChartData : undefined} />
        <RecentTasks data={recentTasksData} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <TaskChart data={taskChartData} />
        <RecentEmployees data={recentEmployeesData} />
      </section>
    </div>
  );
}
