import { useEffect, useState } from "react";
import { FiPlus, FiCreditCard, FiCheck, FiRefreshCw, FiDollarSign } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";

export default function Payroll() {
  const [payroll, setPayroll] = useState([]);
  const [month, setMonth] = useState("2026-06");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPayroll = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/payroll");
      // Filter by selected month
      setPayroll(data.filter((p) => p.month === month));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, [month]);

  const handleGeneratePayroll = async () => {
    try {
      setActionLoading(true);
      setError("");
      await apiFetch("/api/payroll/generate", {
        method: "POST",
        body: JSON.stringify({ month }),
      });
      setSuccess(`Payroll for ${month} generated successfully!`);
      loadPayroll();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setError("");
      await apiFetch(`/api/payroll/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setSuccess("Payment status updated!");
      loadPayroll();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPayout = payroll.reduce((acc, p) => acc + (p.status === "paid" ? p.total_salary : 0), 0);
  const pendingPayout = payroll.reduce((acc, p) => acc + (p.status !== "paid" ? p.total_salary : 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance operations"
        title="Payroll Processing"
        description="Calculate employee monthly payouts, generate salary slips, and mark direct deposit payment releases."
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

      {/* Overview Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="erp-panel rounded-xl p-5">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Processed Payments</span>
          <span className="mt-2 block text-2xl font-black text-slate-900 dark:text-white">
            ${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="erp-panel rounded-xl p-5">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Payments</span>
          <span className="mt-2 block text-2xl font-black text-slate-900 dark:text-white">
            ${pendingPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="erp-panel rounded-xl p-5">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Total Count</span>
          <span className="mt-2 block text-2xl font-black text-slate-900 dark:text-white">
            {payroll.length} <span className="text-xs font-medium text-slate-400">records</span>
          </span>
        </div>
      </section>

      {/* Control Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-500">Payroll Month:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleGeneratePayroll}
          disabled={actionLoading}
          className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
        >
          <FiRefreshCw className={`h-4 w-4 ${actionLoading ? "animate-spin" : ""}`} />
          Generate Payroll List
        </button>
      </div>

      {/* Payroll Records */}
      {loading ? (
        <div className="erp-panel flex h-60 items-center justify-center rounded-xl">
          <p className="text-sm font-semibold text-slate-500">Loading payroll entries...</p>
        </div>
      ) : (
        <div className="erp-panel overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/20">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Salary Summary</th>
                  <th className="px-6 py-4">Allowance</th>
                  <th className="px-6 py-4">Deduction</th>
                  <th className="px-6 py-4">Net Payout</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payroll.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                      No payroll lists generated for {month}. Click "Generate Payroll List" to create records.
                    </td>
                  </tr>
                ) : (
                  payroll.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-650 dark:bg-slate-850">
                            {p.initials}
                          </span>
                          <div>
                            <span className="block text-sm font-bold text-slate-900 dark:text-white">{p.name}</span>
                            <span className="block text-xs text-slate-400">{p.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-350">
                        ${p.basic_salary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                        +${p.allowance?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-500">
                        -${p.deduction?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">
                        ${p.total_salary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.status === "paid"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                              : p.status === "processing"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          }`}
                        >
                          {p.status === "paid" ? "Paid" : p.status === "processing" ? "Processing" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.status !== "paid" ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(p.id, "processing")}
                              className="erp-focus inline-flex h-8 items-center justify-center rounded-lg bg-blue-50 px-2 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400"
                            >
                              Process
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(p.id, "paid")}
                              className="erp-focus inline-flex h-8 items-center justify-center rounded-lg bg-green-55 bg-green-50 px-2 text-xs font-bold text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                            >
                              <FiCheck className="h-3.5 w-3.5 mr-0.5" />
                              Release
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
