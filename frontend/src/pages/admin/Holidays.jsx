import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { FiCalendar, FiPlus, FiTrash2 } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";
import api from "../../lib/api.js";
import useAuthStore from "../../stores/useAuthStore.js";

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const currentUser = useAuthStore((state) => state.user);
  const isHRorAdmin = currentUser?.role === "hr" || currentUser?.role === "admin";

  // Form State
  const [form, setForm] = useState({ name: "", date: "", type: "Company", description: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await api.get("/holidays");
      if (res.data) setHolidays(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/holidays", form);
      setForm({ name: "", date: "", type: "Company", description: "" });
      setIsModalOpen(false);
      fetchHolidays();
    } catch (err) {
      toast.error("Failed to create holiday: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteHoliday = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/holidays/${deleteConfirmId}`);
      toast.success("Holiday record deleted successfully!");
      fetchHolidays();
    } catch (err) {
      toast.error("Failed to delete holiday: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organization"
        title="Holiday Calendar"
        description="View national, regional, and corporate calendar events."
        actions={
          isHRorAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" /> Add Holiday
            </button>
          )
        }
      />

      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">Upcoming Events</h3>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading events calendar...</div>
        ) : holidays.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No scheduled holidays for the current period.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {holidays.map((h) => (
              <div key={h._id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 hover:border-primary/20 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900/20">
                    <FiCalendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{h.name}</h4>
                    <p className="text-xs text-slate-500">{h.date} | {h.type}</p>
                    {h.description && <p className="text-xs text-slate-400 mt-1">{h.description}</p>}
                  </div>
                </div>
                {isHRorAdmin && (
                  <button
                    onClick={() => handleDelete(h._id)}
                    className="text-rose-600 hover:text-rose-800"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Holiday Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Add Calendar Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Holiday Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="Company">Company Leave</option>
                <option value="Regional">Regional Holiday</option>
                <option value="National">National Holiday</option>
              </select>
              <textarea
                placeholder="Holiday details / description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 flex-1 rounded-xl bg-primary text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteHoliday}
        loading={deleting}
        title="Delete Holiday Event"
        message="Are you sure you want to delete this holiday entry? This action cannot be undone."
      />
    </div>
  );
}
