import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InventoryIntelligence({ data }) {
  const chartData = data?.overview || [];
  const lowStock = data?.lowStock || 0;
  const outOfStock = data?.outOfStock || 0;
  const healthy = data?.healthy || 0;

  return (
    <article className="erp-panel rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-600">Inventory Intelligence</h3>
      <p className="mt-1 text-xs text-slate-400">Stock levels and turnover</p>

      <div className="mt-4 h-40">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No Data Available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="stock" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Stock" />
              <Area type="monotone" dataKey="turnover" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Turnover" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
          <p className="text-xs text-amber-600 dark:text-amber-400">Low Stock</p>
          <p className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-300">{lowStock}</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-900/20">
          <p className="text-xs text-rose-600 dark:text-rose-400">Out of Stock</p>
          <p className="mt-1 text-lg font-bold text-rose-700 dark:text-rose-300">{outOfStock}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Healthy</p>
          <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">{healthy}</p>
        </div>
      </div>
    </article>
  );
}
