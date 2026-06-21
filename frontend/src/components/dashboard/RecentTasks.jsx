const priorityClasses = {
  High: "bg-red-50 text-danger ring-red-100 dark:bg-red-950/35 dark:text-red-300 dark:ring-red-900/60",
  Medium:
    "bg-amber-50 text-warning ring-amber-100 dark:bg-amber-950/35 dark:text-amber-300 dark:ring-amber-900/60",
  Low: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
};

const statusClasses = {
  Completed:
    "bg-emerald-50 text-success ring-emerald-100 dark:bg-emerald-950/35 dark:text-emerald-300 dark:ring-emerald-900/60",
  "In Progress":
    "bg-blue-50 text-primary ring-blue-100 dark:bg-blue-950/35 dark:text-blue-300 dark:ring-blue-900/60",
  "In Review":
    "bg-cyan-50 text-accent ring-cyan-100 dark:bg-cyan-950/35 dark:text-cyan-300 dark:ring-cyan-900/60",
  Pending:
    "bg-amber-50 text-warning ring-amber-100 dark:bg-amber-950/35 dark:text-amber-300 dark:ring-amber-900/60",
  Blocked: "bg-red-50 text-danger ring-red-100 dark:bg-red-950/35 dark:text-red-300 dark:ring-red-900/60",
};

export default function RecentTasks({ data = [] }) {
  return (
    <section className="erp-panel rounded-xl">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 p-5 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Recent Tasks</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Prioritized operational work
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/80 text-left dark:divide-slate-800">
          <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 font-bold">Task</th>
              <th className="px-5 py-3 font-bold">Assigned To</th>
              <th className="px-5 py-3 font-bold">Priority</th>
              <th className="px-5 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/40 dark:divide-slate-800 dark:bg-slate-900/20">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">
                  No recent tasks found.
                </td>
              </tr>
            ) : (
              data.map((task) => (
                <tr key={task.id} className="transition hover:bg-slate-50/90 dark:hover:bg-slate-800/45">
                  <td className="min-w-72 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {task.id} · Due {task.dueDate}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {task.assignedTo}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ${priorityClasses[task.priority] ?? priorityClasses.Low
                        }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ${statusClasses[task.status] ?? statusClasses.Pending
                        }`}
                    >
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
