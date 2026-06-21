import { useEffect, useState } from "react";
import { FiUsers, FiMail, FiPhone, FiBriefcase } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";

export default function TeamMembers() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        const data = await apiFetch("/api/employees");
        // Filter delivery department workers or role "employee"
        setTeam(data.filter((e) => e.department === "Delivery" || e.role === "employee"));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Team"
        title="Team Members"
        description="Monitor staff capacities, assigned operational roles, and contact lines for delivery personnel."
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="erp-panel flex h-60 items-center justify-center rounded-xl">
          <p className="text-sm font-semibold text-slate-500">Loading Team...</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {team.length === 0 ? (
            <div className="erp-panel col-span-full py-12 text-center text-sm text-slate-400">
              No team members found.
            </div>
          ) : (
            team.map((member) => (
              <div key={member.id} className="erp-panel rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                    {member.initials}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</h4>
                    <p className="text-xs text-slate-400">{member.title}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-3 space-y-2 dark:border-slate-850">
                  <div className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-350">
                    <FiMail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-655 dark:text-slate-350">
                    <FiPhone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{member.phone || "No phone added"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-655 dark:text-slate-350">
                    <FiBriefcase className="h-3.5 w-3.5 text-slate-400" />
                    <span className="capitalize">{member.department} ({member.role})</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
