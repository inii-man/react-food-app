import { useSelector } from 'react-redux';
import { hasPermission, hasAnyPermission, hasRole, hasAnyRole } from '../utils/rbac';

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions (dynamic from database)
 */
function PermissionGate({ 
  permission, 
  anyPermission, 
  role, 
  anyRole,
  children, 
  fallback = null 
}) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return fallback;
  }

  // Check permission
  if (permission && !hasPermission(user, permission)) {
    return fallback;
  }

  // Check any permission
  if (anyPermission && !hasAnyPermission(user, anyPermission)) {
    return fallback;
  }

  // Check role
  if (role && !hasRole(user, role)) {
    return fallback;
  }

  // Check any role
  if (anyRole && !hasAnyRole(user, anyRole)) {
    return fallback;
  }

  return children;
}

export default PermissionGate;

