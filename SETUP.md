# Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (optional, for production) or SQLite (default for development)

## Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

**For SQLite (Development - Default):**

```
PORT=5002
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

**For PostgreSQL (Production):**

```
PORT=5002
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=production
DB_DIALECT=postgres
DB_NAME=foodapp
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5002`

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Register as Customer or Merchant**

   - Go to `/register`
   - Fill in your details
   - Select role: Customer or Merchant
   - Click Register

2. **For Customers:**

   - Browse menu at `/menu`
   - Add items to cart
   - View cart at `/cart`
   - Place order
   - Track order status at `/orders`

3. **For Merchants:**
   - Go to `/merchant/dashboard`
   - Manage menu at `/merchant/menu` (Add, Edit, Delete items)
   - View and update orders at `/merchant/orders`

## Database

The app supports both **SQLite** (default for development) and **PostgreSQL** (for production).

### SQLite (Default)

- No setup required
- Database file (`database.sqlite`) will be created automatically in the `backend` directory
- Perfect for development and testing

### PostgreSQL Setup

1. Install PostgreSQL on your system
2. Create a database:
   ```sql
   CREATE DATABASE foodapp;
   ```
3. Update `.env` file with PostgreSQL credentials (see above)
4. Set `DB_DIALECT=postgres` in `.env`
5. Run the server - tables will be created automatically via Sequelize

**Note:** The app will automatically use SQLite if `DB_DIALECT` is not set to `postgres`.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Menu (Public)

- `GET /api/menu` - Get all menus
- `GET /api/menu/:id` - Get menu by ID

### Menu (Merchant only)

- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Cart (Customer only)

- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:menuId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders

- `GET /api/order` - Get orders (customer: own orders, merchant: all orders)
- `GET /api/order/:id` - Get order by ID
- `POST /api/order` - Create order (customer only)
- `PUT /api/order/:id/status` - Update order status (merchant only)

## Features Implemented

✅ User Authentication (JWT)
✅ Role-based access (Customer/Merchant)
✅ Menu CRUD operations
✅ Shopping cart functionality
✅ Order placement and tracking
✅ Order status management
✅ Protected routes
✅ Responsive UI with Tailwind CSS
✅ Redux state management
✅ React Router navigation
