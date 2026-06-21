import { useEffect, useState } from "react";
import { FiPlus, FiCheckSquare, FiUser, FiCalendar, FiEdit2, FiTrash2, FiClock, FiAlertCircle } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import { apiFetch } from "../../utils/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Tasks() {
  const { user: currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: "",
    assigned_to: "",
    status: "pending",
    due_date: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const taskData = await apiFetch("/api/tasks");
      setTasks(taskData);

      const empData = await apiFetch("/api/employees");
      setEmployees(empData);

      const projData = await apiFetch("/api/projects");
      setProjects(projData);
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
      title: "",
      description: "",
      project_id: projects[0]?.id || "",
      assigned_to: employees[0]?.id || "",
      status: "pending",
      due_date: new Date().toISOString().split("T")[0],
    });
    setError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      project_id: task.project_id || "",
      assigned_to: task.assigned_to || "",
      status: task.status,
      due_date: task.due_date || "",
    });
    setError("");
    setIsEditModalOpen(true);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess("Task created successfully!");
      setIsAddModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await apiFetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      setSuccess("Task updated successfully!");
      setIsEditModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      setError("");
      await apiFetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      setSuccess("Task deleted successfully!");
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Group tasks by status
  const statuses = [
    { key: "pending", label: "Pending", tone: "slate", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
    { key: "in-progress", label: "In Progress", tone: "blue", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
    { key: "blocked", label: "Blocked", tone: "red", color: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
    { key: "completed", label: "Completed", tone: "green", color: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
  ];

  const canManage = currentUser?.role === "admin" || currentUser?.role === "manager";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Task Flow"
        title="Tasks Board"
        description="Organize internal operations and assign tasks to teammates."
        actions={
          canManage && (
            <button
              onClick={handleOpenAddModal}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" />
              New Task
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
          <p className="text-sm font-semibold text-slate-500">Loading Tasks...</p>
        </div>
      ) : (
        <div className="grid gap-6 min-h-[500px] lg:grid-cols-4">
          {statuses.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.key);
            return (
              <section key={col.key} className="flex flex-col gap-4">
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                  <span className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
                    <span className={`inline-block h-2 w-2 rounded-full ${
                      col.tone === "blue" ? "bg-primary" : col.tone === "red" ? "bg-danger" : col.tone === "green" ? "bg-success" : "bg-slate-400"
                    }`} />
                    {col.label}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-850 dark:text-slate-400">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="flex-1 space-y-4 rounded-xl bg-slate-50/50 p-2 dark:bg-slate-950/20">
                  {columnTasks.length === 0 ? (
                    <p className="py-6 text-center text-xs italic text-slate-400">No tasks</p>
                  ) : (
                    columnTasks.map((task) => (
                      <article
                        key={task.id}
                        className="erp-panel group relative rounded-xl p-4 hover:shadow-md transition-all"
                      >
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h4>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{task.description}</p>
                        
                        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-primary truncate">
                            Project: {task.project_name || "Workspace"}
                          </span>
                          
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <FiCalendar className="h-3 w-3" />
                              {task.due_date || "No due date"}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[8px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-350"
                                title={task.assignee_name || "Unassigned"}
                              >
                                {task.assignee_initials || "?"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Edit Overlay */}
                        {canManage && (
                          <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                            <button
                              onClick={() => handleOpenEditModal(task)}
                              className="erp-focus rounded bg-white p-1 text-slate-400 shadow-sm border border-slate-200 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-850 dark:hover:text-white"
                              title="Edit Task"
                            >
                              <FiEdit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="erp-focus rounded bg-white p-1 text-slate-400 shadow-sm border border-slate-200 hover:text-red-600 dark:bg-slate-900 dark:border-slate-850"
                              title="Delete Task"
                            >
                              <FiTrash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Task</h3>
            </div>
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Task Title</span>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Project</span>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">No Project (General task)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Assign To</span>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.title})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Due Date</span>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Initial Status</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Task Details</h3>
            </div>
            <form onSubmit={handleEditTask} className="p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Task Title</span>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Project</span>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">No Project (General task)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Assign To</span>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.title})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Due Date</span>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
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
