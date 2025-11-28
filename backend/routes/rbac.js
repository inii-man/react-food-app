import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { hasPermission, hasAnyPermission, hasRole } from '../middleware/rbac.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import User from '../models/User.js';
import ModelHasRole from '../models/ModelHasRole.js';
import ModelHasPermission from '../models/ModelHasPermission.js';

const router = express.Router();

// Get all roles (superadmin only)
router.get('/roles',
  authenticate,
  hasRole('superadmin'),
  async (req, res) => {
    try {
      const roles = await Role.findAll({
        include: [{ model: Permission, as: 'permissions' }],
        order: [['name', 'ASC']]
      });
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get role by ID (superadmin only)
router.get('/roles/:id',
  authenticate,
  hasRole('superadmin'),
  async (req, res) => {
    try {
      const role = await Role.findByPk(req.params.id, {
        include: [{ model: Permission, as: 'permissions' }]
      });
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all permissions (superadmin only)
router.get('/permissions',
  authenticate,
  hasRole('superadmin'),
  async (req, res) => {
    try {
      const permissions = await Permission.findAll({
        order: [['name', 'ASC']]
      });
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get current user roles and permissions
router.get('/user/me',
  authenticate,
  async (req, res) => {
    try {
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
        return res.status(404).json({ message: 'User not found' });
      }

      // Flatten permissions (direct + from roles)
      const allPermissions = [
        ...user.permissions.map(p => p.name),
        ...user.roles.flatMap(r => r.permissions.map(p => p.name))
      ];

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map(r => ({
          id: r.id,
          name: r.name
        })),
        permissions: [...new Set(allPermissions)], // Remove duplicates
        directPermissions: user.permissions.map(p => p.name)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Assign role to user (superadmin only)
router.post('/users/:userId/roles',
  authenticate,
  hasRole('superadmin'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { roleName } = req.body;

      if (!roleName) {
        return res.status(400).json({ message: 'roleName is required' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.assignRole(roleName);

      res.json({ message: 'Role assigned successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Remove role from user (superadmin only)
router.delete('/users/:userId/roles/:roleName',
  authenticate,
  hasRole('superadmin'),
  async (req, res) => {
    try {
      const { userId, roleName } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.removeRole(roleName);

      res.json({ message: 'Role removed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Give permission to user (direct) (superadmin only)
router.post('/users/:userId/permissions',
  authenticate,
  hasRole('superadmin'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { permissionName } = req.body;

      if (!permissionName) {
        return res.status(400).json({ message: 'permissionName is required' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.givePermission(permissionName);

      res.json({ message: 'Permission granted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Revoke permission from user (superadmin only)
router.delete('/users/:userId/permissions/:permissionName',
  authenticate,
  hasRole('superadmin'),
  async (req, res) => {
    try {
      const { userId, permissionName } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.revokePermission(permissionName);

      res.json({ message: 'Permission revoked successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Assign permissions to role (superadmin only)
router.post('/roles/:roleId/permissions',
  authenticate,
  hasRole('superadmin'),
  async (req, res) => {
    try {
      const { roleId } = req.params;
      const { permissionNames } = req.body; // Array of permission names

      if (!permissionNames || !Array.isArray(permissionNames)) {
        return res.status(400).json({ message: 'permissionNames array is required' });
      }

      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      await role.syncPermissions(permissionNames);

      res.json({ message: 'Permissions assigned to role successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;

