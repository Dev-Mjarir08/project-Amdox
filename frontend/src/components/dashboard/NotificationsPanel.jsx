import { useState, useEffect } from 'react';
import { FiBell, FiAlertTriangle, FiCheckCircle, FiInfo, FiDollarSign, FiUser, FiPackage, FiCheckSquare, FiFileText } from 'react-icons/fi';
import api from '../../lib/api.js';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore.js';

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authUser = useAuthStore(s => s.user);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data && Array.isArray(res.data)) {
        setNotifications(res.data.slice(0, 5)); // Show top 5
      }
    } catch (err) {
      console.error("Failed to fetch dashboard notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const getNotificationStyles = (type) => {
    const styles = {
      warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
      success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
      info: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
      error: { bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
      task: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
      leave: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
      invoice: { bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
      expense: { bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
    };
    return styles[type] || styles.info;
  };

  const getIcon = (type) => {
    const icons = {
      warning: FiAlertTriangle,
      success: FiCheckCircle,
      info: FiInfo,
      error: FiAlertTriangle,
      task: FiCheckSquare,
      leave: FiUser,
      invoice: FiFileText,
      expense: FiDollarSign,
    };
    return icons[type] || FiInfo;
  };

  const handleNotificationClick = async (notification) => {
    try {
      await api.put(`/notifications/${notification.id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
    const role = authUser?.role?.toLowerCase() || 'admin';
    switch (notification.type || 'task') {
      case 'invoice':
        if (role === 'admin') navigate('/admin/accounts-payable');
        else if (role === 'hr') navigate('/hr/payroll');
        break;
      case 'leave':
        if (role === 'admin') navigate('/admin/leave-management');
        else if (role === 'hr') navigate('/hr/leave-requests');
        else if (role === 'employee') navigate('/employee/apply-leave');
        break;
      case 'task':
        if (role === 'admin') navigate('/admin/tasks');
        else if (role === 'manager') navigate('/manager/tasks');
        else if (role === 'employee') navigate('/employee/my-tasks');
        break;
      case 'expense':
        if (role === 'admin') navigate('/admin/general-ledger');
        break;
      default:
        break;
    }
  };

  return (
    <article className="erp-panel rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-600">Notifications</h4>
        <div className="relative">
          <FiBell className="h-4 w-4 text-slate-400" />
          {notifications.some(n => !n.read) && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {loading ? (
          <div className="text-center py-4 text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">No new notifications</div>
        ) : (
          notifications.map((notification) => {
            const styles = getNotificationStyles(notification.type);
            const Icon = getIcon(notification.type);

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-3 rounded-lg p-3 transition hover:opacity-80 cursor-pointer ${styles.bg} ${!notification.read ? 'border border-blue-500/10' : ''}`}
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${styles.icon}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
                </div>
                {!notification.read && (
                  <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
                )}
              </div>
            );
          })
        )}
      </div>

      <button 
        onClick={() => {
          const role = authUser?.role?.toLowerCase() || 'admin';
          navigate(`/${role}/dashboard`);
        }} 
        className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:text-slate-300"
      >
        Dashboard Home
      </button>
    </article>
  );
}
