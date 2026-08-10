import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";

const toneClasses = {
  blue: "bg-blue-50 text-primary dark:bg-blue-950/40 dark:text-blue-400",
  cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
};

export default function StatCard({ label, value, change, trend = "neutral", icon: Icon, tone = "blue" }) {
  const TrendIcon = trend === "down" ? FiTrendingDown : FiTrendingUp;
  
  const trendBadgeClass = trend === "down"
    ? "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40"
    : trend === "neutral"
      ? "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40";

  return (
    <article className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-card transition-all hover:shadow-cardHover hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 shadow-2xs dark:border-slate-800 ${toneClasses[tone] || toneClasses.blue}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/60">
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-extrabold ${trendBadgeClass}`}>
          {trend !== "neutral" && <TrendIcon className="h-3 w-3" />}
          {change}
        </span>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          vs prior period
        </span>
      </div>
    </article>
  );
}
