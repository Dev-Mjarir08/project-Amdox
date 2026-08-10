import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiCalendar } from 'react-icons/fi';
import api from '../../lib/api.js';

export default function RunPayrollModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    payrollPeriod: '',
    runDate: '',
    department: 'all',
    includeOvertime: false,
    includeBonuses: false
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getPeriodOptions = () => {
    const options = [];
    const date = new Date();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    for (let i = 0; i < 6; i++) {
      const m = date.getMonth();
      const y = date.getFullYear();
      const label = `${months[m]} ${y}`;
      const val = `${months[m].toLowerCase()}-${y}`;
      options.push({ label, val });
      date.setMonth(date.getMonth() - 1);
    }
    return options;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let month = '2026-03';
      if (formData.payrollPeriod) {
        const parts = formData.payrollPeriod.split('-'); 
        const months = {
          january: '01', february: '02', march: '03', april: '04',
          may: '05', june: '06', july: '07', august: '08',
          september: '09', october: '10', november: '11', december: '12'
        };
        const mNum = months[parts[0].toLowerCase()] || '01';
        month = `${parts[1]}-${mNum}`;
      }

      await api.post('/payroll/generate', { month });
      toast.success('Payroll run completed successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to run payroll:', error);
      toast.error('Failed to run payroll: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Run Payroll</h2>
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
              Payroll Period
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                name="payrollPeriod"
                value={formData.payrollPeriod}
                onChange={handleChange}
                required
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
              >
                <option value="">Select Period</option>
                {getPeriodOptions().map((opt) => (
                  <option key={opt.val} value={opt.val}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Run Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                name="runDate"
                value={formData.runDate}
                onChange={handleChange}
                required
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
              />
            </div>
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
              {loading ? 'Processing...' : 'Run Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
