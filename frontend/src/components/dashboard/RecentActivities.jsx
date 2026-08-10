export default function RecentActivities({ data = [] }) {
  return (
    <article className="erp-panel rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-600">Recent Activity</h3>
      <p className="mt-1 text-xs text-slate-400">Audit trail and recent events</p>

      <ul className="mt-4 space-y-3 text-sm text-slate-500">
        {data.length === 0 ? (
          <li className="text-xs text-slate-400">No recent activities.</li>
        ) : (
          data.map((a, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">✓</span>
              <span>{a}</span>
            </li>
          ))
        )}
      </ul>
    </article>
  );
}
