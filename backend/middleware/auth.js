import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

export const authenticate = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Load user with roles and permissions for RBAC
    const ModelHasRole = (await import('../models/ModelHasRole.js')).default;
    const ModelHasPermission = (await import('../models/ModelHasPermission.js')).default;
    
    const user = await User.findByPk(decoded.userId, {
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

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const isMerchant = (req, res, next) => {
  if (req.user.role !== 'merchant') {
    return res.status(403).json({ message: 'Access denied. Merchant only.' });
  }
  next();
};

export const isCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Access denied. Customer only.' });
  }
  next();
};

