import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";

const toneClasses = {
  blue: "bg-blue-50 text-primary ring-blue-100 dark:bg-blue-950/35 dark:text-blue-300 dark:ring-blue-900/60",
  cyan: "bg-cyan-50 text-accent ring-cyan-100 dark:bg-cyan-950/35 dark:text-cyan-300 dark:ring-cyan-900/60",
  emerald:
    "bg-emerald-50 text-success ring-emerald-100 dark:bg-emerald-950/35 dark:text-emerald-300 dark:ring-emerald-900/60",
  amber:
    "bg-amber-50 text-warning ring-amber-100 dark:bg-amber-950/35 dark:text-amber-300 dark:ring-amber-900/60",
  rose: "bg-red-50 text-danger ring-red-100 dark:bg-red-950/35 dark:text-red-300 dark:ring-red-900/60",
};

export default function StatCard({ label, value, change, trend = "neutral", icon: Icon, tone }) {
  const TrendIcon = trend === "down" ? FiTrendingDown : FiTrendingUp;
  const trendClass =
    trend === "down"
      ? "text-success bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300"
      : trend === "neutral"
        ? "text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
        : "text-success bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300";

  return (
    <article className="erp-panel group rounded-xl p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        <span
          className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${
            toneClasses[tone] ?? toneClasses.blue
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${trendClass}`}
        >
          {trend !== "neutral" ? <TrendIcon className="h-3.5 w-3.5" /> : null}
          {change}
        </span>
        <span className="text-xs text-slate-400 transition group-hover:text-slate-500 dark:text-slate-500">
          vs last month
        </span>
      </div>
    </article>
  );
}
