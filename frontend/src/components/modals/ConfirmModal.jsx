import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This step cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isDanger 
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' 
                : 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
            }`}>
              {isDanger ? <FiTrash2 className="h-6 w-6" /> : <FiAlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Confirmation required
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="erp-focus h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`erp-focus h-10 rounded-xl px-5 text-xs font-bold text-white shadow-md transition disabled:opacity-50 ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' 
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
