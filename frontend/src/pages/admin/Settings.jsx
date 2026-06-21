import { useState } from "react";
import { FiSettings, FiGrid, FiSliders, FiBell, FiShield, FiSave } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";

export default function Settings() {
  const [workspaceName, setWorkspaceName] = useState("Enterprise Control Center");
  const [theme, setTheme] = useState("system");
  const [notifications, setNotifications] = useState(true);
  const [success, setSuccess] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess("Workspace settings updated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System Configuration"
        title="Settings Console"
        description="Configure workspace identities, theme defaults, notification thresholds, and global security policies."
      />

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
          {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_2.2fr]">
        {/* Navigation Sidebar */}
        <section className="erp-panel rounded-xl p-3 flex flex-col gap-1 h-fit">
          {[
            { label: "Workspace General", icon: FiSliders, active: true },
            { label: "Notification Triggers", icon: FiBell, active: false },
            { label: "Roles & Permissions", icon: FiShield, active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-slate-655 text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </button>
            );
          })}
        </section>

        {/* Configurations Form */}
        <section className="erp-panel rounded-xl p-6">
          <h3 className="text-base font-bold text-slate-950 dark:text-white">General Parameters</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Set default configuration for all team dashboards.
          </p>

          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Workspace Label</span>
              <input
                type="text"
                required
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Theme Preferences</span>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {["Light Mode", "Dark Mode", "Follow System"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTheme(mode.toLowerCase())}
                    className={`flex h-11 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                      theme === mode.toLowerCase()
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 text-slate-600 hover:border-slate-350 dark:border-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-850">
              <div>
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">System Notifications</span>
                <span className="text-xs text-slate-400">Receive alert warnings for pending leaves and low stock status</span>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="h-4.5 w-9 accent-primary cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="erp-focus flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiSave className="h-4.5 w-4.5" />
              Save Configurations
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
