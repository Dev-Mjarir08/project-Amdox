import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore.js';

export default function Unauthorized({ requiredRoles } = {}) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl rounded-xl border border-white/70 bg-white/85 p-8 text-slate-700 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
        <p className="mt-2 text-sm">You don't have permission to view this page.</p>
        {requiredRoles && requiredRoles.length > 0 ? (
          <p className="mt-2 text-xs text-slate-500">Required role(s): {requiredRoles.join(', ')}</p>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <Link to="/" className="erp-focus rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">Go to Home</Link>
          <Link to="/login" className="text-sm text-slate-600 underline">Sign in as different user</Link>
          <button onClick={handleLogout} className="ml-auto text-sm text-rose-600">Logout</button>
        </div>
      </div>
    </main>
  );
}
