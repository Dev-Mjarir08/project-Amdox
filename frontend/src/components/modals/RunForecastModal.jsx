import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiTrendingUp, FiCalendar, FiBarChart2, FiCpu } from 'react-icons/fi';
import api from '../../lib/api.js';

export default function RunForecastModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    forecastType: 'revenue',
    period: 'quarterly',
    startDate: '',
    endDate: '',
    algorithm: 'ARIMA',
    confidenceThreshold: 95,
    departments: [],
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/forecast', formData);
      const summaryText = res.data?.data?.summary || res.data?.summary || 'Forecast generated successfully via AI Engine v2.0 Pro.';
      toast.success(summaryText);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to run forecast:', error);
      toast.error(error.response?.data?.message || 'Failed to generate forecast.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDepartmentToggle = (dept) => {
    const newDepts = formData.departments.includes(dept)
      ? formData.departments.filter(d => d !== dept)
      : [...formData.departments, dept];
    setFormData({ ...formData, departments: newDepts });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <FiCpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Run Predictive AI Forecast v2.0</h2>
              <p className="text-xs text-slate-500">Neural Time-Series & Regression Modeling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="erp-focus rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Forecast Type
              </label>
              <div className="relative">
                <FiTrendingUp className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  name="forecastType"
                  value={formData.forecastType}
                  onChange={handleChange}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="revenue">Revenue & Cash Flow</option>
                  <option value="inventory">Inventory Stockout</option>
                  <option value="attendance">Team Attendance</option>
                  <option value="attrition">Workforce Attrition</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ML Algorithm Engine
              </label>
              <select
                name="algorithm"
                value={formData.algorithm}
                onChange={handleChange}
                className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="ARIMA">ARIMA Time-Series</option>
                <option value="Exponential Smoothing">Holt-Winters Exponential</option>
                <option value="Neural Prophet">Neural Prophet (Deep ML)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Period Horizon
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confidence Threshold ({formData.confidenceThreshold}%)
              </label>
              <input
                type="range"
                min="80"
                max="99"
                name="confidenceThreshold"
                value={formData.confidenceThreshold}
                onChange={handleChange}
                className="mt-2.5 w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Departments Scope
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'].map((dept) => (
                <label key={dept} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-950">
                  <input
                    type="checkbox"
                    checked={formData.departments.includes(dept)}
                    onChange={() => handleDepartmentToggle(dept)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 p-3.5 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40">
            <div className="flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
              <FiBarChart2 className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <p className="font-bold">v2.0 Pro Predictive ML Active</p>
                <p className="text-[11px] opacity-80 mt-0.5">Queries live MongoDB records to generate statistically valid trend projections.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Executing v2.0 Model...' : 'Execute Forecast Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
