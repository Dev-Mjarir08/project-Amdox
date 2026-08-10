import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { FiClock, FiPlus, FiTrash2 } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";
import api from "../../lib/api.js";
import useAuthStore from "../../stores/useAuthStore.js";

export default function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const currentUser = useAuthStore((state) => state.user);
  const isHRorAdmin = currentUser?.role === "hr" || currentUser?.role === "admin";

  // Form State
  const [form, setForm] = useState({
    employee: "",
    shiftType: "Day",
    startTime: "09:00",
    endTime: "18:00",
    startDate: "",
    endDate: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchShifts();
    if (isHRorAdmin) {
      fetchEmployees();
    }
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shifts");
      if (res.data) setShifts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/hr/employees");
      if (res.data) setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/shifts", form);
      setForm({
        employee: "",
        shiftType: "Day",
        startTime: "09:00",
        endTime: "18:00",
        startDate: "",
        endDate: "",
        notes: ""
      });
      setIsModalOpen(false);
      fetchShifts();
    } catch (err) {
      toast.error("Failed to assign shift: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteShift = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/shifts/${deleteConfirmId}`);
      toast.success("Shift assignment removed successfully!");
      fetchShifts();
    } catch (err) {
      toast.error("Failed to remove shift: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Shift Scheduling & Rotation"
        description="Allocate day/night shifts, track rosters, and handle rotational shift assignments."
        actions={
          isHRorAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" /> Assign Shift
            </button>
          )
        }
      />

      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">Active Shift Roster</h3>
        
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading schedule roster...</div>
        ) : shifts.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No shift roster allocations yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Shift Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Timings</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Duration Period</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Notes</th>
                  {isHRorAdmin && <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                          {s.employee?.initials || "EE"}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{s.employee?.name || "Employee"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        s.shiftType === "Night"
                          ? "bg-purple-100 text-purple-700"
                          : s.shiftType === "Rotational"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {s.shiftType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.startTime} - {s.endTime}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.startDate} to {s.endDate}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">{s.notes || "-"}</td>
                    {isHRorAdmin && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="rounded p-1 text-rose-600 hover:bg-rose-50"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Assign Roster Shift</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Select Employee</label>
                <select
                  value={form.employee}
                  onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Choose Employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.title})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Shift Category</label>
                <select
                  value={form.shiftType}
                  onChange={(e) => {
                    const val = e.target.value;
                    let startTime = "09:00";
                    let endTime = "18:00";
                    if (val === "Night") {
                      startTime = "22:00";
                      endTime = "06:00";
                    } else if (val === "Rotational") {
                      startTime = "14:00";
                      endTime = "22:00";
                    }
                    setForm({ ...form, shiftType: val, startTime, endTime });
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="Day">Day (09:00 - 18:00)</option>
                  <option value="Night">Night (22:00 - 06:00)</option>
                  <option value="Rotational">Rotational (14:00 - 22:00)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Additional Instructions</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. night shift handovers, temporary timings"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

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
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteShift}
        loading={deleting}
        title="Remove Shift Assignment"
        message="Are you sure you want to remove this shift assignment? This action cannot be undone."
      />
    </div>
  );
}
