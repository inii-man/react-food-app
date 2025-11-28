import express from 'express';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Menu from '../models/Menu.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';
import { validateCreateOrder, validateUpdateOrderStatus, validateIdParam } from '../middleware/validation.js';

const router = express.Router();

// Get all orders (merchant: all orders, customer: own orders)
router.get('/', 
  authenticate, 
  checkPermission('read', 'order'),
  async (req, res) => {
    try {
      let orders;
      
      if (req.user.role === 'merchant') {
        orders = await Order.findAll({
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'name', 'email']
            },
            {
              model: OrderItem,
              as: 'items',
              include: [{
                model: Menu,
                as: 'menu',
                attributes: ['id', 'name', 'price', 'image']
              }]
            }
          ],
          order: [['createdAt', 'DESC']]
        });
      } else {
        orders = await Order.findAll({
          where: { customerId: req.user.id },
          include: [{
            model: OrderItem,
            as: 'items',
            include: [{
              model: Menu,
              as: 'menu',
              attributes: ['id', 'name', 'price', 'image']
            }]
          }],
          order: [['createdAt', 'DESC']]
        });
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get order by ID
router.get('/:id', 
  authenticate, 
  checkPermission('read', 'order'),
  validateIdParam,
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'name', 'email']
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Menu,
              as: 'menu',
              attributes: ['id', 'name', 'price', 'image']
            }]
          }
        ]
      });
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check authorization
      if (req.user.role === 'customer' && order.customerId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create order from cart (customer only)
router.post('/', 
  authenticate, 
  checkPermission('create', 'order'),
  validateCreateOrder,
  async (req, res) => {
    try {
      const { items } = req.body; // [{ menuId, quantity }]

      // Calculate total price
      let totalPrice = 0;
      const orderItems = [];

      for (const item of items) {
        const menu = await Menu.findByPk(item.menuId);
        if (!menu) {
          return res.status(404).json({ message: `Menu with ID ${item.menuId} not found` });
        }
        const itemTotal = parseFloat(menu.price) * item.quantity;
        totalPrice += itemTotal;
        orderItems.push({
          menuId: item.menuId,
          quantity: item.quantity,
          price: menu.price
        });
      }

      // Create order
      const order = await Order.create({
        customerId: req.user.id,
        totalPrice,
        status: 'pending'
      });

      // Create order items
      for (const item of orderItems) {
        await OrderItem.create({
          orderId: order.id,
          menuId: item.menuId,
          quantity: item.quantity,
          price: item.price
        });
      }

      // Fetch order with items
      const createdOrder = await Order.findByPk(order.id, {
        include: [{
          model: OrderItem,
          as: 'items',
          include: [{
            model: Menu,
            as: 'menu',
            attributes: ['id', 'name', 'price', 'image']
          }]
        }]
      });

      res.status(201).json(createdOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update order status (merchant only)
router.put('/:id/status', 
  authenticate, 
  checkPermission('update', 'order'),
  validateIdParam,
  validateUpdateOrderStatus,
  async (req, res) => {
    try {
      const { status } = req.body;

      const order = await Order.findByPk(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      await order.update({ status });
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;

