# Food App - Fullstack Application

Aplikasi food ordering dengan fitur:
- **Customer**: Browse menu, add to cart, place order, track order status
- **Merchant**: CRUD menu, view orders, update order status

## Tech Stack

### Frontend
- React 18
- Vite
- Redux Toolkit
- React Router v6
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- Sequelize (SQLite for development)
- JWT Authentication
- bcrypt

## Setup

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Features

### Customer Features
- Register/Login
- Browse food menu
- Add items to cart
- Place orders
- Track order status

### Merchant Features
- Register/Login as merchant
- CRUD food menu items
- View all orders
- Update order status

## Database Schema

- Users (id, name, email, password, role: 'customer' | 'merchant')
- Menus (id, name, description, price, image, merchantId)
- Orders (id, customerId, status, totalPrice)
- OrderItems (id, orderId, menuId, quantity, price)

