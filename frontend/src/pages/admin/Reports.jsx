import { useEffect, useState } from "react";
import { FiTrendingUp, FiCheckSquare, FiUsers, FiDollarSign } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import AttendanceChart from "../../components/dashboard/AttendanceChart.jsx";
import ProjectChart from "../../components/dashboard/ProjectChart.jsx";
import TaskChart from "../../components/dashboard/TaskChart.jsx";
import { apiFetch } from "../../utils/api.js";

export default function Reports() {
  const [stats, setStats] = useState({
    employees: 0,
    projects: 0,
    tasks: 0,
    inventory: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const emp = await apiFetch("/api/employees");
        const proj = await apiFetch("/api/projects");
        const task = await apiFetch("/api/tasks");
        const inv = await apiFetch("/api/inventory");

        setStats({
          employees: emp.length,
          projects: proj.length,
          tasks: task.length,
          inventory: inv.reduce((acc, i) => acc + i.stock, 0),
        });
      } catch (err) {
        console.error("Failed to load reports stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const metricCards = [
    { label: "Direct Hires", value: stats.employees, subtitle: "Active workforce directory", icon: FiUsers, tone: "blue" },
    { label: "Ongoing Deliveries", value: stats.projects, subtitle: "Tracked active scopes", icon: FiTrendingUp, tone: "cyan" },
    { label: "Allocated Work", value: stats.tasks, subtitle: "Sprint execution items", icon: FiCheckSquare, tone: "amber" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Intelligence"
        title="Analytical Reports"
        description="Aggregate real-time metrics across attendance logs, task completion, and active deliverables."
      />

      {/* Metrics Row */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="erp-panel h-24 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-3">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="erp-panel rounded-xl p-5 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</span>
                  <span className="mt-1 block text-2xl font-black text-slate-900 dark:text-white">{card.value}</span>
                  <span className="text-[10px] text-slate-405 text-slate-400">{card.subtitle}</span>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            );
          })}
        </section>
      )}

      {/* Charts Grid */}
      <section className="grid gap-6 xl:grid-cols-2">
        <AttendanceChart />
        <TaskChart />
      </section>

      <section className="grid gap-6 max-w-xl">
        <ProjectChart />
      </section>
    </div>
  );
}
