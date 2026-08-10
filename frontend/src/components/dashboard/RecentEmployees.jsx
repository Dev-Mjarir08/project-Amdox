export default function RecentEmployees({ data = [] }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'erp-badge-active';
      case 'On Leave': return 'erp-badge-pending';
      case 'Remote': return 'erp-badge-completed';
      default: return 'erp-badge-active';
    }
  };

  return (
    <section className="erp-card p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 p-4 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Staff & Team Members</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Latest onboarded employee records
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="erp-table-header">
              <th className="px-4 py-3">Employee Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((employee) => (
              <tr key={employee.id} className="erp-table-row">
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {employee.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {employee.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">{employee.id}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                  {employee.department}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                  {employee.role}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={getStatusBadge(employee.status)}>
                    {employee.status}
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
