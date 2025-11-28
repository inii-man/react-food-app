import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { canAccessRoute } from "../utils/rbac";

/**
 * RBAC Protected Route Component
 * Wraps routes that require specific role access
 */
function RBACRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !canAccessRoute(user?.role, requiredRole)) {
    // Redirect based on role
    if (user?.role === "merchant") {
      return <Navigate to="/merchant/dashboard" replace />;
    }
    return <Navigate to="/menu" replace />;
  }

  return children;
}

export default RBACRoute;
