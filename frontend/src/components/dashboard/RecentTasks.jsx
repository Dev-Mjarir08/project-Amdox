const priorityClasses = {
  High: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Low: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'Completed': return 'erp-badge-active';
    case 'In Progress': return 'erp-badge-completed';
    case 'Pending': return 'erp-badge-pending';
    case 'Blocked': return 'erp-badge-rejected';
    default: return 'erp-badge-inactive';
  }
};

export default function RecentTasks({ data = [] }) {
  return (
    <section className="erp-card p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 p-4 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Operational Tasks</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Prioritized work assignments & delivery deadlines
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="erp-table-header">
              <th className="px-4 py-3">Task Details</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((task) => (
              <tr key={task.id} className="erp-table-row">
                <td className="min-w-64 px-4 py-3">
                  <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
                  <p className="text-[11px] font-mono text-slate-500">
                    {task.id} · Due: {task.dueDate}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                  {task.assignedTo}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${priorityClasses[task.priority] ?? priorityClasses.Low}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={getStatusBadge(task.status)}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
