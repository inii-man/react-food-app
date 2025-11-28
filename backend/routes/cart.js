import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';
import { validateAddToCart, validateUpdateCart, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// In-memory cart storage (in production, use Redis or database)
const carts = new Map();

// Get cart
router.get('/', 
  authenticate, 
  checkPermission('read', 'cart'),
  (req, res) => {
    const cart = carts.get(req.user.id) || [];
    res.json(cart);
  }
);

// Add to cart
router.post('/add', 
  authenticate, 
  checkPermission('create', 'cart'),
  validateAddToCart,
  (req, res) => {
    const { menuId, quantity } = req.body;

    let cart = carts.get(req.user.id) || [];
    const existingItem = cart.find(item => item.menuId === menuId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ menuId, quantity });
    }
    
    carts.set(req.user.id, cart);
    res.json(cart);
  }
);

// Update cart item
router.put('/update', 
  authenticate, 
  checkPermission('update', 'cart'),
  validateUpdateCart,
  (req, res) => {
    const { menuId, quantity } = req.body;

    let cart = carts.get(req.user.id) || [];
    const item = cart.find(item => item.menuId === menuId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    item.quantity = quantity;
    carts.set(req.user.id, cart);
    res.json(cart);
  }
);

// Remove from cart
router.delete('/remove/:menuId', 
  authenticate, 
  checkPermission('delete', 'cart'),
  validateIdParam,
  (req, res) => {
    let cart = carts.get(req.user.id) || [];
    cart = cart.filter(item => item.menuId !== parseInt(req.params.menuId));
    carts.set(req.user.id, cart);
    res.json(cart);
  }
);

// Clear cart
router.delete('/clear', 
  authenticate, 
  checkPermission('delete', 'cart'),
  (req, res) => {
    carts.set(req.user.id, []);
    res.json({ message: 'Cart cleared' });
  }
);

export default router;

