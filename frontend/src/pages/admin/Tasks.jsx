import { useState, useEffect } from 'react';
import { FiCheckSquare, FiDownload, FiPlus, FiSearch, FiCheck, FiClock, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import NewTaskModal from '../../components/modals/NewTaskModal.jsx';
import ConfirmModal from '../../components/modals/ConfirmModal.jsx';
import api from '../../lib/api.js';
import { exportToCSV } from '../../lib/utils.js';
import { toast } from 'react-toastify';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks', {
        params: {
          status: statusFilter === 'in_progress' ? 'in-progress' : statusFilter,
          priority: priorityFilter
        }
      });
      if (response.data && Array.isArray(response.data)) {
        const normalized = response.data.map(t => ({
          ...t,
          status: t.status === 'in-progress' ? 'in_progress' : t.status
        }));
        setTasks(normalized);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTask = () => {
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteTask = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteConfirmId}`);
      toast.success('Task deleted successfully!');
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Failed to delete task: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await api.put(`/tasks/${id}`, { status: 'completed' });
      toast.success('Task completed successfully');
      fetchTasks();
    } catch (err) {
      console.error("Failed to complete task:", err);
      toast.error("Failed to complete task: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                          (task.assignee_name && task.assignee_name.toLowerCase().includes(searchText.toLowerCase())) ||
                          (task.project_name && task.project_name.toLowerCase().includes(searchText.toLowerCase()));
    return matchesSearch;
  });

  const handleExport = () => {
    exportToCSV(filteredTasks, 'tasks.csv');
  };

  const getStatusBadge = (status) => {
    const styles = {
      todo: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
      in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      blocked: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    };
    return styles[status] || styles.todo;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
      medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    };
    return styles[priority] || styles.medium;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Tasks"
        description="Track tasks, assign resources, and monitor progress"
        actions={
          <button onClick={handleNewTask} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            <FiPlus className="h-4 w-4" />
            New Task
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Tasks</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{tasks.length}</p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <FiCheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">In Progress</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
              <FiClock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Completed</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <FiCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Blocked</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {tasks.filter(t => t.status === 'blocked').length}
              </p>
            </div>
            <div className="rounded-xl bg-rose-100 p-3 dark:bg-rose-900/30">
              <FiAlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
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
                placeholder="Search tasks..."
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button onClick={handleExport} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm text-slate-500">Loading tasks...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Task</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Project</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Assignee</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Due Date</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Priority</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{task.project_name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{task.assignee_name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{task.due_date}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {task.status !== 'completed' && (
                            <button onClick={() => handleCompleteTask(task.id)} className="erp-focus inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" title="Complete Task">
                              <FiCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteTask(task.id)} className="erp-focus inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 shadow-sm transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-rose-400" title="Delete Task">
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

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchTasks();
          setIsModalOpen(false);
        }}
      />

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteTask}
        loading={deleting}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}
