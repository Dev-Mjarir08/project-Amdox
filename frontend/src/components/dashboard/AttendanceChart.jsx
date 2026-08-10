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
  return (
    <section className="erp-card">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Attendance & Staff Capacity Overview
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Monthly Presenteeism & Remote Working Ratios
          </p>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="presentFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="remoteFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
            <Area
              type="monotone"
              dataKey="present"
              name="Present"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#presentFill)"
            />
            <Area
              type="monotone"
              dataKey="remote"
              name="Remote"
              stroke="#06B6D4"
              strokeWidth={2.5}
              fill="url(#remoteFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
