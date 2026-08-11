import { useState, useEffect } from 'react';
import { FiClock, FiDownload, FiFilter, FiCalendar, FiCheck, FiX, FiSearch, FiPlus, FiRefreshCw, FiUser } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import api from '../../lib/api.js';
import { exportToCSV } from '../../lib/utils.js';
import useAuthStore from '../../stores/useAuthStore.js';
import { toast } from 'react-toastify';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const user = useAuthStore(s => s.user);
  const userRole = (user?.role || '').toLowerCase();
  const isEmployee = userRole === 'employee';
  const isHRorAdmin = userRole === 'hr' || userRole === 'admin';

  const [clockedIn, setClockedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  // Manual Attendance Modal State (for HR / Admin)
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [markForm, setMarkForm] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkIn: '09:00:00',
    checkOut: '17:00:00'
  });

  const checkClockStatus = async () => {
    try {
      const res = await api.get('/attendance/status');
      const payload = res.data?.data || res.data;
      if (payload && payload.clockedIn) {
        setClockedIn(true);
        setTodayRecord(payload.record);
      } else {
        setClockedIn(false);
        setTodayRecord(null);
      }
    } catch (err) {
      console.error("Failed to check clock status:", err);
    }
  };

  const fetchEmployeesForMarking = async () => {
    try {
      const res = await api.get('/employees');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data && Array.isArray(res.data.data) ? res.data.data : []);
      setEmployeesList(list);
    } catch (err) {
      console.error("Failed to fetch employees list for attendance modal:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    checkClockStatus();
    if (isHRorAdmin) {
      fetchEmployeesForMarking();
    }
  }, [dateFilter, departmentFilter]);

  const handleClockIn = async () => {
    try {
      await api.post('/attendance/clock-in', { status: 'present' });
      toast.success('Clocked in successfully');
      checkClockStatus();
      fetchAttendance();
    } catch (err) {
      console.error("Failed to clock in:", err);
      toast.error(err.response?.data?.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await api.post('/attendance/clock-out');
      toast.success('Clocked out successfully');
      checkClockStatus();
      fetchAttendance();
    } catch (err) {
      console.error("Failed to clock out:", err);
      toast.error(err.response?.data?.message || 'Failed to clock out');
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let response;
      try {
        response = await api.get('/attendance', {
          params: { date: dateFilter, department: departmentFilter }
        });
      } catch (err1) {
        response = await api.get('/hr/attendance', {
          params: { date: dateFilter, department: departmentFilter }
        });
      }

      const rawList = Array.isArray(response.data)
        ? response.data
        : (response.data?.data && Array.isArray(response.data.data) ? response.data.data : []);

      const mapped = rawList.map(log => {
        if (!log) return null;
        const name = log.name || (log.employee && typeof log.employee === 'object' ? log.employee.name : 'Unknown Employee');
        const initials = log.initials || (name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U');
        const empId = log.employeeId || (log.user_id ? String(log.user_id).slice(-6).toUpperCase() : 'EMP-001');
        const hoursWorked = log.hours_worked !== undefined && log.hours_worked !== null ? log.hours_worked : (log.totalHours || log.hours || 0);

        return {
          id: log.id || log._id,
          initials,
          name,
          employeeId: empId,
          department: log.department || 'General',
          clockIn: log.check_in || log.checkIn || '-',
          clockOut: log.check_out || log.checkOut || '-',
          hours: hoursWorked ? `${hoursWorked}h` : '-',
          overtime: hoursWorked > 8 ? `${(hoursWorked - 8).toFixed(1)} hrs` : '-',
          status: (log.status || 'present').toLowerCase()
        };
      }).filter(Boolean);

      setAttendance(mapped);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to fetch attendance records');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.info("Saving attendance record...");
      await api.post('/attendance/mark', markForm);
      toast.success("Attendance marked successfully!");
      setIsMarkModalOpen(false);
      fetchAttendance();
    } catch (err) {
      console.error("Failed to mark attendance:", err);
      toast.error(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          record.employeeId.toLowerCase().includes(searchText.toLowerCase());
    const matchesDept = departmentFilter === 'all' || record.department.toLowerCase() === departmentFilter.toLowerCase();
    return matchesSearch && matchesDept;
  });

  const handleExport = () => {
    exportToCSV(filteredAttendance, 'attendance_report.csv');
  };

  const getStatusBadge = (status) => {
    const styles = {
      present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      absent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      half_day: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      remote: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    };
    return styles[status] || styles.present;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HR"
        title="Attendance Management"
        description="Track employee daily attendance, clock-in/out records, work hours, and overtime"
        actions={
          <div className="flex gap-3 items-center">
            {isHRorAdmin && (
              <button
                onClick={() => setIsMarkModalOpen(true)}
                className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                <FiPlus className="h-4 w-4" />
                Mark Attendance
              </button>
            )}
            <button
              onClick={handleExport}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiDownload className="h-4 w-4" />
              Export Report
            </button>
          </div>
        }
      />

      {/* Punch In / Punch Out Header Banner */}
      <div className="rounded-xl border border-white/70 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-soft backdrop-blur-xl dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Punch In / Punch Out Portal</h3>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-extrabold backdrop-blur-md">
                Standard Shift: 9:00 AM (15m Grace Cutoff: 9:15 AM)
              </span>
            </div>
            <p className="text-xs opacity-90 mt-1">
              {clockedIn
                ? `Active Session: Clocked in today at ${todayRecord?.check_in || todayRecord?.checkIn || '-'}`
                : 'Shift starts at 9:00 AM with a 15-minute grace period. Punch in after 9:15 AM is automatically marked as Late Arrival.'}
            </p>
          </div>
          <div>
            {clockedIn ? (
              <button
                onClick={handleClockOut}
                className="rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-rose-600 shadow-md transition hover:bg-rose-50"
              >
                Punch Out Now
              </button>
            ) : (
              <button
                onClick={handleClockIn}
                className="rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-blue-600 shadow-md transition hover:bg-blue-50"
              >
                Punch In Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-5 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Present Today</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendance.filter(r => r.status === 'present').length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <FiCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/85 p-5 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Absent</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendance.filter(r => r.status === 'absent').length}
              </p>
            </div>
            <div className="rounded-xl bg-rose-100 p-3 dark:bg-rose-900/30">
              <FiX className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/85 p-5 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Late Arrivals</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendance.filter(r => r.status === 'late').length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
              <FiClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/85 p-5 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Remote Shift</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendance.filter(r => r.status === 'remote').length}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/30">
              <FiCalendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Logs Table Card */}
      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by employee name or ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
              />
            </div>
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-xs font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="all">All Time</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-xs font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center gap-2 text-xs text-slate-400">
            <FiRefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading attendance records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Department</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Clock In</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Clock Out</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Hours</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Overtime</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
                      No attendance records found matching filters
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
                            {record.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{record.name}</p>
                            <p className="text-[11px] text-slate-400">{record.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{record.department}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{record.clockIn}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{record.clockOut || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">{record.hours}</td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-600 dark:text-amber-400">{record.overtime || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HR / Admin Mark Attendance Modal */}
      {isMarkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
                  <FiClock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Mark Attendance Record</h3>
                  <p className="text-xs text-slate-500">Manually log employee work attendance</p>
                </div>
              </div>
              <button
                onClick={() => setIsMarkModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleMarkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee
                </label>
                <select
                  value={markForm.userId}
                  onChange={(e) => setMarkForm({ ...markForm, userId: e.target.value })}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Employee...</option>
                  {employeesList.map(e => {
                    const name = e.user ? e.user.name : (e.name || 'Employee');
                    const uid = e.user ? (e.user._id || e.user) : (e._id || e.id);
                    return (
                      <option key={uid} value={uid}>
                        {name} ({e.employeeId || 'EMP'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={markForm.date}
                  onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={markForm.status}
                  onChange={(e) => setMarkForm({ ...markForm, status: e.target.value })}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Clock In Time
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={markForm.checkIn}
                    onChange={(e) => setMarkForm({ ...markForm, checkIn: e.target.value })}
                    className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Clock Out Time
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={markForm.checkOut}
                    onChange={(e) => setMarkForm({ ...markForm, checkOut: e.target.value })}
                    className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMarkModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
