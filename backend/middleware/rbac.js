import AccessControl from 'accesscontrol';

// Define roles and permissions
const ac = new AccessControl();

// Customer permissions
ac.grant('customer')
  .readOwn('order')
  .createOwn('order')
  .readOwn('cart')
  .createOwn('cart')
  .updateOwn('cart')
  .deleteOwn('cart')
  .readAny('menu');

// Merchant permissions
ac.grant('merchant')
  .extend('customer') // Merchant inherits customer permissions
  .readAny('order')
  .updateAny('order')
  .createOwn('menu')
  .readOwn('menu')
  .updateOwn('menu')
  .deleteOwn('menu');

// RBAC middleware
export const checkPermission = (action, resource) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const role = req.user.role;
      
      // Map action to accesscontrol format
      // For "create", check both createOwn and createAny
      let permission;
      if (action === 'create') {
        // Try createOwn first, then createAny
        permission = ac.can(role).createOwn(resource);
        if (!permission.granted) {
          permission = ac.can(role).createAny(resource);
        }
      } else if (action === 'read') {
        // Try readOwn first, then readAny
        permission = ac.can(role).readOwn(resource);
        if (!permission.granted) {
          permission = ac.can(role).readAny(resource);
        }
      } else if (action === 'update') {
        // Try updateOwn first, then updateAny
        permission = ac.can(role).updateOwn(resource);
        if (!permission.granted) {
          permission = ac.can(role).updateAny(resource);
        }
      } else if (action === 'delete') {
        // Try deleteOwn first, then deleteAny
        permission = ac.can(role).deleteOwn(resource);
        if (!permission.granted) {
          permission = ac.can(role).deleteAny(resource);
        }
      } else {
        // Try the action directly
        permission = ac.can(role)[action](resource);
      }

      if (!permission.granted) {
        return res.status(403).json({ 
          message: `Access denied. You don't have permission to ${action} ${resource}.` 
        });
      }

      req.permission = permission;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Permission check failed', error: error.message });
    }
  };
};

// Helper function to check ownership
export const checkOwnership = (resource, resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Merchants can access any order (for managing orders)
    if (req.user.role === 'merchant' && resource === 'order') {
      return next();
    }

    // Check if user owns the resource
    if (resourceUserId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only access your own resources.' });
    }

    next();
  };
};

// Export access control instance for direct use if needed
export { ac };

