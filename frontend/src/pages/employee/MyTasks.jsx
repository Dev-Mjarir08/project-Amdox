import { useEffect, useState } from "react";
import { FiCheckSquare, FiCalendar, FiClock, FiAlertCircle, FiCheck } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/tasks");
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setError("");
      await apiFetch(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setSuccess("Task status updated!");
      loadTasks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const statuses = [
    { key: "pending", label: "Pending", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350" },
    { key: "in-progress", label: "In Progress", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
    { key: "blocked", label: "Blocked", color: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
    { key: "completed", label: "Completed", color: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Work assignments"
        title="My Tasks"
        description="View and update status for tasks assigned to you in active sprints and operations."
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

      {loading ? (
        <div className="erp-panel flex h-60 items-center justify-center rounded-xl">
          <p className="text-sm font-semibold text-slate-500">Loading your tasks...</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.length === 0 ? (
            <div className="erp-panel col-span-full py-12 text-center text-sm text-slate-400">
              No tasks currently assigned to you. Enjoy your day!
            </div>
          ) : (
            tasks.map((task) => (
              <article key={task.id} className="erp-panel rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-650 dark:bg-slate-850 dark:text-slate-350">
                      <FiCheckSquare className="h-5 w-5" />
                    </span>
                    
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`h-8 rounded-lg px-2.5 text-xs font-bold transition border-none cursor-pointer focus:ring-2 focus:ring-primary/20 ${
                        task.status === "completed"
                          ? "bg-green-55 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                          : task.status === "blocked"
                          ? "bg-red-50 text-red-750 dark:bg-red-950/40 dark:text-red-450"
                          : task.status === "in-progress"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold text-slate-900 dark:text-white">{task.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {task.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-3 flex items-center justify-between dark:border-slate-850">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Project: <span className="font-bold text-primary">{task.project_name || "General"}</span>
                  </span>
                  
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <FiCalendar className="h-3.5 w-3.5" />
                    Due {task.due_date || "No limit"}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
