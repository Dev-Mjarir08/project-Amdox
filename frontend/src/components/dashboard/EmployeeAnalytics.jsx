import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function EmployeeAnalytics() {
  const data = [
    { name: 'IT', value: 420 },
    { name: 'HR', value: 120 },
    { name: 'Finance', value: 90 },
    { name: 'Sales', value: 300 },
    { name: 'Marketing', value: 150 },
  ];

  const totalEmployees = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <article className="erp-panel rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-600">Workforce Overview</h3>
      <p className="mt-1 text-xs text-slate-400">Department distribution</p>

      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value, name) => [`${value} (${((value / totalEmployees) * 100).toFixed(1)}%)`, name]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-xs text-blue-600 dark:text-blue-400">Total Employees</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{totalEmployees}</p>
        </div>
      </div>
    </article>
  );
}
