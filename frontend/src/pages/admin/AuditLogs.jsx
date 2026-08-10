import { useState, useEffect } from "react";
import { FiActivity, FiSearch, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import api from "../../lib/api.js";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page, searchTerm]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/audit", {
        params: { page, limit: 25, search: searchTerm }
      });
      if (res.data) {
        setLogs(res.data.logs || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset page on search
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Security"
        title="Audit Logs"
        description="View enterprise activity logs, sign-in attempts, and database mutations."
      />

      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, resource..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading audit records...</div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Timestamp</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Operator</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Action</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Resource</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-slate-500">No activity logged matching terms</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <div>
                            <p>{log.user?.name || "System"}</p>
                            <p className="text-xs text-slate-400">{log.user?.email || ""}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold">{log.resource}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">{log.details || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-xs text-slate-500">Total {total} entries</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <FiArrowLeft />
                  </button>
                  <span className="text-sm font-semibold py-1.5 px-3">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
