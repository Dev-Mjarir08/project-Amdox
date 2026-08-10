import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore.js';
import Unauthorized from '../../pages/Unauthorized.jsx';

export default function PrivateRoute({ children, allowedRoles } = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // Determine required role from props or from the current path prefix (/admin, /hr, /manager, /employee)
  const pathPrefix = location.pathname.split('/')[1] || '';
  const required = Array.isArray(allowedRoles) && allowedRoles.length > 0 ? allowedRoles.map(r => r.toLowerCase()) : (pathPrefix ? [pathPrefix.toLowerCase()] : []);

  if (required.length === 0) return children;

  // Normalize user roles/role strings
  const userRoles = new Set();
  if (user) {
    if (Array.isArray(user.roles)) user.roles.forEach(r => userRoles.add(String(r).toLowerCase()));
    if (user.role) userRoles.add(String(user.role).toLowerCase());
    if (user.roleName) userRoles.add(String(user.roleName).toLowerCase());
    // also split compound role strings (e.g., "ERP Administrator") into tokens
    if (typeof user.role === 'string') {
      user.role.split(/[^a-z0-9]+/i).forEach(t => t && userRoles.add(t.toLowerCase()));
    }
  }

  const allowed = required.some((r) => userRoles.has(r));
  if (allowed) return children;

  // Show unauthorized page when user lacks required role
  return <Unauthorized requiredRoles={required} />;
}
