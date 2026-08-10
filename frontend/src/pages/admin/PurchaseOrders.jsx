import { useState, useEffect } from 'react';
import { FiPackage, FiDownload, FiFilter, FiPlus, FiSearch, FiCheck, FiEye } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import CreatePurchaseOrderModal from '../../components/modals/CreatePurchaseOrderModal.jsx';
import api from '../../lib/api.js';
import { exportToCSV } from '../../lib/utils.js';
import { toast } from 'react-toastify';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchases', {
        params: { status: statusFilter }
      });
      if (res.data && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch POs:", err);
      toast.error("Failed to fetch purchase orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleNewPO = () => {
    setIsModalOpen(true);
  };

  const handleApprovePO = async (id) => {
    try {
      await api.put(`/purchases/${id}/status`, { status: 'Approved' });
      toast.success('Purchase order approved successfully');
      fetchOrders();
    } catch (err) {
      console.error("Failed to approve PO:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to approve purchase order");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.poNumber && order.poNumber.toLowerCase().includes(searchText.toLowerCase())) ||
                          (order.vendorName && order.vendorName.toLowerCase().includes(searchText.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter?.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportToCSV(filteredOrders, 'purchase_orders.csv');
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      ordered: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      received: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    };
    return styles[status] || styles.draft;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supply Chain"
        title="Purchase Orders"
        description="Manage purchase orders, approvals, and vendor communications"
        actions={
          <button onClick={handleNewPO} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            <FiPlus className="h-4 w-4" />
            New PO
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total POs</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{orders.length}</p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <FiPackage className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pending Approval</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {orders.filter(o => o.status?.toLowerCase() === 'pending').length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
              <FiPackage className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">In Transit</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {orders.filter(o => ['received', 'ordered'].includes(o.status?.toLowerCase())).length}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-100 p-3 dark:bg-cyan-900/30">
              <FiPackage className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Value</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                ₹{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <FiPackage className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
                placeholder="Search POs..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
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
            <div className="text-sm text-slate-500">Loading purchase orders...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">PO #</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Vendor</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Items</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Order Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Expected Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Amount</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-slate-500">
                      No purchase orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id || order._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{order.poNumber}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{order.vendorName}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{order.items ? order.items.length : 0} items</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{order.orderDate}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{order.expectedDate}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                        ₹{(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(order.status?.toLowerCase())}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="erp-focus inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" title="View details">
                            <FiEye className="h-4 w-4" />
                          </button>
                          {order.status?.toLowerCase() === 'pending' && (
                            <button onClick={() => handleApprovePO(order.id || order._id)} className="erp-focus inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-600 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-emerald-400" title="Approve PO">
                              <FiCheck className="h-4 w-4" />
                            </button>
                          )}
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

      <CreatePurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchOrders();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
