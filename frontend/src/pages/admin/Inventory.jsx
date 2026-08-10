import { useState, useEffect } from 'react';
import { FiPackage, FiDownload, FiFilter, FiPlus, FiSearch, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import AddItemModal from '../../components/modals/AddItemModal.jsx';
import api from '../../lib/api.js';
import { exportToCSV } from '../../lib/utils.js';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [categoryFilter, stockFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/supply-chain/inventory', {
        params: {
          category: categoryFilter,
          stock: stockFilter
        }
      });
      if (response.data && Array.isArray(response.data)) {
        const mapped = response.data.map(i => ({
          id: i.id || i._id,
          sku: i.sku || 'N/A',
          name: i.name || 'Unknown Item',
          category: i.category || 'General',
          quantity: i.stock || 0,
          unitPrice: i.price || 0,
          warehouse: 'Main Warehouse',
          reorderLevel: 5,
          stockStatus: i.status ? i.status.replace('-', '_') : 'in_stock'
        }));
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setIsModalOpen(true);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
                          (item.category && item.category.toLowerCase().includes(searchText.toLowerCase()));
    return matchesSearch;
  });

  const handleExport = () => {
    exportToCSV(filteredItems, 'inventory.csv');
  };

  const getStockBadge = (status) => {
    const styles = {
      in_stock: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      low_stock: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      out_of_stock: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      overstocked: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    };
    return styles[status] || styles.in_stock;
  };

  const totalStockCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const lowStockCount = items.filter(i => i.stockStatus === 'low_stock').length;
  const outOfStockCount = items.filter(i => i.stockStatus === 'out_of_stock').length;
  const totalValuation = items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supply Chain"
        title="Inventory"
        description="Track stock levels, manage warehouses, and automate reorders"
        actions={
          <div className="flex gap-2">
            <button onClick={handleAddItem} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
              <FiPlus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Items Stocked</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalStockCount.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <FiPackage className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Low Stock SKUs</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{lowStockCount}</p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
              <FiAlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Out of Stock</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{outOfStockCount}</p>
            </div>
            <div className="rounded-xl bg-rose-100 p-3 dark:bg-rose-900/30">
              <FiAlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Valuation</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">₹{totalValuation.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <FiTrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
                placeholder="Search items..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
              />
            </div>
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <option value="all">All Categories</option>
            <option value="Furniture">Furniture</option>
            <option value="Electronics">Electronics</option>
            <option value="Lighting">Lighting</option>
            <option value="General">General</option>
          </select>
          <select 
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="erp-focus h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <option value="all">All Stock Levels</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          <button onClick={handleExport} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm text-slate-500">Loading inventory...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Item Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Warehouse</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Quantity</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Reorder Level</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Unit Price</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Total Value</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center text-slate-500">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.sku}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.category}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.warehouse}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{item.reorderLevel}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">₹{(item.quantity * item.unitPrice).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStockBadge(item.stockStatus)}`}>
                          {item.stockStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchItems();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
