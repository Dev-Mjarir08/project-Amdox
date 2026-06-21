import PageHeader from "./PageHeader.jsx";

export default function ModulePlaceholder({ moduleName, roleName, description }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${roleName} Module`}
        title={moduleName}
        description={
          description ??
          "This module shell is ready for tables, filters, approvals, and API-backed workflows."
        }
      />
      <section className="erp-panel rounded-xl p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {["Workflow", "Data Model", "API Integration"].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/40"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Reserved for the next build phase with role-based permissions and live data.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
