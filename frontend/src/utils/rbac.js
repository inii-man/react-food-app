// RBAC configuration for frontend
const permissions = {
  customer: {
    order: ['read', 'create'],
    cart: ['read', 'create', 'update', 'delete'],
    menu: ['read'],
  },
  merchant: {
    order: ['read', 'update'],
    menu: ['read', 'create', 'update', 'delete'],
    cart: ['read', 'create', 'update', 'delete'], // Merchant can also use cart
  },
};

/**
 * Check if user has permission to perform action on resource
 * @param {string} role - User role
 * @param {string} resource - Resource name (e.g., 'order', 'menu', 'cart')
 * @param {string} action - Action name (e.g., 'read', 'create', 'update', 'delete')
 * @returns {boolean}
 */
export const hasPermission = (role, resource, action) => {
  if (!role || !permissions[role]) {
    return false;
  }

  const rolePermissions = permissions[role][resource];
  return rolePermissions && rolePermissions.includes(action);
};

/**
 * Check if user can access a route based on role
 * @param {string} userRole - User role
 * @param {string} requiredRole - Required role for the route
 * @returns {boolean}
 */
export const canAccessRoute = (userRole, requiredRole) => {
  if (!requiredRole) return true;
  return userRole === requiredRole;
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {object}
 */
export const getRolePermissions = (role) => {
  return permissions[role] || {};
};

