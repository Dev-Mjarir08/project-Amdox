import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { FiDollarSign, FiSearch, FiPlus, FiPrinter, FiTrash2 } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx";
import api from "../../lib/api.js";

export default function Sales() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Invoice creation form states
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([{ description: "", qty: 1, price: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [searchTerm, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sales", {
        params: { search: searchTerm, status: statusFilter }
      });
      if (res.data) setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemRow = () => {
    setItems([...items, { description: "", qty: 1, price: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/sales", {
        customerName,
        email,
        items,
        invoiceDate,
        dueDate,
        taxRate: 18,
        discount: 0
      });
      setCustomerName("");
      setEmail("");
      setInvoiceDate("");
      setDueDate("");
      setItems([{ description: "", qty: 1, price: 0 }]);
      setIsModalOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error("Failed to create invoice: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/sales/${id}/status`, { status });
      fetchInvoices();
    } catch (err) {
      toast.error("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteInvoice = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/sales/${deleteConfirmId}`);
      toast.success("Invoice deleted successfully!");
      fetchInvoices();
    } catch (err) {
      toast.error("Failed to delete: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handlePrint = (invoice) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h2 { color: #2563eb; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background: #f3f4f6; }
            .right { text-align: right; }
            .summary { margin-top: 30px; text-align: right; font-size: 1.1em; line-height: 1.6em; }
          </style>
        </head>
        <body>
          <h2>AMDOX ENTERPRISE BILLING</h2>
          <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Customer:</strong> ${invoice.customerName} (${invoice.email})</p>
          <p><strong>Invoice Date:</strong> ${invoice.invoiceDate} | <strong>Due Date:</strong> ${invoice.dueDate}</p>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th class="right">Unit Price</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.qty}</td>
                  <td class="right">₹${item.price.toLocaleString()}</td>
                  <td class="right">₹${(item.qty * item.price).toLocaleString()}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="summary">
            <p>Subtotal: ₹${invoice.subtotal.toLocaleString()}</p>
            <p>GST (18%): ₹${invoice.taxAmount.toLocaleString()}</p>
            <p><strong>Total Amount Due: ₹${invoice.totalAmount.toLocaleString()}</strong></p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title="Invoices & Order Booking"
        description="Book transactions, calculate GST tax rates, issue billing invoices, and track payments."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <FiPlus className="h-4 w-4" /> Create Invoice
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
                placeholder="Search invoice number, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">All Invoices</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading invoices...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Invoice No.</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Customer</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Bill Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Due Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Total Amount</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-500">No invoices booked yet</td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold">{inv.customerName}</p>
                          <p className="text-xs text-slate-500">{inv.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{inv.invoiceDate}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{inv.dueDate}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-950 dark:text-white">₹{inv.totalAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={inv.status}
                          onChange={(e) => handleUpdateStatus(inv._id, e.target.value)}
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handlePrint(inv)}
                            className="rounded p-1.5 text-primary hover:bg-blue-50"
                            title="Print Invoice"
                          >
                            <FiPrinter className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(inv._id)}
                            className="rounded p-1.5 text-rose-600 hover:bg-rose-50"
                            title="Delete Record"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-white/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 my-8">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">New Sales Invoice</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Client Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="email"
                placeholder="Client Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Bill Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Invoice line items */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Billable Items</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
                
                {items.map((it, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Item Description"
                      value={it.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      required
                      className="h-10 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={it.qty}
                      onChange={(e) => handleItemChange(idx, "qty", parseInt(e.target.value))}
                      required
                      className="h-10 w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 text-center text-xs dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={it.price}
                      onChange={(e) => handleItemChange(idx, "price", parseInt(e.target.value))}
                      required
                      className="h-10 w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 text-right text-xs dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-rose-600 font-bold px-1"
                      >
                        x
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 flex-1 rounded-xl bg-primary text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  Post Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteInvoice}
        loading={deleting}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice record? This action cannot be undone."
      />
    </div>
  );
}
