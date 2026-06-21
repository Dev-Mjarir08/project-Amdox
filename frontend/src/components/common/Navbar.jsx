import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../../redux/slices/notificationSlice";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSearch,
  FiSettings,
  FiSun,
  FiUser,
  FiCheck,
} from "react-icons/fi";

export default function Navbar({ user, workspace, onOpenSidebar }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { list: notifications, unreadCount } = useSelector((state) => state.notifications);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const storedTheme = window.localStorage.getItem("amdox-theme");
    if (storedTheme) return storedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("amdox-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Load notifications periodically
  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleMarkRead = (id, e) => {
    e.stopPropagation();
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="erp-focus inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Open navigation"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 flex-col md:flex">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </span>
          <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {workspace}
          </span>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search employees, projects, tasks..."
            className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm text-slate-800 transition placeholder:text-slate-400 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen((current) => !current);
                setIsProfileOpen(false);
              }}
              className="erp-focus relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-655 text-slate-600 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              aria-label="Notifications"
              title="Notifications"
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-danger dark:border-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Notifications ({unreadCount})
                  </p>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs italic text-slate-400">No new alerts</p>
                  ) : (
                    notifications.slice(0, 5).map((noti) => (
                      <div
                        key={noti.id}
                        className={`p-3 transition ${
                          noti.read ? "bg-white dark:bg-slate-900" : "bg-blue-50/50 dark:bg-slate-900/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              {noti.title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                              {noti.message}
                            </p>
                          </div>
                          {!noti.read && (
                            <button
                              onClick={(e) => handleMarkRead(noti.id, e)}
                              className="text-[10px] font-bold text-slate-400 hover:text-primary"
                              title="Mark as read"
                            >
                              <FiCheck className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsDarkMode((current) => !current)}
            className="erp-focus inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-655 text-slate-600 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {isDarkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen((current) => !current);
                setIsNotificationsOpen(false);
              }}
              className="erp-focus flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white pl-1.5 pr-2 shadow-sm transition hover:border-primary/40 dark:border-slate-800 dark:bg-slate-900"
              aria-expanded={isProfileOpen}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                {user.initials}
              </span>
              <span className="hidden max-w-28 truncate text-sm font-semibold text-slate-700 sm:inline dark:text-slate-200">
                {user.name}
              </span>
              <FiChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>

            {isProfileOpen ? (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-405">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/employee/profile");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-655 text-slate-600 transition hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FiUser className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/admin/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-655 text-slate-600 transition hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FiSettings className="h-4 w-4" />
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-danger transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <FiLogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
