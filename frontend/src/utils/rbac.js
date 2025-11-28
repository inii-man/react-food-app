/**
 * Check if user has permission (dynamic - from Redux state)
 * @param {object} user - User object from Redux state
 * @param {string} permissionName - Permission name (e.g., 'menu.create', 'order.view.all')
 * @returns {boolean}
 */
export const hasPermission = (user, permissionName) => {
  if (!user || !user.permissions) {
    return false;
  }

  // Check if user has the permission (from roles or direct)
  return user.permissions.includes(permissionName);
};

/**
 * Check if user has any of the permissions
 * @param {object} user - User object from Redux state
 * @param {string[]} permissionNames - Array of permission names
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissionNames) => {
  if (!user || !user.permissions) {
    return false;
  }

  return permissionNames.some(permissionName => 
    user.permissions.includes(permissionName)
  );
};

/**
 * Check if user has all permissions
 * @param {object} user - User object from Redux state
 * @param {string[]} permissionNames - Array of permission names
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissionNames) => {
  if (!user || !user.permissions) {
    return false;
  }

  return permissionNames.every(permissionName => 
    user.permissions.includes(permissionName)
  );
};

/**
 * Check if user has specific role
 * @param {object} user - User object from Redux state
 * @param {string} roleName - Role name
 * @returns {boolean}
 */
export const hasRole = (user, roleName) => {
  if (!user || !user.roles) {
    return false;
  }

  return user.roles.includes(roleName);
};

/**
 * Check if user has any of the roles
 * @param {object} user - User object from Redux state
 * @param {string[]} roleNames - Array of role names
 * @returns {boolean}
 */
export const hasAnyRole = (user, roleNames) => {
  if (!user || !user.roles) {
    return false;
  }

  return roleNames.some(roleName => user.roles.includes(roleName));
};

/**
 * Check if user can access a route based on role
 * @param {object} user - User object from Redux state
 * @param {string} requiredRole - Required role for the route
 * @returns {boolean}
 */
export const canAccessRoute = (user, requiredRole) => {
  if (!requiredRole) return true;
  if (!user) return false;
  
  // Check if user has the required role
  return hasRole(user, requiredRole);
};

/**
 * Get all permissions for user
 * @param {object} user - User object from Redux state
 * @returns {string[]}
 */
export const getUserPermissions = (user) => {
  if (!user || !user.permissions) {
    return [];
  }
  return user.permissions;
};

/**
 * Get all roles for user
 * @param {object} user - User object from Redux state
 * @returns {string[]}
 */
export const getUserRoles = (user) => {
  if (!user || !user.roles) {
    return [];
  }
  return user.roles;
};

