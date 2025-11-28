import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Order from './Order.js';
import Menu from './Menu.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: 'id'
    }
  },
  menuId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Menu,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
Menu.hasMany(OrderItem, { foreignKey: 'menuId', as: 'orderItems' });

export default OrderItem;

