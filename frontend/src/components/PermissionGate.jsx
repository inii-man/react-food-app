import { useSelector } from 'react-redux';
import { hasPermission } from '../utils/rbac';

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 */
function PermissionGate({ resource, action, children, fallback = null }) {
  const { user } = useSelector((state) => state.auth);

  if (!user || !hasPermission(user.role, resource, action)) {
    return fallback;
  }

  return children;
}

export default PermissionGate;

