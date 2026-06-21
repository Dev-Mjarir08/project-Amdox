import { NavLink } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

export default function Sidebar({
  isCollapsed,
  isMobileOpen,
  items,
  onCloseMobile,
  onToggleCollapse,
  roleLabel,
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity lg:hidden ${
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/70 bg-white/88 shadow-soft backdrop-blur-xl transition-all duration-300 lg:translate-x-0 dark:border-slate-800/80 dark:bg-slate-950/90 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800">
          <NavLink to="/" className="flex min-w-0 items-center gap-3" onClick={onCloseMobile}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-white shadow-lg shadow-blue-600/20">
              AX
            </span>
            <span
              className={`min-w-0 transition-opacity duration-200 ${
                isCollapsed ? "lg:hidden" : ""
              }`}
            >
              <span className="block truncate text-sm font-extrabold text-slate-950 dark:text-white">
                AMDOX ERP
              </span>
              <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                {roleLabel} Portal
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={onCloseMobile}
            className="erp-focus inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close navigation"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
                    isCollapsed ? "lg:justify-center" : "",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200/80 p-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="erp-focus hidden min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary lg:flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FiChevronRight className="h-5 w-5" />
            ) : (
              <>
                <FiChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
