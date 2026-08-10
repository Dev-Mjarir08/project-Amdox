import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { FiPackage, FiPlus, FiTrash2, FiLink, FiSearch, FiDollarSign, FiUserCheck, FiLayers, FiDownload, FiX, FiCheck } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";
import api from "../../lib/api.js";
import { exportToCSV } from "../../lib/utils.js";

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    assetName: "",
    code: "",
    category: "Hardware",
    purchaseValue: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    depreciationRate: 10
  });
  const [submitting, setSubmitting] = useState(false);

  // Assignment Modal State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
  }, [searchTerm, categoryFilter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/assets", {
        params: { search: searchTerm, category: categoryFilter }
      });
      const dataList = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setAssets(dataList);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      toast.error("Failed to load asset ledger");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/hr/employees");
      const dataList = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setEmployees(dataList);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setEmployees([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/assets", form);
      toast.success(`Asset "${form.assetName}" registered successfully!`);
      setForm({
        assetName: "",
        code: "",
        category: "Hardware",
        purchaseValue: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        depreciationRate: 10
      });
      setIsModalOpen(false);
      fetchAssets();
    } catch (err) {
      toast.error("Failed to register asset: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      await api.put(`/assets/${selectedAsset._id}/assign`, { assignedTo });
      toast.success("Asset allocation updated successfully!");
      setIsAssignOpen(false);
      setSelectedAsset(null);
      setAssignedTo("");
      fetchAssets();
    } catch (err) {
      toast.error("Failed to allocate asset: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUnassign = async (assetId, assetName) => {
    try {
      await api.put(`/assets/${assetId}/assign`, { assignedTo: null });
      toast.success(`Asset "${assetName}" unassigned.`);
      fetchAssets();
    } catch (err) {
      toast.error("Failed to unassign asset: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = (id, assetName) => {
    setDeleteConfirmAsset({ id, name: assetName });
  };

  const confirmDeleteAsset = async () => {
    if (!deleteConfirmAsset) return;
    setDeleting(true);
    try {
      await api.delete(`/assets/${deleteConfirmAsset.id}`);
      toast.success(`Asset "${deleteConfirmAsset.name}" deleted.`);
      fetchAssets();
    } catch (err) {
      toast.error("Failed to delete asset: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmAsset(null);
    }
  };

  const handleExport = () => {
    exportToCSV(assets, "asset_ledger.csv");
    toast.success("Asset ledger exported to CSV!");
  };

  // Metrics Calculations
  const totalValuation = assets.reduce((sum, a) => sum + (Number(a.purchaseValue) || 0), 0);
  const allocatedCount = assets.filter((a) => a.assignedTo).length;
  const availableCount = assets.length - allocatedCount;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Asset Ledger"
        title="Company Assets & Allocation"
        description="Register office hardware, IT assets, assign equipment to staff members, and monitor annual value depreciation."
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <FiDownload className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" /> Register Asset
            </button>
          </div>
        }
      />

      {/* Summary KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Asset Items</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{assets.length}</p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <FiPackage className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Asset Valuation</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">₹{totalValuation.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <FiDollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Allocated to Employees</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{allocatedCount}</p>
            </div>
            <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
              <FiUserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available in Inventory</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{availableCount}</p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
              <FiLayers className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
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
                placeholder="Search asset code, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="all">All Categories</option>
            <option value="Hardware">Hardware (IT)</option>
            <option value="Software">Software Licenses</option>
            <option value="Furniture">Furniture</option>
            <option value="Vehicles">Vehicles</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading asset ledger...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Asset Item</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Category</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Purchase Value</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Depreciation</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Allocation Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-slate-500">No assets recorded in the ledger</td>
                  </tr>
                ) : (
                  assets.map((a) => (
                    <tr key={a._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div>
                          <p className="font-bold">{a.assetName}</p>
                          <p className="text-xs font-mono text-slate-500">Code: {a.code} | Purchased: {a.purchaseDate}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {a.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white">
                        ₹{(Number(a.purchaseValue) || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-rose-600 font-bold">
                        {a.depreciationRate || 10}% p.a.
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {a.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-500" />
                            <span className="font-medium text-xs">
                              {typeof a.assignedTo === 'object' ? a.assignedTo.name || a.assignedTo.email : 'Assigned'}
                            </span>
                            <button
                              onClick={() => handleUnassign(a._id, a.assetName)}
                              title="Unassign Asset"
                              className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <FiX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedAsset(a);
                              setIsAssignOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-600 hover:text-white dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            <FiLink className="h-3 w-3" /> Assign User
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(a._id, a.assetName)}
                          title="Delete Asset"
                          className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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

      {/* Register Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Register Asset Record</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. MacBook Pro M3 16-inch"
                  value={form.assetName}
                  onChange={(e) => setForm({ ...form, assetName: e.target.value })}
                  required
                  className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Asset Tag / Code</label>
                <input
                  type="text"
                  placeholder="e.g. AST-2026-009"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                  className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-mono dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Asset Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Hardware">Hardware (IT)</option>
                  <option value="Software">Software Licenses</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Vehicles">Vehicles</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="125000"
                    value={form.purchaseValue}
                    onChange={(e) => setForm({ ...form, purchaseValue: e.target.value })}
                    required
                    className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Purchase Date</label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                    required
                    className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Annual Depreciation Rate (%)</label>
                <input
                  type="number"
                  placeholder="10"
                  value={form.depreciationRate}
                  onChange={(e) => setForm({ ...form, depreciationRate: e.target.value })}
                  className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Registering..." : "Register Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {isAssignOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
              Allocate Asset: <span className="text-primary">{selectedAsset.assetName}</span>
            </h3>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Select Staff Member</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                  className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((e) => (
                    <option key={e.id || e._id} value={e.id || e._id}>
                      {e.name} ({e.title || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignOpen(false);
                    setSelectedAsset(null);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-blue-700 transition"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteConfirmAsset)}
        onClose={() => setDeleteConfirmAsset(null)}
        onConfirm={confirmDeleteAsset}
        loading={deleting}
        title="Remove Asset"
        message={`Are you sure you want to remove asset "${deleteConfirmAsset?.name}" from the asset ledger? This action cannot be undone.`}
      />
    </div>
  );
}
