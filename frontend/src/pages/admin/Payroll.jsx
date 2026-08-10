import { useState, useEffect } from 'react';
import { FiCreditCard, FiDownload, FiFilter, FiPlay, FiDollarSign, FiCalendar, FiRefreshCw, FiSearch } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import RunPayrollModal from '../../components/modals/RunPayrollModal.jsx';
import api from '../../lib/api.js';
import { exportToCSV } from '../../lib/utils.js';

export default function Payroll() {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPayrollRuns();
  }, []);

  const fetchPayrollRuns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payroll');
      if (response.data && Array.isArray(response.data)) {
        const groups = {};
        response.data.forEach(p => {
          const m = p.month || '2024-01';
          if (!groups[m]) {
            groups[m] = {
              id: m,
              runId: `PR-${m.replace('-', '')}`,
              period: new Date(m + "-02").toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              totalEmployees: 0,
              grossPay: 0,
              deductions: 0,
              netPay: 0,
              status: 'completed',
              runDate: `${m}-28`
            };
          }
          groups[m].totalEmployees += 1;
          groups[m].grossPay += (p.basic_salary || 0) + (p.allowance || 0);
          groups[m].deductions += (p.deduction || 0);
          groups[m].netPay += (p.total_salary || 0);
          if (p.status === 'processing' || p.status === 'pending') {
            groups[m].status = 'processing';
          }
        });
        setPayrollRuns(Object.values(groups));
      } else {
        setPayrollRuns([]);
      }
    } catch (error) {
      console.error('Failed to fetch payroll runs:', error);
      setPayrollRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = () => {
    setIsModalOpen(true);
  };

  const filteredPayrollRuns = payrollRuns.filter(run => {
    const matchesSearch = run.runId.toLowerCase().includes(searchText.toLowerCase()) ||
                          run.period.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportToCSV(filteredPayrollRuns, 'payroll_runs.csv');
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    };
    return styles[status] || styles.draft;
  };

  const totalPaid = payrollRuns.reduce((sum, run) => sum + run.netPay, 0);
  const totalEmployeesPaid = payrollRuns.reduce((sum, run) => sum + run.totalEmployees, 0);
  const totalTaxDeductions = payrollRuns.reduce((sum, run) => sum + run.deductions, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HR"
        title="Payroll"
        description="Process payroll runs, generate payslips, and manage payments"
        actions={
          <div className="flex gap-2">
            <button 
              onClick={handleRunPayroll}
              className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiPlay className="h-4 w-4" />
              Run Payroll
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Net Paid</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <FiDollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Employees Paid</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalEmployeesPaid}</p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <FiCreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Next Run Date</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">28th</p>
            </div>
            <div className="rounded-xl bg-cyan-100 p-3 dark:bg-cyan-900/30">
              <FiCalendar className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tax Deductions</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">₹{totalTaxDeductions.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
              <FiDollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
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
                placeholder="Search payroll runs..."
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
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={handleExport} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm text-slate-500">Loading payroll runs...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Run ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Period</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Run Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Gross Pay</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Deductions</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Net Pay</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrollRuns.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                      No payroll runs found
                    </td>
                  </tr>
                ) : (
                  filteredPayrollRuns.map((run) => (
                    <tr key={run.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{run.runId}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{run.period}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{run.runDate}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 font-mono">₹{run.grossPay.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400 font-mono">₹{run.deductions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{run.netPay.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(run.status)}`}>
                          {run.status}
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

      <RunPayrollModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchPayrollRuns();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
