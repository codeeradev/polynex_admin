import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

/**
 * Wraps protected pages: redirects to /login if unauthenticated, and
 * optionally restricts to specific roles, e.g.
 *   <ProtectedRoute roles={['SuperAdmin']}><Settings /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (isHydrating) {
    return <div style={{ padding: 'var(--space-5)' }}>Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
