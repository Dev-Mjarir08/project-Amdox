import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiBriefcase, FiDownload, FiFilter, FiPlus, FiSearch, FiEdit, FiTrash2, FiCalendar, FiDollarSign } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import CreateProjectModal from '../../components/modals/CreateProjectModal.jsx';
import ConfirmModal from '../../components/modals/ConfirmModal.jsx';
import api from '../../lib/api.js';
import { exportToCSV } from '../../lib/utils.js';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects', {
        params: { status: statusFilter }
      });
      if (response.data && Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = () => {
    setIsModalOpen(true);
  };

  const handleDeleteProject = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteProject = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${deleteConfirmId}`);
      toast.success("Project deleted successfully!");
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast.error("Failed to delete project: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.name && project.name.toLowerCase().includes(searchText.toLowerCase())) ||
                          (project.code && project.code.toLowerCase().includes(searchText.toLowerCase())) ||
                          (project.manager_name && project.manager_name.toLowerCase().includes(searchText.toLowerCase())) ||
                          (project.client && project.client.toLowerCase().includes(searchText.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportToCSV(filteredProjects, 'projects.csv');
  };

  const getStatusBadge = (status) => {
    const styles = {
      planning: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
      active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      on_hold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    };
    return styles[status] || styles.planning;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Projects"
        description="Manage projects, milestones, resources, and budgets"
        actions={
          <div className="flex gap-2">
            <button onClick={handleNewProject} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
              <FiPlus className="h-4 w-4" />
              New Project
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Projects</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{projects.length}</p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <FiBriefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <FiBriefcase className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">On Hold</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {projects.filter(p => p.status === 'on_hold').length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
              <FiBriefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Completed</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-100 p-3 dark:bg-cyan-900/30">
              <FiBriefcase className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
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
                placeholder="Search projects..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
              />
            </div>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={handleExport} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm text-slate-500">Loading projects...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Project</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Client</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Manager</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Timeline</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Budget</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Progress</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-slate-500">
                       No projects found
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{project.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{project.code}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{project.client || "Internal"}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{project.manager_name || "Unassigned"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <FiCalendar className="h-3 w-3" />
                          <span className="text-xs">{project.timeline}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <FiDollarSign className="h-3 w-3" />
                          <span className="text-xs">₹{project.budget.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-32">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-slate-600 dark:text-slate-300">{project.progress}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleDeleteProject(project.id)} className="erp-focus inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 shadow-sm transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-rose-400">
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchProjects();
          setIsModalOpen(false);
        }}
      />

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteProject}
        loading={deleting}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
      />
    </div>
  );
}
