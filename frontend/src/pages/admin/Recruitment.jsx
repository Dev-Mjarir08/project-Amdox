import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { FiUsers, FiSearch, FiPlus, FiCalendar, FiTrash2, FiClock, FiCheck } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";
import api from "../../lib/api.js";

export default function Recruitment() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Form State
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  // Interview Scheduling State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ interviewDate: "", interviewTime: "", notes: "" });

  useEffect(() => {
    fetchCandidates();
  }, [searchTerm, statusFilter]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/recruitment", {
        params: { search: searchTerm, status: statusFilter }
      });
      if (res.data) {
        setCandidates(res.data);
      }
    } catch (err) {
      console.error("Failed to load candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/recruitment", form);
      setForm({ name: "", email: "", phone: "", position: "", notes: "" });
      setIsModalOpen(false);
      fetchCandidates();
    } catch (err) {
      toast.error("Failed to create candidate: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/recruitment/${id}/status`, { status });
      fetchCandidates();
    } catch (err) {
      toast.error("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/recruitment/${selectedCandidate._id}/interview`, scheduleForm);
      setIsScheduleOpen(false);
      setSelectedCandidate(null);
      setScheduleForm({ interviewDate: "", interviewTime: "", notes: "" });
      fetchCandidates();
    } catch (err) {
      toast.error("Failed to schedule interview: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteCandidate = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/recruitment/${deleteConfirmId}`);
      toast.success("Candidate record deleted successfully!");
      fetchCandidates();
    } catch (err) {
      toast.error("Failed to delete: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recruitment"
        title="Candidate Management & Pipeline"
        description="Monitor interview phases, schedule screenings, and view candidate applications."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <FiPlus className="h-4 w-4" /> Add Candidate
          </button>
        }
      />

      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading candidates...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Candidate</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Position</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Interview details</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Stage</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center text-slate-500">No candidates recorded yet</td>
                  </tr>
                ) : (
                  candidates.map((c) => (
                    <tr key={c._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <div>
                          <p>{c.name}</p>
                          <p className="text-xs text-slate-500">{c.email} | {c.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.position}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {c.interviewDate ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <FiClock className="h-3.5 w-3.5 text-primary" />
                            <span>{c.interviewDate} at {c.interviewTime}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedCandidate(c);
                              setIsScheduleOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            <FiCalendar className="h-3 w-3" /> Schedule
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="applied">Applied</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offered">Offered</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="rounded p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Add New Candidate</h3>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Position Applied For"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <textarea
                placeholder="Initial Assessment Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isScheduleOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Schedule Interview: {selectedCandidate.name}</h3>
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Date</label>
                <input
                  type="date"
                  value={scheduleForm.interviewDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interviewDate: e.target.value })}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Time</label>
                <input
                  type="time"
                  value={scheduleForm.interviewTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interviewTime: e.target.value })}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Instructions / Notes</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="h-11 flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 flex-1 rounded-xl bg-primary text-white hover:bg-blue-600"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteCandidate}
        loading={deleting}
        title="Delete Candidate Record"
        message="Are you sure you want to remove this candidate record? This action cannot be undone."
      />
    </div>
  );
}
