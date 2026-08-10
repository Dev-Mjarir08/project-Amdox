export default function SystemStatus() {
  return (
    <article className="erp-panel rounded-xl p-4">
      <h4 className="text-sm font-semibold text-slate-600">System Status</h4>
      <ul className="mt-3 text-sm text-slate-500 space-y-2">
        <li className="flex items-center justify-between">
          <span>API</span>
          <span className="text-emerald-600">Online</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Database</span>
          <span className="text-emerald-600">Healthy</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Last Backup</span>
          <span className="text-slate-500">2 hours ago</span>
        </li>
      </ul>
    </article>
  );
}
