import express from 'express';
import Menu from '../models/Menu.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';
import { validateCreateMenu, validateUpdateMenu, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// Get all menus (public)
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.findAll({
      include: [{
        model: User,
        as: 'merchant',
        attributes: ['id', 'name', 'email']
      }]
    });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get menu by ID
router.get('/:id', validateIdParam, async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'merchant',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create menu (merchant only)
router.post('/', 
  authenticate, 
  checkPermission('create', 'menu'),
  validateCreateMenu,
  async (req, res) => {
    try {
      const { name, description, price, image } = req.body;

      const menu = await Menu.create({
        name,
        description,
        price,
        image,
        merchantId: req.user.id
      });

      res.status(201).json(menu);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update menu (merchant only, own menu)
router.put('/:id', 
  authenticate, 
  checkPermission('update', 'menu'),
  validateIdParam,
  validateUpdateMenu,
  async (req, res) => {
    try {
      const menu = await Menu.findByPk(req.params.id);
      
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }

      if (menu.merchantId !== req.user.id) {
        return res.status(403).json({ message: 'You can only update your own menu' });
      }

      const { name, description, price, image } = req.body;
      await menu.update({ name, description, price, image });
      
      res.json(menu);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete menu (merchant only, own menu)
router.delete('/:id', 
  authenticate, 
  checkPermission('delete', 'menu'),
  validateIdParam,
  async (req, res) => {
    try {
      const menu = await Menu.findByPk(req.params.id);
      
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }

      if (menu.merchantId !== req.user.id) {
        return res.status(403).json({ message: 'You can only delete your own menu' });
      }

      await menu.destroy();
      res.json({ message: 'Menu deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;

