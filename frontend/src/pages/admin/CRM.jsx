import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { FiUsers, FiSearch, FiPlus, FiTrendingUp, FiTrash2, FiTag } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";
import api from "../../lib/api.js";

export default function CRM() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Form State
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", stage: "Lead", value: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, stageFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get("/crm", {
        params: { search: searchTerm, stage: stageFilter }
      });
      if (res.data) setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/crm", form);
      setForm({ name: "", company: "", email: "", phone: "", stage: "Lead", value: "" });
      setIsModalOpen(false);
      fetchLeads();
    } catch (err) {
      toast.error("Failed to save lead: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStage = async (id, stage) => {
    try {
      await api.put(`/crm/${id}`, { stage });
      fetchLeads();
    } catch (err) {
      toast.error("Failed to update pipeline stage: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteLead = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/crm/${deleteConfirmId}`);
      toast.success("Customer lead deleted successfully!");
      fetchLeads();
    } catch (err) {
      toast.error("Failed to delete lead: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title="CRM Customer Pipeline"
        description="Qualify leads, log call history, check sales funnels, and manage deals pipeline."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <FiPlus className="h-4 w-4" /> Add Lead
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/80 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Pipeline Deal Value</p>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
              ₹{leads.reduce((sum, l) => sum + (l.value || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <FiTrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/80 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Leads Qualified</p>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{leads.length}</p>
          </div>
          <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
            <FiUsers className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">All Stages</option>
            <option value="Lead">Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won (Closed)</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading pipeline leads...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Customer Info</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Company</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Value (₹)</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Pipeline Stage</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center text-slate-500">No active leads found</td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        <div>
                          <p>{l.name}</p>
                          <p className="text-xs text-slate-500">{l.email} | {l.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.company || "-"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">₹{l.value?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={l.stage}
                          onChange={(e) => handleUpdateStage(l._id, e.target.value)}
                          className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="Lead">Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Proposal Sent">Proposal Sent</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(l._id)}
                          className="rounded p-1 text-rose-600 hover:bg-rose-50"
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

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Add New Lead</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Customer Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Company / Business Name"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
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
                placeholder="Phone Details"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="Lead">Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                </select>
                <input
                  type="number"
                  placeholder="Deal Value (₹)"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
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
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteLead}
        loading={deleting}
        title="Delete Customer Lead"
        message="Are you sure you want to delete this customer lead? This action cannot be undone."
      />
    </div>
  );
}
