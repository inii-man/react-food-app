import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import ModelHasRole from '../models/ModelHasRole.js';
import ModelHasPermission from '../models/ModelHasPermission.js';

// Check if user has specific permission
export const hasPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Reload user with roles and permissions
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: {
              model: ModelHasRole,
              where: { model_type: 'User' },
              attributes: []
            },
            include: [{
              model: Permission,
              as: 'permissions'
            }]
          },
          {
            model: Permission,
            as: 'permissions',
            through: {
              model: ModelHasPermission,
              where: { model_type: 'User' },
              attributes: []
            }
          }
        ]
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const hasPermission = await user.hasPermission(permissionName);

      if (!hasPermission) {
        return res.status(403).json({
          message: `Access denied. You don't have permission: ${permissionName}`
        });
      }

      req.user = user; // Update req.user with loaded relationships
      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

// Check if user has any of the permissions
export const hasAnyPermission = (permissionNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findByPk(req.user.id, {
        include: [
          { 
            model: Role, 
            as: 'roles',
            through: {
              model: ModelHasRole,
              where: { model_type: 'User' },
              attributes: []
            },
            include: [{ 
              model: Permission, 
              as: 'permissions' 
            }] 
          },
          { 
            model: Permission, 
            as: 'permissions',
            through: {
              model: ModelHasPermission,
              where: { model_type: 'User' },
              attributes: []
            }
          }
        ]
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const hasAny = await user.hasAnyPermission(permissionNames);

      if (!hasAny) {
        return res.status(403).json({
          message: `Access denied. Required permissions: ${permissionNames.join(', ')}`
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

// Check if user has all permissions
export const hasAllPermissions = (permissionNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findByPk(req.user.id, {
        include: [
          { 
            model: Role, 
            as: 'roles',
            through: {
              model: ModelHasRole,
              where: { model_type: 'User' },
              attributes: []
            },
            include: [{ 
              model: Permission, 
              as: 'permissions' 
            }] 
          },
          { 
            model: Permission, 
            as: 'permissions',
            through: {
              model: ModelHasPermission,
              where: { model_type: 'User' },
              attributes: []
            }
          }
        ]
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const hasAll = await user.hasAllPermissions(permissionNames);

      if (!hasAll) {
        return res.status(403).json({
          message: `Access denied. Required all permissions: ${permissionNames.join(', ')}`
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

// Check if user has specific role
export const hasRole = (roleName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findByPk(req.user.id, {
        include: [{ 
          model: Role, 
          as: 'roles',
          through: {
            model: ModelHasRole,
            where: { model_type: 'User' },
            attributes: []
          }
        }]
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const hasRole = await user.hasRole(roleName);

      if (!hasRole) {
        return res.status(403).json({
          message: `Access denied. Required role: ${roleName}`
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Role check failed',
        error: error.message
      });
    }
  };
};

// Check if user has any of the roles
export const hasAnyRole = (roleNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findByPk(req.user.id, {
        include: [{ 
          model: Role, 
          as: 'roles',
          through: {
            model: ModelHasRole,
            where: { model_type: 'User' },
            attributes: []
          }
        }]
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const hasAny = await user.hasAnyRole(roleNames);

      if (!hasAny) {
        return res.status(403).json({
          message: `Access denied. Required roles: ${roleNames.join(', ')}`
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Role check failed',
        error: error.message
      });
    }
  };
};

// Helper function to check ownership (for backward compatibility)
export const checkOwnership = (resource, resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has permission to manage all resources
    if (req.user.hasPermission && req.user.hasPermission('order.view.all')) {
      return next();
    }

    // Check if user owns the resource
    if (resourceUserId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only access your own resources.' 
      });
    }

    next();
  };
};
