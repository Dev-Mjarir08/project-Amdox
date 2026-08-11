import { NavLink } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import logo from "../../assets/logo.png";

export default function Sidebar({
  isCollapsed,
  isMobileOpen,
  items,
  onCloseMobile,
  onToggleCollapse,
  roleLabel,
}) {
  // Define module category grouping
  const getCategory = (label) => {
    const l = label.toLowerCase();
    if (l === "dashboard") return "MAIN";
    if (["employees", "attendance", "leave management", "leave requests", "apply leave", "payroll", "team members", "recruitment", "performance", "training", "shifts", "holidays"].includes(l)) return "WORKFORCE";
    if (["inventory", "vendors", "purchase orders", "assets"].includes(l)) return "OPERATIONS";
    if (["general ledger", "accounts payable", "accounts receivable", "financial reports", "sales", "crm", "finance"].includes(l)) return "FINANCE";
    if (["projects", "tasks", "my tasks"].includes(l)) return "PROJECT MANAGEMENT";
    return "SYSTEM";
  };

  // Group items by category while preserving order
  const categories = ["MAIN", "WORKFORCE", "OPERATIONS", "FINANCE", "PROJECT MANAGEMENT", "SYSTEM"];
  const groupedItems = categories.map(cat => ({
    category: cat,
    items: items.filter(item => getCategory(item.label) === cat)
  })).filter(group => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden ${
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Main Responsive Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/90 bg-white shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-[#0F172A] dark:shadow-lg lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800/80">
          <NavLink to="/" className="flex min-w-0 items-center gap-3" onClick={onCloseMobile}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-md shadow-blue-600/30">
              <img src={logo} alt="AMDoxERP Logo" className="h-7 w-7 object-contain" />
            </div>
            <span
              className={`min-w-0 transition-opacity duration-200 ${
                isCollapsed ? "lg:hidden" : ""
              }`}
            >
              <span className="block truncate text-sm font-black tracking-wide text-slate-900 dark:text-white">
                AMDoxERP
              </span>
              <span className="block truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {roleLabel} Console
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={onCloseMobile}
            className="erp-focus inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {groupedItems.map((group) => (
            <div key={group.category} className="space-y-1">
              {group.category !== "MAIN" && !isCollapsed && (
                <div className="px-3 pb-1 pt-2">
                  <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {group.category}
                  </span>
                </div>
              )}
              {group.category !== "MAIN" && isCollapsed && (
                <div className="my-2 border-t border-slate-200 dark:border-slate-800/60" />
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      [
                        "group relative flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150",
                        isCollapsed ? "lg:justify-center lg:px-0" : "",
                        isActive
                          ? "bg-primary text-white font-bold shadow-md shadow-blue-600/20"
                          : "text-slate-700 hover:bg-slate-100/90 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white lg:hidden" />
                        )}
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`} />
                        <span className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Collapse Button */}
        <div className="shrink-0 border-t border-slate-200/80 p-3 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="erp-focus hidden min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white lg:flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FiChevronRight className="h-4 w-4" />
            ) : (
              <>
                <FiChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
