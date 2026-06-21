import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AttendanceChart({ data = [] }) {
  const hasData = data && data.length > 0;

  return (
    <section className="erp-panel rounded-xl p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Attendance Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monthly workforce availability
          </p>
        </div>
      </div>
      {!hasData ? (
        <div className="flex h-80 items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-sm text-slate-405 text-slate-400">No attendance statistics available.</p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="presentFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="remoteFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B" }} />
              <Tooltip
                contentStyle={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  boxShadow: "0 12px 32px -24px rgba(15, 23, 42, 0.5)",
                }}
              />
              <Legend iconType="circle" />
              <Area
                type="monotone"
                dataKey="present"
                name="Present"
                stroke="#2563EB"
                strokeWidth={3}
                fill="url(#presentFill)"
              />
              <Area
                type="monotone"
                dataKey="remote"
                name="Remote"
                stroke="#0EA5E9"
                strokeWidth={3}
                fill="url(#remoteFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
