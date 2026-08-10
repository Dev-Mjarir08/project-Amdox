export default function PageHeader({ title, description, eyebrow, actions }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary dark:bg-blue-950/50 dark:text-blue-400">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-xs font-medium text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}
