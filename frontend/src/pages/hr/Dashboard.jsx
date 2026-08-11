import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiCreditCard, FiDownload, FiUserCheck, FiUsers, FiCheck, FiX, FiRefreshCw, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import AttendanceChart from "../../components/dashboard/AttendanceChart.jsx";
import RecentEmployees from "../../components/dashboard/RecentEmployees.jsx";
import RecentTasks from "../../components/dashboard/RecentTasks.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import TaskChart from "../../components/dashboard/TaskChart.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import ApplyLeaveModal from "../../components/modals/ApplyLeaveModal.jsx";
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
    { label: "Today Attendance", value: "0", description: "Staff checked in today", icon: "attendance" },
    { label: "Pending Leaves", value: "0", description: "Requests needing review", icon: "leave" },
    { label: "Payroll Run Status", value: "0% Ready", description: "Current monthly cycle status", icon: "payroll" }
  ]
};

export default function HRDashboard() {
  const navigate = useNavigate();
  const [cards, setCards] = useState(staticStatCards.hr);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Pending Leaves Handler State
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(true);
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/stats");
      if (res.data) {
        const payload = res.data.data || res.data;
        setDashboardData(payload);

        if (Array.isArray(payload.statCards)) {
          const merged = staticStatCards.hr.map(staticCard => {
            const dynamicCard = payload.statCards.find(c =>
              c.label === staticCard.label ||
              (staticCard.label === "Active Employees" && c.label === "Total Employees") ||
              (staticCard.label === "Today Attendance" && c.label === "Present Today") ||
              (staticCard.label === "Pending Leaves" && c.label === "Leave Requests") ||
              (staticCard.label === "Payroll Run Status" && c.label === "Payroll Ready")
            );
            return dynamicCard ? { ...staticCard, value: dynamicCard.value, description: dynamicCard.change || staticCard.description } : staticCard;
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

  const fetchPendingLeaves = async () => {
    try {
      setLeavesLoading(true);
      const res = await api.get("/hr/leave-requests");
      const list = Array.isArray(res.data) ? res.data : (res.data?.data && Array.isArray(res.data.data) ? res.data.data : []);
      const pendingOnly = list.filter(l => (l.status || 'pending').toLowerCase() === 'pending');
      setPendingLeaves(pendingOnly);
    } catch (err) {
      console.error("Failed to fetch pending leaves for HR dashboard:", err);
    } finally {
      setLeavesLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPendingLeaves();
  }, []);

  const handleApproveLeave = async (id) => {
    try {
      toast.info("Approving leave request...");
      await api.post(`/hr/leave-requests/${id}/approve`);
      toast.success("Leave request approved!");
      fetchPendingLeaves();
      fetchStats();
    } catch (err) {
      try {
        await api.put(`/hr/leave-requests/${id}`, { status: 'approved' });
        toast.success("Leave request approved!");
        fetchPendingLeaves();
        fetchStats();
      } catch (e2) {
        toast.error("Failed to approve leave");
      }
    }
  };

  const handleRejectLeave = async (id) => {
    try {
      toast.info("Rejecting leave request...");
      await api.post(`/hr/leave-requests/${id}/reject`);
      toast.success("Leave request rejected!");
      fetchPendingLeaves();
      fetchStats();
    } catch (err) {
      try {
        await api.put(`/hr/leave-requests/${id}`, { status: 'rejected' });
        toast.success("Leave request rejected!");
        fetchPendingLeaves();
        fetchStats();
      } catch (e2) {
        toast.error("Failed to reject leave");
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HR"
        title="People Operations Dashboard"
        description="Track workforce availability, leave workload, payroll readiness, and employee activity."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApplyLeaveModalOpen(true)}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <FiPlus className="h-4 w-4 text-primary" />
              Apply Leave
            </button>
            <button
              onClick={() => navigate('/hr/leave-requests')}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiCalendar className="h-4 w-4" />
              Leave Calendar & Management
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} icon={iconMap[card.icon]} />
        ))}
      </section>

      {/* Pending Leave Requests Handler Widget */}
      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              <FiCalendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pending Leave Approvals Handler</h3>
              <p className="text-xs text-slate-500">Action required: review and approve or reject employee leave requests</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/hr/leave-requests')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View All Leave Requests &rarr;
          </button>
        </div>

        {leavesLoading ? (
          <div className="flex h-32 items-center justify-center gap-2 text-xs text-slate-400">
            <FiRefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading pending leave requests...
          </div>
        ) : pendingLeaves.length === 0 ? (
          <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/30">
            No pending leave applications requiring approval. All requests cleared!
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingLeaves.map((leave) => {
              const name = leave.name || (leave.employee && typeof leave.employee === 'object' ? leave.employee.name : 'Staff Member');
              const initials = leave.initials || (name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U');
              const fromDate = leave.start_date ? String(leave.start_date).split('T')[0] : (leave.fromDate || '-');
              const toDate = leave.end_date ? String(leave.end_date).split('T')[0] : (leave.toDate || '-');
              const leaveType = leave.type || leave.leaveType || 'Leave';
              const reason = leave.reason || 'No reason provided';
              const id = leave.id || leave._id;

              return (
                <div key={id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{name}</p>
                        <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                          {leaveType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    📅 {fromDate} to {toDate}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-2">
                    "{reason}"
                  </p>

                  <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleRejectLeave(id)}
                      className="erp-focus flex-1 inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 text-[11px] font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
                    >
                      <FiX className="h-3.5 w-3.5" /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveLeave(id)}
                      className="erp-focus flex-1 inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-emerald-600 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      <FiCheck className="h-3.5 w-3.5" /> Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <AttendanceChart data={dashboardData?.attendanceOverview} />
        <TaskChart data={dashboardData?.taskCompletion} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentEmployees data={dashboardData?.recentEmployees} />
        <RecentTasks data={dashboardData?.recentTasks} />
      </section>

      <ApplyLeaveModal
        isOpen={isApplyLeaveModalOpen}
        onClose={() => setIsApplyLeaveModalOpen(false)}
        onSuccess={() => {
          fetchPendingLeaves();
          fetchStats();
        }}
      />
    </div>
  );
}
