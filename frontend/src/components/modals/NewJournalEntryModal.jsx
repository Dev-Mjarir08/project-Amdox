import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiFileText, FiCalendar, FiDollarSign, FiBriefcase } from 'react-icons/fi';
import api from '../../lib/api.js';

export default function NewJournalEntryModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    entryDate: '',
    reference: '',
    description: '',
    entries: [
      { accountId: '', debit: '', credit: '' }
    ]
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const accountNames = {
        "1001": "Cash",
        "1002": "Accounts Receivable",
        "2001": "Accounts Payable",
        "3001": "Revenue",
        "4001": "Expenses"
      };

      const payload = {
        date: formData.entryDate,
        description: formData.description,
        reference: formData.reference,
        transactions: formData.entries.map((entry) => ({
          account: accountNames[entry.accountId] || "Expenses",
          debit: Number(entry.debit || 0),
          credit: Number(entry.credit || 0),
        })),
      };

      await api.post('/finance/ledger', payload);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create journal entry:', error);
      toast.error('Failed to create journal entry: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...formData.entries];
    newEntries[index][field] = value;
    setFormData({ ...formData, entries: newEntries });
  };

  const addEntry = () => {
    setFormData({ ...formData, entries: [...formData.entries, { accountId: '', debit: '', credit: '' }] });
  };

  const removeEntry = (index) => {
    if (formData.entries.length > 1) {
      const newEntries = formData.entries.filter((_, i) => i !== index);
      setFormData({ ...formData, entries: newEntries });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Journal Entry</h2>
          <button
            onClick={onClose}
            className="erp-focus rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Entry Date
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="entryDate"
                  value={formData.entryDate}
                  onChange={handleChange}
                  required
                  className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Reference
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  required
                  className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                  placeholder="JE-001"
                />
              </div>
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
              rows={2}
              required
              className="erp-focus w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
              placeholder="Journal entry description..."
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Journal Lines</label>
              <button
                type="button"
                onClick={addEntry}
                className="text-sm font-semibold text-primary hover:text-blue-700"
              >
                + Add Line
              </button>
            </div>
            {formData.entries.map((entry, index) => (
              <div key={index} className="mb-2 grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={entry.accountId}
                      onChange={(e) => handleEntryChange(index, 'accountId', e.target.value)}
                      required
                      className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                    >
                      <option value="">Select Account</option>
                      <option value="1001">Cash</option>
                      <option value="1002">Accounts Receivable</option>
                      <option value="2001">Accounts Payable</option>
                      <option value="3001">Revenue</option>
                      <option value="4001">Expenses</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      placeholder="Debit"
                      value={entry.debit}
                      onChange={(e) => handleEntryChange(index, 'debit', e.target.value)}
                      className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      placeholder="Credit"
                      value={entry.credit}
                      onChange={(e) => handleEntryChange(index, 'credit', e.target.value)}
                      className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  {formData.entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      className="erp-focus h-11 w-full rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
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
              {loading ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
