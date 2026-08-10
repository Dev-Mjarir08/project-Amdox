import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
const colors = ["#16A34A", "#2563EB", "#F59E0B", "#DC2626"];

export default function TaskChart({ data = [] }) {
  return (
    <section className="erp-card">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Task Breakdown & Workload Distribution</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Operational task completion status across active projects
        </p>
      </div>
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_0.95fr]">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={88}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2.5">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                  {item.name}
                </span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
