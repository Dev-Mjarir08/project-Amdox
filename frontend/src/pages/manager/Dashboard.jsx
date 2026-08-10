import { useState, useEffect } from "react";
import { FiBarChart2, FiBriefcase, FiCheckSquare, FiDownload, FiUserCheck } from "react-icons/fi";
import ProjectChart from "../../components/dashboard/ProjectChart.jsx";
import RecentEmployees from "../../components/dashboard/RecentEmployees.jsx";
import RecentTasks from "../../components/dashboard/RecentTasks.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import TaskChart from "../../components/dashboard/TaskChart.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import api from "../../lib/api.js";

const iconMap = {
  projects: FiBriefcase,
  reports: FiBarChart2,
  tasks: FiCheckSquare,
  team: FiUserCheck,
};

const staticStatCards = {
  manager: [
    { label: "Active Projects", value: "0", description: "Owned deliverables", icon: "projects" },
    { label: "Pending Tasks", value: "0", description: "Milestones to complete", icon: "tasks" },
    { label: "Team Members", value: "0", description: "Direct reports active", icon: "team" },
    { label: "Reports Generated", value: "0", description: "Saved analytical metrics", icon: "reports" }
  ]
};

export default function ManagerDashboard() {
  const [cards, setCards] = useState(staticStatCards.manager);
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
            const merged = staticStatCards.manager.map(staticCard => {
              const dynamicCard = res.data.statCards.find(c => c.label === staticCard.label);
              return dynamicCard ? { ...staticCard, value: dynamicCard.value } : staticCard;
            });
            setCards(merged);
          }
        }
      } catch (err) {
        console.error("Failed to load Manager backend stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manager"
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
        {cards.map((card) => (
          <StatCard key={card.label} {...card} icon={iconMap[card.icon]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <ProjectChart data={dashboardData?.projectProgress} />
        <RecentTasks data={dashboardData?.recentTasks} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <TaskChart data={dashboardData?.taskCompletion} />
        <RecentEmployees data={dashboardData?.recentEmployees} />
      </section>
    </div>
  );
}
