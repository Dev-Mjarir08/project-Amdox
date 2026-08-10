import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiCheckSquare, FiCalendar, FiTarget, FiUser } from 'react-icons/fi';
import api from '../../lib/api.js';

export default function NewTaskModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    estimatedHours: ''
  });
  
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load projects
      api.get('/projects')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            setProjects(res.data);
          }
        })
        .catch(err => console.error("Failed to load projects:", err));

      // Load employees
      api.get('/hr/employees')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            setEmployees(res.data);
          }
        })
        .catch(err => console.error("Failed to load employees:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks', {
        title: formData.title,
        description: formData.description,
        project_id: formData.projectId || null,
        assigned_to: formData.assignedTo || null,
        priority: formData.priority,
        due_date: formData.dueDate || null,
        estimatedHours: formData.estimatedHours || 0
      });

      const assignedEmp = employees.find(e => String(e.id || e._id) === String(formData.assignedTo));
      const assigneeMsg = assignedEmp ? ` to ${assignedEmp.name}` : '';
      toast.success(`Task "${formData.title}" assigned successfully${assigneeMsg}!`);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="erp-focus rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Task Title
            </label>
            <div className="relative">
              <FiCheckSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                placeholder="Design homepage mockup"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="erp-focus w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
              placeholder="Task description and requirements..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Project
              </label>
              <div className="relative">
                <FiCheckSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                  className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Assigned To
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  required
                  className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                >
                  <option value="">Select Assignee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <div className="relative">
                <FiTarget className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Due Date
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Estimated Hours
            </label>
            <input
              type="number"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
              placeholder="8"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="erp-focus flex-1 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="erp-focus flex-1 h-11 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
