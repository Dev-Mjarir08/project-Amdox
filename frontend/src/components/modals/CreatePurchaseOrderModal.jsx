import { useState, useEffect } from 'react';
import { FiX, FiPackage, FiDollarSign, FiCalendar, FiUser } from 'react-icons/fi';
import api from '../../lib/api.js';
import { toast } from 'react-toastify';

export default function CreatePurchaseOrderModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    email: '',
    orderDate: '',
    expectedDelivery: '',
    items: [{ name: '', quantity: '', price: '' }],
    notes: '',
  });
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await api.get('/supply-chain/vendors');
        if (res.data && Array.isArray(res.data)) {
          setVendors(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch vendors for PO:', err);
      }
    };
    if (isOpen) {
      fetchVendors();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/purchases', {
        vendorName: formData.vendorName,
        email: formData.email,
        orderDate: formData.orderDate,
        expectedDate: formData.expectedDelivery,
        notes: formData.notes,
        items: formData.items.map(item => ({
          name: item.name,
          qty: Number(item.quantity) || 1,
          price: Number(item.price) || 0
        }))
      });
      toast.success('Purchase order created successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create PO:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create purchase order');
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
    setFormData({ ...formData, items: [...formData.items, { name: '', quantity: '', price: '' }] });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Purchase Order</h2>
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
                Vendor
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    const selectedVendor = vendors.find(v => v.id === selectedVal);
                    setFormData({
                      ...formData,
                      vendorId: selectedVal,
                      vendorName: selectedVendor ? selectedVendor.name : '',
                      email: selectedVendor ? selectedVendor.email : ''
                    });
                  }}
                  required
                  className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Order Date
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleChange}
                  required
                  className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Expected Delivery
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                name="expectedDelivery"
                value={formData.expectedDelivery}
                onChange={handleChange}
                required
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Items</label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm font-semibold text-primary hover:text-blue-700"
              >
                + Add Item
              </button>
            </div>
            {formData.items.map((item, index) => (
              <div key={index} className="mb-2 grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                  />
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="erp-focus h-11 w-full rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="erp-focus w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
              placeholder="Additional notes..."
            />
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
              {loading ? 'Creating...' : 'Create PO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
