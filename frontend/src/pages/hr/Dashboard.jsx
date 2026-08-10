import { useState, useEffect } from "react";
import { FiCalendar, FiCreditCard, FiDownload, FiUserCheck, FiUsers } from "react-icons/fi";
import AttendanceChart from "../../components/dashboard/AttendanceChart.jsx";
import RecentEmployees from "../../components/dashboard/RecentEmployees.jsx";
import RecentTasks from "../../components/dashboard/RecentTasks.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import TaskChart from "../../components/dashboard/TaskChart.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import api from "../../lib/api.js";

const iconMap = {
  attendance: FiUserCheck,
  employees: FiUsers,
  leave: FiCalendar,
  payroll: FiCreditCard,
};

const staticStatCards = {
  hr: [
    { label: "Active Employees", value: "0", description: "Enrolled in payroll", icon: "employees" },
    { label: "Today Attendance", value: "0%", description: "Staff checked in today", icon: "attendance" },
    { label: "Pending Leaves", value: "0", description: "Requests needing review", icon: "leave" },
    { label: "Payroll Run Status", value: "Draft", description: "Current monthly cycle status", icon: "payroll" }
  ]
};

export default function HRDashboard() {
  const [cards, setCards] = useState(staticStatCards.hr);
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
            const merged = staticStatCards.hr.map(staticCard => {
              const dynamicCard = res.data.statCards.find(c => c.label === staticCard.label);
              return dynamicCard ? { ...staticCard, value: dynamicCard.value } : staticCard;
            });
            setCards(merged);
          }
        }
      } catch (err) {
        console.error("Failed to load HR backend stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HR"
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
        {cards.map((card) => (
          <StatCard key={card.label} {...card} icon={iconMap[card.icon]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <AttendanceChart data={dashboardData?.attendanceOverview} />
        <TaskChart data={dashboardData?.taskCompletion} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentEmployees data={dashboardData?.recentEmployees} />
        <RecentTasks data={dashboardData?.recentTasks} />
      </section>
    </div>
  );
}
