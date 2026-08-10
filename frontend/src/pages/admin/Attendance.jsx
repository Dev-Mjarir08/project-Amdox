import { useState, useEffect } from 'react';
import { FiClock, FiDownload, FiFilter, FiCalendar, FiCheck, FiX, FiSearch } from 'react-icons/fi';
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
  const isEmployee = user?.role === 'employee';

  const [clockedIn, setClockedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  const checkClockStatus = async () => {
    try {
      const res = await api.get('/attendance/status');
      if (res.data && res.data.clockedIn) {
        setClockedIn(true);
        setTodayRecord(res.data.record);
      } else {
        setClockedIn(false);
        setTodayRecord(null);
      }
    } catch (err) {
      console.error("Failed to check clock status:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    if (isEmployee) {
      checkClockStatus();
    }
  }, [dateFilter, departmentFilter, isEmployee]);

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
      const response = await api.get('/hr/attendance', {
        params: {
          date: dateFilter,
          department: departmentFilter
        }
      });
      if (response.data && Array.isArray(response.data)) {
        const mapped = response.data.map(log => ({
          id: log.id,
          initials: log.initials || '?',
          name: log.name || 'Unknown',
          employeeId: log.employeeId || (log.user_id ? log.user_id.slice(-6).toUpperCase() : 'N/A'),
          department: log.department || 'General',
          clockIn: log.check_in || '-',
          clockOut: log.check_out || '-',
          hours: log.hours_worked ? `${log.hours_worked}h` : '-',
          overtime: log.hours_worked && log.hours_worked > 8 ? `${(log.hours_worked - 8).toFixed(1)} hrs` : '-',
          status: log.status || 'present'
        }));
        setAttendance(mapped);
      } else {
        setAttendance([]);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setAttendance([]);
    } finally {
      setLoading(false);
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
      half_day: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    };
    return styles[status] || styles.present;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HR"
        title="Attendance"
        description="Track employee attendance, clock-in/out, and overtime"
        actions={
          <div className="flex gap-2">
            <button onClick={handleExport} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
              <FiDownload className="h-4 w-4" />
              Export Report
            </button>
          </div>
        }
      />

      {isEmployee && (
        <div className="rounded-xl border border-white/70 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-soft backdrop-blur-xl dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Punch In / Punch Out</h3>
              <p className="text-sm opacity-90">
                {clockedIn 
                  ? `Clocked in today at ${todayRecord?.check_in || '-'}` 
                  : 'Start your shift today by clicking Punch In.'}
              </p>
            </div>
            <div>
              {clockedIn ? (
                <button 
                  onClick={handleClockOut}
                  className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                >
                  Punch Out
                </button>
              ) : (
                <button 
                  onClick={handleClockIn}
                  className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                >
                  Punch In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Present Today</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendance.filter(r => r.status === 'present').length}
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
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Absent</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendance.filter(r => r.status === 'absent').length}
              </p>
            </div>
            <div className="rounded-xl bg-rose-100 p-3 dark:bg-rose-900/30">
              <FiX className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Late Arrivals</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendance.filter(r => r.status === 'late').length}
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
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Remote</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendance.filter(r => r.status === 'remote').length}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-100 p-3 dark:bg-cyan-900/30">
              <FiCalendar className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
              />
            </div>
          </div>
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
          </select>
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
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm text-slate-500">Loading attendance...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                            {record.initials}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{record.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{record.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{record.department}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{record.clockIn}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{record.clockOut || '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">{record.hours}</td>
                      <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">{record.overtime || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(record.status)}`}>
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
    </div>
  );
}
