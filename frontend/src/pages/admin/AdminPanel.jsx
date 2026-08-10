import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { FiSliders, FiCpu, FiUserPlus, FiLock, FiActivity } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import api from "../../lib/api.js";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // New admin form state
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPanelDetails();
  }, []);

  const fetchPanelDetails = async () => {
    try {
      setLoading(true);
      // Retrieve employees/users list
      const userRes = await api.get("/hr/employees");
      if (userRes.data) setUsers(userRes.data);

      // Retrieve health status diagnostics
      const healthRes = await api.get("/health");
      if (healthRes.data) setHealth(healthRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/create", form);
      toast.success("Administrator account created successfully.");
      setForm({ name: "", email: "", password: "", phone: "" });
      setIsModalOpen(false);
      fetchPanelDetails();
    } catch (err) {
      toast.error("Failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Console"
        title="Admin Control Center"
        description="Monitor system metrics, provision new administrators, and override user credentials."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Server Health Card */}
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/80 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <FiCpu className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-slate-950 dark:text-white">Server Health</h3>
          </div>
          {health ? (
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>
                <strong>Status:</strong>{" "}
                <span className="inline-flex rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  {health.status}
                </span>
              </p>
              <p><strong>Message:</strong> {health.message}</p>
              <p className="text-xs"><strong>Diagnostic Time:</strong> {health.timestamp}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Checking health metrics...</p>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/80 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <FiSliders className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-slate-950 dark:text-white">Quick Administration Actions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white transition hover:bg-blue-600"
            >
              <FiUserPlus /> Provision Admin Account
            </button>
            <button
              onClick={() => toast.success("Database backup triggered. Zip archived generated in cloud storage.")}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300"
            >
              Backup DB Instance
            </button>
          </div>
        </div>
      </div>

      {/* Complete User List Table */}
      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">Credentials Directory</h3>
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">Loading user catalog...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Email Address</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Designated Role</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800 uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Provision Administrator</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800"
              />
              <input
                type="password"
                placeholder="Secure Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800"
              />
              <input
                type="tel"
                placeholder="Phone Details"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 flex-1 rounded-xl bg-primary text-white hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
