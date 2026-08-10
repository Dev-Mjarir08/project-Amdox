import { useState, useEffect } from 'react';
import { FiDollarSign, FiDownload, FiFilter, FiPlus, FiSearch, FiCheck, FiClock, FiCreditCard } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import GenerateInvoiceModal from '../../components/modals/GenerateInvoiceModal.jsx';
import PaymentModal from '../../components/modals/PaymentModal.jsx';
import api from '../../lib/api.js';
import { exportToCSV } from '../../lib/utils.js';
import { toast } from 'react-toastify';

export default function AccountsReceivable() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/finance/ar/invoices', {
        params: { status: statusFilter }
      });
      if (res.data && Array.isArray(res.data)) {
        setInvoices(res.data);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Failed to fetch AR invoices:", err);
      toast.error("Failed to fetch customer invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleNewInvoice = () => {
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    let nextStatus = 'Paid';
    if (currentStatus?.toLowerCase() === 'paid') {
      toast.info('Invoice is already paid');
      return;
    }
    
    try {
      await api.put(`/finance/ar/invoices/${id}/status`, { status: nextStatus });
      toast.success(`Invoice status updated to ${nextStatus}`);
      fetchInvoices();
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to update invoice status");
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchText.toLowerCase())) ||
                          ((invoice.customerName || invoice.customer || '').toLowerCase().includes(searchText.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || invoice.status?.toLowerCase() === statusFilter?.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportToCSV(filteredInvoices, 'accounts_receivable.csv');
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    };
    return styles[status?.toLowerCase()] || styles.draft;
  };

  const totalReceivable = invoices
    .filter(i => !['paid', 'refunded'].includes(i.status?.toLowerCase()))
    .reduce((sum, i) => sum + (i.totalAmount || i.amount || 0), 0);

  const totalOverdue = invoices
    .filter(i => i.status?.toLowerCase() === 'overdue')
    .reduce((sum, i) => sum + (i.totalAmount || i.amount || 0), 0);

  const collectedThisMonth = invoices
    .filter(i => i.status?.toLowerCase() === 'paid')
    .reduce((sum, i) => sum + (i.totalAmount || i.amount || 0), 0);

  const sentInvoicesCount = invoices.filter(i => i.status?.toLowerCase() === 'sent').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Accounts Receivable"
        description="Manage customer invoices, payments, and aging reports"
        actions={
          <button onClick={handleNewInvoice} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            <FiPlus className="h-4 w-4" />
            New Invoice
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Receivable</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">₹{totalReceivable.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <FiDollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Overdue</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">₹{totalOverdue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-rose-100 p-3 dark:bg-rose-900/30">
              <FiClock className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Collected</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">₹{collectedThisMonth.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <FiCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pending Sent</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{sentInvoicesCount}</p>
            </div>
            <div className="rounded-xl bg-cyan-100 p-3 dark:bg-cyan-900/30">
              <FiClock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
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
                placeholder="Search invoices..."
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
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
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
            <div className="text-sm text-slate-500">Loading invoices...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Invoice #</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Issue Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Due Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Paid</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-slate-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id || invoice._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{invoice.customerName || invoice.customer}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{invoice.invoiceDate || invoice.issueDate}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{invoice.dueDate}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                        ₹{(invoice.totalAmount || invoice.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                        ₹{(invoice.paidAmount || (invoice.status?.toLowerCase() === 'paid' ? (invoice.totalAmount || invoice.amount) : 0) || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {invoice.status?.toLowerCase() !== 'paid' && invoice.status?.toLowerCase() !== 'refunded' && (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedPaymentInvoice(invoice);
                                setIsPaymentModalOpen(true);
                              }}
                              title="Pay Now (Stripe / Razorpay)"
                              className="erp-focus inline-flex h-8 items-center gap-1 px-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-600 hover:text-white dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            >
                              <FiCreditCard className="h-3.5 w-3.5" />
                              Pay Now
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(invoice.id || invoice._id, invoice.status)}
                              title="Mark as Paid"
                              className="erp-focus inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            >
                              <FiCheck className="h-4 w-4" />
                            </button>
                          </div>
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

      <GenerateInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchInvoices();
          setIsModalOpen(false);
        }}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        invoice={selectedPaymentInvoice}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPaymentInvoice(null);
        }}
        onSuccess={() => {
          fetchInvoices();
        }}
      />
    </div>
  );
}
