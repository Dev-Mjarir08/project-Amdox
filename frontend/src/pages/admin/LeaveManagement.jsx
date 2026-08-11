import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiCalendar,
  FiDownload,
  FiFilter,
  FiPlus,
  FiCheck,
  FiX,
  FiClock,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiInfo,
  FiUser,
  FiRefreshCw
} from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import ApplyLeaveModal from '../../components/modals/ApplyLeaveModal.jsx';
import api from '../../lib/api.js';
import { exportToCSV } from '../../lib/utils.js';
import useAuthStore from '../../stores/useAuthStore.js';

export default function LeaveManagement() {
  const user = useAuthStore((state) => state.user);
  const userRole = (user?.role || '').toLowerCase();
  const isHRorAdmin = userRole === 'hr' || userRole === 'admin';
  const isEmployee = userRole === 'employee';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calendar View State
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'table'
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateDetails, setSelectedDateDetails] = useState(null); // { dateStr, leaves: [] }
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/leave-requests');
      const rawData = Array.isArray(response.data)
        ? response.data
        : (response.data?.data && Array.isArray(response.data.data) ? response.data.data : []);

      const mapped = rawData.map(req => {
        if (!req) return null;

        let fromDateStr = '-';
        let toDateStr = '-';
        let daysCount = 1;

        try {
          if (req.start_date) {
            fromDateStr = typeof req.start_date === 'string' ? req.start_date.split('T')[0] : new Date(req.start_date).toISOString().split('T')[0];
          }
          if (req.end_date) {
            toDateStr = typeof req.end_date === 'string' ? req.end_date.split('T')[0] : new Date(req.end_date).toISOString().split('T')[0];
          }
          if (req.start_date && req.end_date) {
            const d1 = new Date(req.start_date);
            const d2 = new Date(req.end_date);
            daysCount = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
          }
        } catch (e) {
          // ignore date parse fallback
        }

        const rawUserId = req.user_id || req.user || req.employee;
        const userIdStr = rawUserId ? (typeof rawUserId === 'object' ? String(rawUserId._id || rawUserId) : String(rawUserId)) : '';
        const empId = userIdStr ? userIdStr.slice(-6).toUpperCase() : 'EMP-001';

        const name = req.name || (req.employee && typeof req.employee === 'object' ? req.employee.name : 'Staff Member');
        const initials = req.initials || (name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U');

        return {
          id: req.id || req._id,
          initials,
          name,
          employeeId: empId,
          leaveType: req.type || req.leaveType || 'Sick Leave',
          fromDate: fromDateStr,
          toDate: toDateStr,
          days: daysCount,
          reason: req.reason || 'No reason provided',
          status: (req.status || 'pending').toLowerCase()
        };
      }).filter(Boolean);

      setRequests(mapped);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      toast.error('Failed to fetch leave requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = () => {
    setIsModalOpen(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          request.employeeId.toLowerCase().includes(searchText.toLowerCase()) ||
                          (request.reason && request.reason.toLowerCase().includes(searchText.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.leaveType.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExport = () => {
    exportToCSV(filteredRequests, 'leave_requests.csv');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
    };
    return styles[status] || styles.pending;
  };

  const handleApprove = async (id) => {
    try {
      toast.info("Approving leave request...");
      await api.post(`/hr/leave-requests/${id}/approve`);
      toast.success("Leave request approved successfully!");
      fetchRequests();
    } catch (error) {
      console.error('Failed to approve request via POST, trying PUT:', error);
      try {
        await api.put(`/hr/leave-requests/${id}`, { status: 'approved' });
        toast.success("Leave request approved successfully!");
        fetchRequests();
      } catch (err2) {
        toast.error('Failed to approve request: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleReject = async (id) => {
    try {
      toast.info("Rejecting leave request...");
      await api.post(`/hr/leave-requests/${id}/reject`);
      toast.success("Leave request rejected!");
      fetchRequests();
    } catch (error) {
      console.error('Failed to reject request via POST, trying PUT:', error);
      try {
        await api.put(`/hr/leave-requests/${id}`, { status: 'rejected' });
        toast.success("Leave request rejected!");
        fetchRequests();
      } catch (err2) {
        toast.error('Failed to reject request: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Calendar Helpers
  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentMonthDate(new Date());
  };

  const getLeavesForDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return [];
    return requests.filter(r => {
      if (!r.fromDate || r.fromDate === '-' || !r.toDate || r.toDate === '-') return false;
      return dateStr >= r.fromDate && dateStr <= r.toDate;
    });
  };

  // Build Calendar Days
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthTitle = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dNum = totalDaysInPrevMonth - i;
    const pDate = new Date(year, month - 1, dNum);
    const yyyy = pDate.getFullYear();
    const mm = String(pDate.getMonth() + 1).padStart(2, '0');
    const dd = String(pDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    calendarDays.push({
      dateStr,
      dayNum: dNum,
      isCurrentMonth: false,
      isToday: false,
      leaves: getLeavesForDate(dateStr),
    });
  }

  // Current month days
  const todayStr = new Date().toISOString().split('T')[0];
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const cDate = new Date(year, month, d);
    const yyyy = cDate.getFullYear();
    const mm = String(cDate.getMonth() + 1).padStart(2, '0');
    const dd = String(cDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      leaves: getLeavesForDate(dateStr),
    });
  }

  // Next month leading days
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let n = 1; n <= remainingCells; n++) {
    const nDate = new Date(year, month + 1, n);
    const yyyy = nDate.getFullYear();
    const mm = String(nDate.getMonth() + 1).padStart(2, '0');
    const dd = String(nDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    calendarDays.push({
      dateStr,
      dayNum: n,
      isCurrentMonth: false,
      isToday: false,
      leaves: getLeavesForDate(dateStr),
    });
  }

  const handleCellClick = (cell) => {
    setSelectedDateDetails(cell);
    setIsDayModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isEmployee ? "Leave Portal" : "HR"}
        title={isEmployee ? "My Leave Requests" : "Leave Management"}
        description={isEmployee ? "View your submitted leave requests, approval status, and calendar schedule" : "Review and approve employee leave requests and view team calendar"}
        actions={
          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === 'calendar'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FiGrid className="h-3.5 w-3.5" />
                Calendar View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === 'table'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FiList className="h-3.5 w-3.5" />
                Table View
              </button>
            </div>

            <button
              onClick={handleApplyLeave}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiPlus className="h-4 w-4" />
              Apply Leave
            </button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-5 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Requests</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {requests.filter(r => r.status === 'pending').length}
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
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approved Leaves</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {requests.filter(r => r.status === 'approved').length}
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
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rejected Applications</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {requests.filter(r => r.status === 'rejected').length}
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
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">On Leave Today</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {requests.filter(r => r.status === 'approved' && todayStr >= r.fromDate && todayStr <= r.toDate).length}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-100 p-3 dark:bg-cyan-900/30">
              <FiCalendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          {/* Calendar Header Navigation */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                <FiCalendar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{monthTitle}</h2>
                <p className="text-xs text-slate-500">Interactive monthly leave allocation schedule</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="erp-focus inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                title="Previous Month"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleTodayMonth}
                className="erp-focus h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="erp-focus inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                title="Next Month"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2.5">{d}</div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {calendarDays.map((cell, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCellClick(cell)}
                  className={`group min-h-[110px] p-2 transition cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                    !cell.isCurrentMonth ? 'bg-slate-50/40 dark:bg-slate-950/20' : ''
                  } ${cell.isToday ? 'bg-blue-50/50 ring-2 ring-primary ring-inset dark:bg-blue-950/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        cell.isToday
                          ? 'bg-primary text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {cell.leaves.length > 0 && (
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {cell.leaves.length}
                      </span>
                    )}
                  </div>

                  {/* Day Leave Badges */}
                  <div className="mt-1.5 space-y-1 max-h-[75px] overflow-y-auto">
                    {cell.leaves.slice(0, 3).map(req => {
                      const badgeStyle = {
                        approved: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
                        pending: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
                        rejected: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
                      }[req.status] || 'bg-slate-100 text-slate-800';

                      return (
                        <div
                          key={req.id}
                          className={`truncate rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition ${badgeStyle}`}
                          title={`${req.name} (${req.leaveType}): ${req.status}`}
                        >
                          <span className="font-bold">{req.initials}</span>: {req.leaveType}
                        </div>
                      );
                    })}
                    {cell.leaves.length > 3 && (
                      <div className="text-[9px] font-bold text-slate-400 text-center">
                        +{cell.leaves.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leave requests by name, ID or reason..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
            >
              <option value="all">All Types</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
            </select>
            <button
              onClick={handleExport}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <FiDownload className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-xs text-slate-400">
              <FiRefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading leave requests...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Employee</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Leave Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">From</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">To</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Days</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Reason</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center text-slate-400">
                        No leave requests found matching criteria
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50/50 transition dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
                              {request.initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{request.name}</p>
                              <p className="text-[11px] text-slate-400">{request.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{request.leaveType}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{request.fromDate}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{request.toDate}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">{request.days}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{request.reason}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${getStatusBadge(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isHRorAdmin && request.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="erp-focus inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-2xs hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                title="Approve Leave"
                              >
                                <FiCheck className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="erp-focus inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 shadow-2xs hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                                title="Reject Leave"
                              >
                                <FiX className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400">
                              {request.status === 'approved' ? 'Approved' : request.status === 'rejected' ? 'Rejected' : 'Awaiting Review'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Selected Calendar Day Details Modal */}
      {isDayModalOpen && selectedDateDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-primary dark:bg-blue-950/50">
                  <FiCalendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule for {selectedDateDetails.dateStr}</h3>
                  <p className="text-xs text-slate-500">{selectedDateDetails.leaves.length} leave application(s) recorded</p>
                </div>
              </div>
              <button
                onClick={() => setIsDayModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {selectedDateDetails.leaves.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No employee leave applications for this date.
                </div>
              ) : (
                selectedDateDetails.leaves.map((req) => (
                  <div key={req.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                          {req.initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{req.name}</p>
                          <p className="text-[10px] text-slate-400">{req.leaveType}</p>
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      <span className="font-semibold">Duration:</span> {req.fromDate} to {req.toDate} ({req.days} days)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">
                      "{req.reason}"
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDayModalOpen(false)}
                className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDayModalOpen(false);
                  setIsModalOpen(true);
                }}
                className="flex-1 h-10 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
              >
                Apply Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Dialog */}
      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchRequests();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
