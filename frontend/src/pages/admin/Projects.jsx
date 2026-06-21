import { useEffect, useState } from "react";
import { FiPlus, FiBriefcase, FiUser, FiTrendingUp, FiSettings, FiEdit2, FiTrash2, FiInfo } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Projects() {
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProj, setSelectedProj] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    manager_id: "",
    progress: 0,
    status: "Active",
    budget: "",
    description: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const projData = await apiFetch("/api/projects");
      setProjects(projData);

      const empData = await apiFetch("/api/employees");
      const managerList = empData.filter((e) => e.role === "manager" || e.role === "admin");
      setManagers(managerList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      manager_id: managers[0]?.id || "",
      progress: 0,
      status: "Active",
      budget: "50000",
      description: "",
    });
    setError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setSelectedProj(proj);
    setFormData({
      name: proj.name,
      manager_id: proj.manager_id || "",
      progress: proj.progress,
      status: proj.status,
      budget: proj.budget,
      description: proj.description || "",
    });
    setError("");
    setIsEditModalOpen(true);
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess("Project created successfully!");
      setIsAddModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await apiFetch(`/api/projects/${selectedProj.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      setSuccess("Project updated successfully!");
      setIsEditModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      setError("");
      await apiFetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      setSuccess("Project deleted successfully!");
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const canManage = currentUser?.role === "admin" || currentUser?.role === "manager";
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Delivery Portfolio"
        title="Projects Workspace"
        description="Monitor active enterprise deliveries, assign leads, adjust progress percentages, and manage budgets."
        actions={
          canManage && (
            <button
              onClick={handleOpenAddModal}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" />
              New Project
            </button>
          )
        }
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
          <p className="text-sm font-semibold text-slate-500">Loading Projects...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.length === 0 ? (
            <div className="erp-panel col-span-full py-12 text-center text-sm text-slate-400">
              No projects created yet.
            </div>
          ) : (
            projects.map((proj) => (
              <article key={proj.id} className="erp-panel rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                      <FiBriefcase className="h-5 w-5" />
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        proj.status === "Completed"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : proj.status === "Blocked"
                          ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                          : proj.status === "Planning"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-950 dark:text-white">{proj.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400 min-h-10 line-clamp-2">
                    {proj.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-400">Delivery Status</span>
                      <span className="text-slate-900 dark:text-white">{proj.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata info */}
                  <div className="flex justify-between text-xs border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-slate-400">Budget</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${proj.budget?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-slate-400">Project Manager</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {proj.manager_name || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {canManage && (
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        onClick={() => handleOpenEditModal(proj)}
                        className="erp-focus inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-650 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800"
                      >
                        <FiEdit2 className="h-3 w-3" />
                        Edit
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="erp-focus inline-flex h-8 items-center gap-1 rounded-lg bg-red-50 px-2.5 text-xs font-bold text-red-650 transition hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400"
                        >
                          <FiTrash2 className="h-3 w-3" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Project</h3>
            </div>
            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Project Name</span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Project Lead (Manager)</span>
                <select
                  value={formData.manager_id}
                  onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.title})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Budget ($)</span>
                  <input
                    type="number"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Description</span>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="erp-focus h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="erp-focus h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Project Settings</h3>
            </div>
            <form onSubmit={handleEditProject} className="p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Project Name</span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Project Lead (Manager)</span>
                <select
                  value={formData.manager_id}
                  onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.title})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Budget ($)</span>
                  <input
                    type="number"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Delivery Progress ({formData.progress}%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="mt-3 w-full accent-primary bg-slate-100 rounded-lg appearance-none h-2 dark:bg-slate-800"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Description</span>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="erp-focus h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="erp-focus h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
