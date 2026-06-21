import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const colors = ["#22C55E", "#2563EB", "#F59E0B", "#EF4444"];

export default function TaskChart({ data = [] }) {
  const hasData = data && data.length > 0 && data.some((item) => item.value > 0);

  return (
    <section className="erp-panel rounded-xl p-5">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-950 dark:text-white">Task Completion</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Work distribution by status
        </p>
      </div>
      {!hasData ? (
        <div className="flex h-64 items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-sm text-slate-405 text-slate-400">No task statistics available.</p>
        </div>
      ) : (
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_0.95fr]">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={92}
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
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 12px 32px -24px rgba(15, 23, 42, 0.5)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="truncate text-sm font-medium text-slate-600 dark:text-slate-300">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
