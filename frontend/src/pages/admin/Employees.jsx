import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUsers, FiDownload, FiFilter, FiPlus, FiSearch, FiEdit, FiTrash2, FiMail, FiPhone } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import AddEmployeeModal from '../../components/modals/AddEmployeeModal.jsx';
import EditEmployeeModal from '../../components/modals/EditEmployeeModal.jsx';
import ConfirmModal from '../../components/modals/ConfirmModal.jsx';
import api from '../../lib/api.js';
import { exportToCSV } from '../../lib/utils.js';
import useAuthStore from '../../stores/useAuthStore.js';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const currentUser = useAuthStore((state) => state.user);
  const userRole = currentUser?.role?.toLowerCase() || 'admin';
  const isHRorAdmin = userRole === 'hr' || userRole === 'admin';

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, departmentFilter, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/employees', {
        params: {
          search: searchTerm,
          department: departmentFilter,
          status: statusFilter
        }
      });
      if (response.data && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setIsModalOpen(true);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteEmployee = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteEmployee = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/hr/employees/${deleteConfirmId}`);
      toast.success("Employee record deleted successfully!");
      fetchEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);
      toast.error("Failed to delete employee: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const filteredEmployees = employees; // Backend handles sorting/filtering now!

  const handleExport = () => {
    exportToCSV(filteredEmployees, 'employees.csv');
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
      on_leave: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      terminated: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    };
    return styles[status] || styles.active;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HR"
        title="Employees"
        description="Manage employee records, contracts, and organizational structure"
        actions={
          isHRorAdmin && (
            <div className="flex gap-2">
              <button onClick={handleAddEmployee} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                <FiPlus className="h-4 w-4" />
                Add Employee
              </button>
            </div>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Employees</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{employees.length}</p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {employees.filter(e => e.status === 'active').length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <FiUsers className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">On Leave</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {employees.filter(e => e.status === 'on_leave').length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
              <FiUsers className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Inactive</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {employees.filter(e => e.status === 'inactive').length}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-100 p-3 dark:bg-cyan-900/30">
              <FiUsers className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
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
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
              />
            </div>
          </div>
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
          </select>
          <button onClick={handleExport} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm text-slate-500">Loading employees...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Department</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Join Date</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                  {isHRorAdmin && <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={isHRorAdmin ? 7 : 6} className="px-4 py-12 text-center text-slate-500">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                            {employee.initials}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{employee.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{employee.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{employee.department}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{employee.role}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <FiMail className="h-3 w-3" />
                            <span className="text-xs">{employee.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <FiPhone className="h-3 w-3" />
                            <span className="text-xs">{employee.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{employee.joinDate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(employee.status)}`}>
                          {employee.status}
                        </span>
                      </td>
                      {isHRorAdmin && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setIsEditModalOpen(true);
                              }}
                              className="erp-focus inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 shadow-sm transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-blue-400"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteEmployee(employee.id)} className="erp-focus inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 shadow-sm transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-rose-400">
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchEmployees();
          setIsModalOpen(false);
        }}
      />

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSuccess={() => {
          fetchEmployees();
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        employeeData={selectedEmployee}
      />

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteEmployee}
        loading={deleting}
        title="Delete Employee Record"
        message="Are you sure you want to delete this employee from the system? This action cannot be undone."
      />
    </div>
  );
}
