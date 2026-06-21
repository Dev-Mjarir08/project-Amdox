import { useEffect, useState } from "react";
import { FiUser, FiMail, FiPhone, FiCalendar, FiShield, FiBriefcase, FiLock, FiSave } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Profile() {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit fields
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/auth/me");
      setProfile(data);
      setFormData({
        name: data.name,
        phone: data.phone || "",
        password: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError("");
      
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // keep existing pwd if blank

      await apiFetch(`/api/employees/${profile.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSuccess("Profile updated successfully!");
      loadProfile();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Space"
        title="My Profile"
        description="Manage your personal contact details, security credentials, and view system assignments."
      />

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="erp-panel flex h-60 items-center justify-center rounded-xl">
          <p className="text-sm font-semibold text-slate-500">Loading Profile...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          {/* Identity details Card */}
          <section className="erp-panel rounded-xl p-6 flex flex-col items-center justify-between text-center">
            <div className="flex flex-col items-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-white shadow-lg shadow-blue-600/20">
                {profile.initials}
              </span>
              <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">{profile.name}</h3>
              <p className="text-xs font-semibold text-primary">{profile.title}</p>
              <p className="mt-2 text-xs text-slate-400">Department: {profile.department}</p>
            </div>

            <div className="mt-8 w-full border-t border-slate-100 pt-5 space-y-4 text-left dark:border-slate-850">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <FiMail className="h-4.5 w-4.5 text-slate-405 text-slate-400" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <FiPhone className="h-4.5 w-4.5 text-slate-405 text-slate-400" />
                <span>{profile.phone || "No phone added"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <FiCalendar className="h-4.5 w-4.5 text-slate-405 text-slate-400" />
                <span>Joined {profile.join_date}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <FiShield className="h-4.5 w-4.5 text-slate-405 text-slate-400" />
                <span className="capitalize font-semibold text-slate-800 dark:text-slate-205 dark:text-slate-200">
                  Role: {profile.role}
                </span>
              </div>
            </div>
          </section>

          {/* Edit form */}
          <section className="erp-panel rounded-xl p-6">
            <h3 className="text-base font-bold text-slate-950 dark:text-white">Profile Configurations</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Modify personal details and account credentials.
            </p>

            <form onSubmit={handleUpdate} className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full Name</span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Phone Number</span>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 000-0000"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Change Password (leave blank to keep current)</span>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <button
                type="submit"
                disabled={actionLoading}
                className="erp-focus flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                <FiSave className="h-4.5 w-4.5" />
                Save Changes
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
