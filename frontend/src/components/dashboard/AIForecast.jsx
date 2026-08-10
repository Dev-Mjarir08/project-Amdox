import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AIForecast({ data }) {
  const chartData = data?.trend || [];
  const confidence = data?.confidence || "N/A";
  const currentVal = data?.current || 0;
  const predictedVal = data?.predicted || 0;
  const changePct = currentVal > 0 ? Math.round(((predictedVal - currentVal) / currentVal) * 100) : 0;

  return (
    <article className="erp-card">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Demand & Stockout Forecast</h3>
          <p className="mt-0.5 text-xs text-slate-500">v2.0 Predictive Neural Trend Analysis</p>
        </div>
        <div className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-extrabold text-primary border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50">
          Confidence: {confidence}
        </div>
      </header>

      <div className="h-44">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No Data Available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2563EB"
                strokeWidth={2.5}
                name="Actual Stock Level"
                dot={{ fill: '#2563EB', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="4 4"
                name="AI Predicted Curve"
                dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-200/70 dark:bg-slate-800/60 dark:border-slate-800">
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Laptop Equipment Demand Forecast</p>
          <p className="mt-0.5 text-xs font-black text-slate-900 dark:text-white">
            Current: {currentVal} units → Predicted: {predictedVal} units ({changePct >= 0 ? "+" : ""}{changePct}%)
          </p>
        </div>
      </div>
    </article>
  );
}
