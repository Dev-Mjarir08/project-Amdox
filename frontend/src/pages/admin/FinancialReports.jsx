import { useState, useEffect } from 'react';
import { FiDownload, FiFilter, FiCalendar, FiBarChart2, FiPieChart, FiFileText } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import api from '../../lib/api.js';
import { toast } from 'react-toastify';

export default function FinancialReports() {
  const [reportType, setReportType] = useState('balance-sheet');
  const [dateRange, setDateRange] = useState('this-month');
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [aging, setAging] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      if (reportType === 'balance-sheet') {
        const res = await api.get('/finance/balance-sheet');
        if (res.data) setBalanceSheet(res.data);
      } else if (reportType === 'profit-loss') {
        const res = await api.get('/finance/profit-loss');
        if (res.data) setProfitLoss(res.data);
      } else if (reportType === 'cash-flow') {
        const res = await api.get('/finance/cash-flow');
        if (res.data) setCashFlow(res.data);
      } else if (reportType === 'aging') {
        const res = await api.get('/finance/aging');
        if (res.data) setAging(res.data);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
      toast.error("Failed to fetch dynamic financial report details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType]);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Financial Reports"
        description="Generate balance sheet, P&L, cash flow, and custom reports"
        actions={
          <button onClick={handleExportPDF} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            <FiDownload className="h-4 w-4" />
            Export PDF
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button 
          onClick={() => setReportType('balance-sheet')}
          className={`rounded-xl border p-6 text-left transition hover:border-primary/40 ${
            reportType === 'balance-sheet' 
              ? 'border-primary bg-primary/5 dark:bg-primary/10' 
              : 'border-white/70 bg-white/85 dark:border-slate-800 dark:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-3 ${reportType === 'balance-sheet' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              <FiBarChart2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Balance Sheet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assets, liabilities & equity</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => setReportType('profit-loss')}
          className={`rounded-xl border p-6 text-left transition hover:border-primary/40 ${
            reportType === 'profit-loss' 
              ? 'border-primary bg-primary/5 dark:bg-primary/10' 
              : 'border-white/70 bg-white/85 dark:border-slate-800 dark:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-3 ${reportType === 'profit-loss' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              <FiPieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Profit & Loss</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Income statement</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => setReportType('cash-flow')}
          className={`rounded-xl border p-6 text-left transition hover:border-primary/40 ${
            reportType === 'cash-flow' 
              ? 'border-primary bg-primary/5 dark:bg-primary/10' 
              : 'border-white/70 bg-white/85 dark:border-slate-800 dark:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-3 ${reportType === 'cash-flow' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              <FiFileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Cash Flow</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Operating, investing, financing</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => setReportType('aging')}
          className={`rounded-xl border p-6 text-left transition hover:border-primary/40 ${
            reportType === 'aging' 
              ? 'border-primary bg-primary/5 dark:bg-primary/10' 
              : 'border-white/70 bg-white/85 dark:border-slate-800 dark:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-3 ${reportType === 'aging' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              <FiCalendar className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Aging Report</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">AR/AP aging buckets</p>
            </div>
          </div>
        </button>
      </div>

      <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <FiFilter className="h-4 w-4" />
              More Filters
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <FiDownload className="h-4 w-4" />
              Excel
            </button>
            <button className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <FiDownload className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>

        {reportType === 'balance-sheet' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Assets</h3>
              <div className="space-y-2">
                {balanceSheet?.breakDown?.assets && balanceSheet.breakDown.assets.length > 0 ? (
                  balanceSheet.breakDown.assets.map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">{item.account}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Cash & Equivalents</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Accounts Receivable</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Inventory</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Total Assets</span>
                  <span className="font-bold text-lg text-primary">₹{(balanceSheet?.assets || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Liabilities</h3>
              <div className="space-y-2">
                {balanceSheet?.breakDown?.liabilities && balanceSheet.breakDown.liabilities.length > 0 ? (
                  balanceSheet.breakDown.liabilities.map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">{item.account}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Accounts Payable</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Short-term Debt</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Total Liabilities</span>
                  <span className="font-bold text-lg text-rose-600 dark:text-rose-400">₹{(balanceSheet?.liabilities || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Equity</h3>
              <div className="space-y-2">
                {balanceSheet?.breakDown?.equity && balanceSheet.breakDown.equity.length > 0 ? (
                  balanceSheet.breakDown.equity.map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">{item.account}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Share Capital</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Retained Earnings</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Total Equity</span>
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">₹{(balanceSheet?.equity || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'profit-loss' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Revenue</h3>
              <div className="space-y-2">
                {profitLoss?.details && profitLoss.details.filter(d => d.type === 'Revenue').length > 0 ? (
                  profitLoss.details.filter(d => d.type === 'Revenue').map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">{item.account}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Sales Revenue</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Service Revenue</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Total Revenue</span>
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">₹{(profitLoss?.revenues || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Operating Expenses</h3>
              <div className="space-y-2">
                {profitLoss?.details && profitLoss.details.filter(d => d.type === 'Expense').length > 0 ? (
                  profitLoss.details.filter(d => d.type === 'Expense').map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">{item.account}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Salaries & Wages</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                      <span className="text-slate-600 dark:text-slate-300">Rent & Utilities</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Total Operating Expenses</span>
                  <span className="font-bold text-lg text-rose-600 dark:text-rose-400">₹{(profitLoss?.expenses || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 p-6 dark:bg-primary/10">
              <div className="flex justify-between">
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">Net Profit</span>
                <span className={`font-bold text-2xl ${(profitLoss?.netProfit || 0) >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                  ₹{(profitLoss?.netProfit || 0).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Gross Profit Margin: {profitLoss?.revenues ? ((profitLoss.netProfit / profitLoss.revenues) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        )}

        {reportType === 'cash-flow' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Operating Activities</h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-300">Cash Inflows (Operations)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">+₹{(cashFlow?.operatingIn || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-300">Cash Outflows (Operations)</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">-₹{(cashFlow?.operatingOut || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Net Cash from Operations</span>
                  <span className={`font-bold text-lg ${(cashFlow?.netOperating || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    ₹{(cashFlow?.netOperating || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Investing Activities</h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-300">Asset Investments / Capital Purchases</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">₹{(cashFlow?.investing || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Net Cash from Investing</span>
                  <span className="font-bold text-lg text-rose-600 dark:text-rose-400">₹{(cashFlow?.investing || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Financing Activities</h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-300">Loans & Equity Funding</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">+₹{(cashFlow?.financing || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Net Cash from Financing</span>
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">+₹{(cashFlow?.financing || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 p-6 dark:bg-primary/10">
              <div className="flex justify-between">
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">Net Change in Cash</span>
                <span className={`font-bold text-2xl ${(cashFlow?.netChange || 0) >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                  ₹{(cashFlow?.netChange || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {reportType === 'aging' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Accounts Receivable Aging</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Category</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">0-30 Days</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">31-60 Days</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">61-90 Days</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">90+ Days</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">Customer Invoices</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">₹{(aging?.ar?.current || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">₹{(aging?.ar?.["30"] || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">₹{(aging?.ar?.["60"] || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">₹{(aging?.ar?.["90"] || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">₹{(aging?.ar?.total || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Accounts Payable Aging</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Category</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">0-30 Days</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">31-60 Days</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">61-90 Days</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">90+ Days</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">Vendor Invoices</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">₹{(aging?.ap?.current || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">₹{(aging?.ap?.["30"] || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">₹{(aging?.ap?.["60"] || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">₹{(aging?.ap?.["90"] || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">₹{(aging?.ap?.total || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Current AR (0-30 days)</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">₹{(aging?.ar?.current || 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4 dark:bg-rose-900/20">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Overdue AR (90+ days)</p>
                <p className="mt-1 text-2xl font-bold text-rose-900 dark:text-rose-100">₹{(aging?.ar?.["90"] || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
