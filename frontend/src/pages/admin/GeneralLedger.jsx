import { useState, useEffect } from 'react';
import { FiDollarSign, FiDownload, FiFilter, FiPlus, FiSearch } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import NewJournalEntryModal from '../../components/modals/NewJournalEntryModal.jsx';
import api from '../../lib/api.js';
import { exportToCSV } from '../../lib/utils.js';

export default function GeneralLedger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    account: '',
    dateFrom: '',
    dateTo: '',
    type: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/finance/ledger');
      if (response.data && Array.isArray(response.data)) {
        const rows = [];
        let balance = 0;
        const sorted = [...response.data].sort((a, b) => a.date.localeCompare(b.date));
        
        for (const je of sorted) {
          for (const tx of je.transactions) {
            if (tx.account === "Cash" || tx.account === "Accounts Receivable") {
              balance += (tx.debit || 0) - (tx.credit || 0);
            } else {
              balance += (tx.credit || 0) - (tx.debit || 0);
            }

            rows.push({
              id: tx._id || Math.random(),
              date: je.date,
              account: tx.account,
              debit: tx.debit,
              credit: tx.credit,
              balance: balance,
              description: je.description,
              reference: je.reference
            });
          }
        }
        setEntries(rows.reverse());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleNewEntry = () => {
    setIsModalOpen(true);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.account.toLowerCase().includes(filters.account.toLowerCase()) ||
                          entry.description.toLowerCase().includes(filters.account.toLowerCase()) ||
                          entry.reference.toLowerCase().includes(filters.account.toLowerCase());
    const matchesType = !filters.type || 
                        (filters.type === 'debit' && entry.debit > 0) || 
                        (filters.type === 'credit' && entry.credit > 0);
    return matchesSearch && matchesType;
  });

  const handleExport = () => {
    exportToCSV(filteredEntries, 'general_ledger.csv');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="General Ledger"
        description="Double-entry accounting system with multi-currency support"
        actions={
          <button onClick={handleNewEntry} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            <FiPlus className="h-4 w-4" />
            New Journal Entry
          </button>
        }
      />

      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={filters.account}
                onChange={(e) => setFilters({ ...filters, account: e.target.value })}
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
              />
            </div>
          </div>
          <select 
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <option value="">All Types</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
          <button className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <FiFilter className="h-4 w-4" />
            Filters
          </button>
          <button onClick={handleExport} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm text-slate-500">Loading entries...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Account</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Description</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Debit</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Credit</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-slate-500">
                      No journal entries found
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{entry.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{entry.account}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{entry.description}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{entry.debit ? `₹${entry.debit.toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">{entry.credit ? `₹${entry.credit.toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">₹{entry.balance.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewJournalEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchEntries();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
