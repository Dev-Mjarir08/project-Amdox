import { useState, useEffect } from "react";
import { FiBriefcase, FiCalendar, FiCheckSquare, FiDownload, FiUserCheck } from "react-icons/fi";
import AttendanceChart from "../../components/dashboard/AttendanceChart.jsx";
import RecentTasks from "../../components/dashboard/RecentTasks.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import TaskChart from "../../components/dashboard/TaskChart.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import api from "../../lib/api.js";

const iconMap = {
  attendance: FiUserCheck,
  leave: FiCalendar,
  projects: FiBriefcase,
  tasks: FiCheckSquare,
};

const staticStatCards = {
  employee: [
    { label: "My Tasks", value: "0", description: "Assigned pending tasks", icon: "tasks" },
    { label: "My Projects", value: "0", description: "Active projects involved", icon: "projects" },
    { label: "Attendance Rate", value: "0%", description: "Present days ratio", icon: "attendance" },
    { label: "Leave Balance", value: "0 Days", description: "Available annual leave", icon: "leave" }
  ]
};

export default function EmployeeDashboard() {
  const [cards, setCards] = useState(staticStatCards.employee);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/dashboard/stats");
        if (res.data) {
          setDashboardData(res.data);
          if (Array.isArray(res.data.statCards)) {
            const merged = staticStatCards.employee.map(staticCard => {
              const dynamicCard = res.data.statCards.find(c => c.label === staticCard.label);
              return dynamicCard ? { ...staticCard, value: dynamicCard.value } : staticCard;
            });
            setCards(merged);
          }
        }
      } catch (err) {
        console.error("Failed to load Employee backend stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee"
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
        {cards.map((card) => (
          <StatCard key={card.label} {...card} icon={iconMap[card.icon]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <AttendanceChart data={dashboardData?.attendanceOverview} />
        <TaskChart data={dashboardData?.taskCompletion} />
      </section>

      <RecentTasks data={dashboardData?.recentTasks} />
    </div>
  );
}
