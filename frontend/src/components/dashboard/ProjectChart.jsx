import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ProjectChart({ data = [] }) {
  const hasData = data && data.length > 0;

  return (
    <section className="erp-panel rounded-xl p-5">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-950 dark:text-white">Project Progress</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Delivery progress by function
        </p>
      </div>
      {!hasData ? (
        <div className="flex h-72 items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-sm text-slate-405 text-slate-400">No project progress statistics available.</p>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748B" }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B" }}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  boxShadow: "0 12px 32px -24px rgba(15, 23, 42, 0.5)",
                }}
              />
              <Bar dataKey="progress" name="Progress" radius={[8, 8, 0, 0]} fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
