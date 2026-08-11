import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiBell,
  FiChevronDown,
  FiCheckSquare,
  FiDollarSign,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSearch,
  FiSettings,
  FiSun,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import useAuthStore from "../../stores/useAuthStore.js";
import api from "../../lib/api.js";
import { getImageUrl } from "../../lib/utils.js";

export default function Navbar({ user: propUser, workspace, onOpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const authUser = useAuthStore((state) => state.user);

  // Dynamic user data
  const user = authUser ? {
    ...propUser,
    name: authUser.name || propUser?.name || 'User',
    role: authUser.title || (authUser.role ? authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1) : propUser?.role || 'Member'),
    initials: authUser.name ? authUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : propUser?.initials || 'U'
  } : propUser;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const storedTheme = window.localStorage.getItem("amdox-theme");
    if (storedTheme) return storedTheme === "dark";
    return false; // Default to clean light enterprise mode
  });
  const [notifications, setNotifications] = useState([]);

  // Compute clean breadcrumb path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle = pathParts.length > 1 
    ? pathParts[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Dashboard';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        const list = Array.isArray(res.data) ? res.data : (res.data?.data && Array.isArray(res.data.data) ? res.data.data : []);
        setNotifications(list);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    if (authUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [authUser]);

  const handleSignOut = () => {
    logout();
    navigate("/login");
    setIsProfileOpen(false);
  };

  const handleProfileClick = () => {
    const role = authUser?.role?.toLowerCase() || 'admin';
    navigate(`/${role}/settings?tab=profile`);
    setIsProfileOpen(false);
  };

  const handleAccountSettingsClick = () => {
    const role = authUser?.role?.toLowerCase() || 'admin';
    navigate(`/${role}/settings?tab=account`);
    setIsProfileOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    setIsNotificationOpen(false);
    try {
      await api.put(`/notifications/${notification.id}/read`);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
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

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("amdox-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="erp-focus inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 lg:hidden dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            aria-label="Open sidebar"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          {/* Breadcrumb Path */}
          <div className="hidden items-center gap-2 text-xs sm:flex">
            <span className="font-semibold text-slate-400 dark:text-slate-500">
              {workspace || "Enterprise"}
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {pageTitle}
            </span>
          </div>
        </div>

        {/* Center: Global Search Input */}
        <div className="relative flex-1 max-w-md mx-2">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search employees, invoices, tasks, projects..."
            className="erp-focus h-9 w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        {/* Right: Controls & User Profile */}
        <div className="flex items-center gap-2">
          
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationOpen((current) => !current)}
              className="erp-focus relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              aria-label="Notifications"
              title="Notifications"
            >
              <FiBell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-modal dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Notifications</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/20">
                      {unreadCount} Unread
                    </span>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-400">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const isUnread = !notification.read;
                      return (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800 ${isUnread ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isUnread ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                            <FiBell className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                              {notification.title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {isUnread && (
                            <div className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800 text-center">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Mark All as Read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setIsDarkMode((current) => !current)}
            className="erp-focus inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {isDarkMode ? <FiSun className="h-4 w-4 text-amber-400" /> : <FiMoon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* User Profile Pill Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((current) => !current)}
              className="erp-focus flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 shadow-2xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-black text-white overflow-hidden">
                {(authUser?.profileImage || user?.profileImage) ? (
                  <img src={getImageUrl(authUser?.profileImage || user?.profileImage)} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  user.initials
                )}
              </span>
              <div className="hidden text-left sm:block">
                <span className="block max-w-24 truncate text-xs font-bold text-slate-900 leading-tight dark:text-slate-100">
                  {user.name}
                </span>
              </div>
              <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-slate-600 sm:inline dark:bg-slate-800 dark:text-slate-300">
                {user.role}
              </span>
              <FiChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-modal dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500">{user.role}</p>
                </div>
                <button onClick={handleProfileClick} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800">
                  <FiUser className="h-4 w-4 text-slate-400" />
                  My Profile
                </button>
                <button onClick={handleAccountSettingsClick} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800">
                  <FiSettings className="h-4 w-4 text-slate-400" />
                  Account Settings
                </button>
                <button
                  type="button"
                  onClick={() => setIsDarkMode((current) => !current)}
                  className="flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    {isDarkMode ? <FiSun className="h-4 w-4 text-amber-400" /> : <FiMoon className="h-4 w-4 text-slate-400" />}
                    <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                  </div>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {isDarkMode ? "ON" : "OFF"}
                  </span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button 
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold text-danger transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <FiLogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
