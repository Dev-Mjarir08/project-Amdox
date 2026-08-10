import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function FinanceOverview({ data }) {
  const chartData = data?.trend || [];
  const totalRevenue = data?.totalRevenue || 0;
  const totalExpense = data?.totalExpense || 0;

  return (
    <article className="erp-card">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Financial Overview & Operating Ledger</h3>
      <p className="mt-0.5 text-xs text-slate-500">Revenue vs Operating Expenses (Rolling 6 Months)</p>

      <div className="mt-4 h-48">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No Data Available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Bar dataKey="revenue" fill="#2563EB" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#DC2626" name="Operating Expense (₹)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200/60 dark:bg-emerald-950/30 dark:border-emerald-800/40">
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Total Verified Revenue</p>
          <p className="mt-0.5 text-base font-black text-emerald-800 dark:text-emerald-300">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-rose-50 p-3 border border-rose-200/60 dark:bg-rose-950/30 dark:border-rose-800/40">
          <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400">Total Operating Expenses</p>
          <p className="mt-0.5 text-base font-black text-rose-800 dark:text-rose-300">
            ₹{totalExpense.toLocaleString()}
          </p>
        </div>
      </div>
    </article>
  );
}
