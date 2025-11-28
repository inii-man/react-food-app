import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { canAccessRoute, hasRole } from "../utils/rbac";

/**
 * RBAC Protected Route Component
 * Wraps routes that require specific role access
 * Now supports dynamic roles from database
 */
function RBACRoute({ children, requiredRole, requiredPermission }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && !canAccessRoute(user, requiredRole)) {
    // Redirect based on user's first role
    if (user?.roles && user.roles.length > 0) {
      if (user.roles.includes("superadmin")) {
        return <Navigate to="/superadmin/rbac" replace />;
      }
      if (user.roles.includes("merchant")) {
        return <Navigate to="/merchant/dashboard" replace />;
      }
      if (user.roles.includes("admin")) {
        return <Navigate to="/admin/dashboard" replace />;
      }
    }
    return <Navigate to="/menu" replace />;
  }

  // Check permission if required
  if (requiredPermission) {
    const { hasPermission } = require("../utils/rbac");
    if (!hasPermission(user, requiredPermission)) {
      // Redirect based on user's first role
      if (user?.roles && user.roles.length > 0) {
        if (user.roles.includes("merchant")) {
          return <Navigate to="/merchant/dashboard" replace />;
        }
        if (user.roles.includes("admin")) {
          return <Navigate to="/admin/dashboard" replace />;
        }
      }
      return <Navigate to="/menu" replace />;
    }
  }

  return children;
}

export default RBACRoute;
