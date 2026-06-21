const statusClasses = {
  Active: "bg-emerald-50 text-success ring-emerald-100 dark:bg-emerald-950/35 dark:text-emerald-300 dark:ring-emerald-900/60",
  "On Leave": "bg-amber-50 text-warning ring-amber-100 dark:bg-amber-950/35 dark:text-amber-300 dark:ring-amber-900/60",
  Remote: "bg-cyan-50 text-accent ring-cyan-100 dark:bg-cyan-950/35 dark:text-cyan-300 dark:ring-cyan-900/60",
};

export default function RecentEmployees({ data = [] }) {
  return (
    <section className="erp-panel rounded-xl">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 p-5 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Recent Employees</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Latest employee records
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/80 text-left dark:divide-slate-800">
          <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 font-bold">Employee Name</th>
              <th className="px-5 py-3 font-bold">Department</th>
              <th className="px-5 py-3 font-bold">Role</th>
              <th className="px-5 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/40 dark:divide-slate-800 dark:bg-slate-900/20">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">
                  No recent employee records.
                </td>
              </tr>
            ) : (
              data.map((employee) => (
                <tr key={employee.id} className="transition hover:bg-slate-50/90 dark:hover:bg-slate-800/45">
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {employee.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {employee.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{employee.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {employee.department}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {employee.role}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ${
                        statusClasses[employee.status] ?? statusClasses.Active
                      }`}
                    >
                      {employee.status}
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
