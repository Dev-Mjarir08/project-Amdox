import { useEffect, useState } from "react";
import { FiPlus, FiCalendar, FiFileText, FiCheck, FiX, FiClock } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";

export default function ApplyLeave() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    type: "Annual",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/leaves");
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError("");
      await apiFetch("/api/leaves", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess("Leave request submitted successfully!");
      setFormData({
        type: "Annual",
        start_date: "",
        end_date: "",
        reason: "",
      });
      loadRequests();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Leave balances calculations based on approved leaves
  const getApprovedDaysCount = (type) => {
    return requests
      .filter((r) => r.type === type && r.status === "approved")
      .reduce((acc, r) => {
        const start = new Date(r.start_date);
        const end = new Date(r.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return acc + diffDays;
      }, 0);
  };

  const leaveBalances = [
    { name: "Annual Leave", type: "Annual", limit: 20, used: getApprovedDaysCount("Annual"), tone: "blue" },
    { name: "Sick Leave", type: "Sick", limit: 10, used: getApprovedDaysCount("Sick"), tone: "rose" },
    { name: "Casual Leave", type: "Casual", limit: 12, used: getApprovedDaysCount("Casual"), tone: "amber" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Time Off"
        title="Leave Request Portal"
        description="Check your leave balances, submit leave requests, and view the status of your applications."
      />

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Leave Balance Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {leaveBalances.map((bal) => (
          <div key={bal.name} className="erp-panel rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{bal.name}</span>
              <span className="mt-2 block text-2xl font-black text-slate-900 dark:text-white">
                {bal.limit - bal.used} <span className="text-xs font-medium text-slate-400">days left</span>
              </span>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-1.5 rounded-full ${
                    bal.tone === "blue" ? "bg-primary" : bal.tone === "rose" ? "bg-danger" : "bg-warning"
                  }`}
                  style={{ width: `${Math.min((bal.used / bal.limit) * 100, 100)}%` }}
                />
              </div>
              <span className="mt-1.5 block text-right text-[10px] font-semibold text-slate-400">
                {bal.used} of {bal.limit} days used
              </span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Leave Request Form */}
        <section className="erp-panel rounded-xl p-6">
          <h3 className="text-base font-bold text-slate-950 dark:text-white">Apply for Leave</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Submit dates and details for approval.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Leave Type</span>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Casual">Casual Leave</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Start Date</span>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">End Date</span>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Reason</span>
              <textarea
                required
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                placeholder="Brief reason for your request"
              />
            </label>

            <button
              type="submit"
              disabled={actionLoading}
              className="erp-focus flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              Submit Application
            </button>
          </form>
        </section>

        {/* Request History */}
        <section className="erp-panel overflow-hidden rounded-xl">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/20">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave History</h3>
          </div>
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <p className="text-sm text-slate-400">Loading leave requests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-450 dark:border-slate-800">
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Reason</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                        You have not submitted any leave requests.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {req.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          <div>
                            <span className="block font-semibold">{req.start_date}</span>
                            <span className="text-xs text-slate-400">to {req.end_date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate dark:text-slate-400">
                          {req.reason}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            req.status === "approved"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                              : req.status === "rejected"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          }`}>
                            {req.status === "approved" ? (
                              <>Approved</>
                            ) : req.status === "rejected" ? (
                              <>Rejected</>
                            ) : (
                              <>Pending</>
                            )}
                          </span>
                          {req.approved_by_name && (
                            <span className="block text-[10px] text-slate-400">by {req.approved_by_name}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
