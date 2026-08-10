import { useState, useEffect } from "react";
import {
  FiBriefcase,
  FiCheckSquare,
  FiDownload,
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiUserCheck,
  FiShoppingCart,
} from "react-icons/fi";
import AttendanceChart from "../../components/dashboard/AttendanceChart.jsx";
import ProjectChart from "../../components/dashboard/ProjectChart.jsx";
import RecentEmployees from "../../components/dashboard/RecentEmployees.jsx";
import RecentTasks from "../../components/dashboard/RecentTasks.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import TaskChart from "../../components/dashboard/TaskChart.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import RunForecastModal from "../../components/modals/RunForecastModal.jsx";
import api from "../../lib/api.js";

// new dashboard widgets (scaffolded)
import AIForecast from "../../components/dashboard/AIForecast.jsx";
import FinanceOverview from "../../components/dashboard/FinanceOverview.jsx";
import InventoryIntelligence from "../../components/dashboard/InventoryIntelligence.jsx";
import EmployeeAnalytics from "../../components/dashboard/EmployeeAnalytics.jsx";
import RecentActivities from "../../components/dashboard/RecentActivities.jsx";
import PendingApprovals from "../../components/dashboard/PendingApprovals.jsx";
import NotificationsPanel from "../../components/dashboard/NotificationsPanel.jsx";
import QuickActions from "../../components/dashboard/QuickActions.jsx";
import SystemStatus from "../../components/dashboard/SystemStatus.jsx";

const iconMap = {
  employees: FiUsers,
  inventory: FiPackage,
  projects: FiBriefcase,
  tasks: FiCheckSquare,
  revenue: FiDollarSign,
  expenses: FiCreditCard,
  payroll: FiUserCheck,
  purchaseOrders: FiShoppingCart,
};

const staticStatCards = {
  admin: [
    { label: "Total Employees", value: "0", description: "Active users in system", icon: "employees" },
    { label: "Active Projects", value: "0", description: "Deliveries in progress", icon: "projects" },
    { label: "Tasks Completed", value: "0", description: "Operational tasks done", icon: "tasks" },
    { label: "Inventory Value", value: "₹0", description: "Current inventory valuation", icon: "inventory" }
  ]
};

export default function AdminDashboard() {
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [cards, setCards] = useState(staticStatCards.admin);
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
            // Merge dynamic values with the static configurations to keep descriptions/toggles aligned
            const merged = staticStatCards.admin.map(staticCard => {
              const dynamicCard = res.data.statCards.find(c => c.label === staticCard.label);
              return dynamicCard ? { ...staticCard, value: dynamicCard.value } : staticCard;
            });
            setCards(merged);
          }
        }
      } catch (err) {
        console.error("Failed to load backend stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
        {cards.map((card) => (
          <StatCard key={card.label} {...card} icon={iconMap[card.icon]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AIForecast data={dashboardData?.aiForecast} />
        <FinanceOverview data={dashboardData?.financeOverview} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AttendanceChart data={dashboardData?.attendanceOverview} />
        <TaskChart data={dashboardData?.taskCompletion} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <ProjectChart data={dashboardData?.projectProgress} />
        <RecentTasks data={dashboardData?.recentTasks} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <InventoryIntelligence data={dashboardData?.inventoryIntelligence} />
        <PendingApprovals data={dashboardData?.pendingApprovals} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <EmployeeAnalytics />
        <RecentActivities data={dashboardData?.recentActivities} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.45fr]">
        <RecentEmployees data={dashboardData?.recentEmployees} />
        <div className="space-y-4">
          <NotificationsPanel />
          <QuickActions />
          <SystemStatus />
        </div>
      </section>

      <RunForecastModal
        isOpen={isForecastModalOpen}
        onClose={() => setIsForecastModalOpen(false)}
        onSuccess={() => setIsForecastModalOpen(false)}
      />
    </div>
  );
}
