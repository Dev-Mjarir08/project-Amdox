import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { FiAward, FiPlus, FiStar, FiTrash2, FiUser } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";
import api from "../../lib/api.js";
import useAuthStore from "../../stores/useAuthStore.js";

export default function Performance() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const currentUser = useAuthStore((state) => state.user);
  const isEmployee = currentUser?.role === "employee";

  // Form State
  const [form, setForm] = useState({
    employee: "",
    reviewPeriod: "Q2 2026",
    kpiScore: 8,
    feedback: "",
    goals: "",
    rating: "Meets Expectations"
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    if (!isEmployee) {
      fetchEmployees();
    }
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/performance");
      if (res.data) setReviews(res.data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
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
      await api.post("/performance", form);
      setForm({
        employee: "",
        reviewPeriod: "Q2 2026",
        kpiScore: 8,
        feedback: "",
        goals: "",
        rating: "Meets Expectations"
      });
      setIsModalOpen(false);
      fetchReviews();
    } catch (err) {
      toast.error("Failed to submit review: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteReview = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/performance/${deleteConfirmId}`);
      toast.success("Appraisal log deleted successfully!");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to delete review: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Performance"
        title="Employee Appraisals & KPIs"
        description="Monitor staff achievements, track review periods, and record feedback cycles."
        actions={
          !isEmployee && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" /> Log Assessment
            </button>
          )
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-sm font-semibold text-slate-500">Average KPI Rating</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.kpiScore, 0) / reviews.length).toFixed(1)
              : "0.0"} / 10
          </p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-sm font-semibold text-slate-500">Reviews Recorded</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{reviews.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">Evaluation Log</h3>
        
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading performance data...</div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No performance reviews posted yet.</div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-800 sm:flex-row">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {r.employee?.initials || "EE"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{r.employee?.name || "Employee"}</h4>
                      <p className="text-xs text-slate-500">Evaluated by: {r.evaluator?.name || "Supervisor"} | {r.reviewPeriod}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Feedback:</strong> {r.feedback}</p>
                  {r.goals && <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Next Goals:</strong> {r.goals}</p>}
                </div>
                <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end justify-between">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    {r.rating}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <FiStar className="fill-amber-400 text-amber-400" />
                    <span>{r.kpiScore} / 10</span>
                  </div>
                  {!isEmployee && (
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-rose-600 hover:text-rose-800"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Create Appraisal Entry</h3>
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
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Review Period</label>
                  <input
                    type="text"
                    value={form.reviewPeriod}
                    onChange={(e) => setForm({ ...form, reviewPeriod: e.target.value })}
                    required
                    placeholder="Q2 2026"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.kpiScore}
                    onChange={(e) => setForm({ ...form, kpiScore: parseInt(e.target.value) })}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Overall Rating</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="Outstanding">Outstanding</option>
                  <option value="Exceeds Expectations">Exceeds Expectations</option>
                  <option value="Meets Expectations">Meets Expectations</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Feedback Description</label>
                <textarea
                  required
                  value={form.feedback}
                  onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                  placeholder="Appraisal details..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Goals for Next Period</label>
                <textarea
                  value={form.goals}
                  onChange={(e) => setForm({ ...form, goals: e.target.value })}
                  placeholder="Targets..."
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
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteReview}
        loading={deleting}
        title="Delete Appraisal Log"
        message="Are you sure you want to delete this appraisal log? This action cannot be undone."
      />
    </div>
  );
}
