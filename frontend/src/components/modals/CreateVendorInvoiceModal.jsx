import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiDollarSign, FiCalendar, FiUser, FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../lib/api.js';

export default function CreateVendorInvoiceModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vendorId: '',
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    poNumber: '',
    items: [{ description: '', quantity: '', price: '' }],
    notes: '',
  });
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchVendors = async () => {
      try {
        const res = await api.get('/supply-chain/vendors');
        if (res.data && Array.isArray(res.data)) {
          setVendors(res.data);
        }
      } catch (err) {
        console.error("Failed to load vendors:", err);
      }
    };
    fetchVendors();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/finance/ap/invoices', formData);
      toast.success('Vendor invoice created successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create vendor invoice:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create vendor invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: '', price: '' }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-white/70 bg-white/95 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Vendor Invoice</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add new vendor invoice to accounts payable</p>
          </div>
          <button onClick={onClose} className="erp-focus rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Vendor</label>
              <select
                name="vendorId"
                value={formData.vendorId}
                onChange={handleChange}
                required
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v._id || v.id} value={v._id || v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                required
                placeholder="INV-001"
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Invoice Date</label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                required
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">PO Number</label>
              <input
                type="text"
                name="poNumber"
                value={formData.poNumber}
                onChange={handleChange}
                placeholder="PO-001"
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Line Items</label>
              <button
                type="button"
                onClick={addItem}
                className="erp-focus inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <FiPlus className="h-3 w-3" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    required
                    className="erp-focus flex-1 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                    min="1"
                    className="erp-focus w-20 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="erp-focus w-28 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="erp-focus h-11 w-11 rounded-xl border border-slate-200 bg-white text-rose-600 shadow-sm transition hover:border-rose-400 hover:bg-rose-50 dark:border-slate-800 dark:bg-slate-900 dark:text-rose-400"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <div className="rounded-lg bg-slate-50 px-4 py-2 dark:bg-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-300">Total: </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes..."
              className="erp-focus w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="erp-focus h-11 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="erp-focus h-11 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
