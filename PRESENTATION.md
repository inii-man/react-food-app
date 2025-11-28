# Food App - Fullstack Application
## Presentasi Teknis & Implementasi

---

## Slide 1: Cover

# 🍔 Food App
## Fullstack Application dengan RBAC, Formik, Material UI

**Aplikasi Food Ordering System**
- Role-Based Access Control (RBAC)
- Form Management dengan Formik & Yup
- Material UI & DataTables
- Best Practices Implementation

---

## Slide 2: Agenda

# 📋 Agenda Presentasi

1. **Overview Aplikasi**
   - Fitur & Use Cases
   - User Roles

2. **Tech Stack**
   - Frontend Technologies
   - Backend Technologies

3. **Arsitektur & Database**
   - System Architecture
   - Database Schema

4. **Implementasi Fitur**
   - Form Management (Formik + Yup)
   - Material UI & DataTables
   - RBAC System

5. **Best Practices**
   - Validation (Frontend & Backend)
   - Security Implementation
   - State Management

6. **Demo & Flow**
   - User Journey
   - API Flow

---

## Slide 3: Overview Aplikasi

# 🎯 Overview Aplikasi

## Food App - E-Commerce Food Ordering System

Aplikasi fullstack untuk sistem pemesanan makanan online dengan dua jenis pengguna:

### 👤 Customer (Pelanggan)
- Register & Login
- Browse menu makanan
- Add items ke shopping cart
- Place orders
- Track order status

### 🏪 Merchant (Pedagang)
- Register & Login sebagai merchant
- CRUD menu items (Create, Read, Update, Delete)
- View semua orders
- Update order status (pending → preparing → ready → delivered)

---

## Slide 4: Tech Stack - Frontend

# 💻 Tech Stack - Frontend

## Core Technologies

### **React 18**
- Modern React dengan hooks
- Component-based architecture
- Virtual DOM untuk performa optimal

### **Vite**
- Build tool yang sangat cepat
- Hot Module Replacement (HMR)
- Optimized production builds

### **Redux Toolkit**
- State management yang powerful
- Simplified Redux dengan less boilerplate
- Async thunks untuk API calls

### **React Router v6**
- Client-side routing
- Protected routes dengan RBAC
- Dynamic route parameters

---

## Slide 5: Tech Stack - Frontend (Lanjutan)

# 💻 Tech Stack - Frontend (Lanjutan)

## UI & Form Libraries

### **Material UI (MUI)**
- Comprehensive component library
- Consistent design system
- Responsive & accessible components
- Theme customization

### **MUI X DataGrid**
- Advanced data table component
- Built-in sorting, filtering, pagination
- Column customization
- Row selection & actions

### **Formik**
- Form state management
- Form validation integration
- Error handling
- Field-level validation

### **Yup**
- Schema-based validation
- Type-safe validation rules
- Async validation support
- Custom validation messages

---

## Slide 6: Tech Stack - Backend

# ⚙️ Tech Stack - Backend

## Core Technologies

### **Node.js & Express**
- JavaScript runtime
- Web framework untuk RESTful API
- Middleware architecture
- Route handling

### **Sequelize ORM**
- SQL database ORM
- Model definitions
- Database migrations
- Relationship management

### **SQLite (Development)**
- Lightweight database
- File-based storage
- Perfect for development
- Easy to migrate to PostgreSQL/MySQL

### **JWT (JSON Web Tokens)**
- Stateless authentication
- Token-based security
- 7-day expiration
- Secure user sessions

---

## Slide 7: Tech Stack - Backend (Lanjutan)

# ⚙️ Tech Stack - Backend (Lanjutan)

## Security & Validation

### **bcryptjs**
- Password hashing
- Salt rounds (10)
- Secure password storage
- Pre-hook hashing di Sequelize

### **express-validator**
- Input validation middleware
- Sanitization
- Custom validation rules
- Error message formatting

### **accesscontrol**
- RBAC implementation
- Permission management
- Role-based access rules
- Granular permission control

### **CORS**
- Cross-Origin Resource Sharing
- API security
- Allowed origins configuration

---

## Slide 8: Arsitektur Aplikasi

# 🏗️ Arsitektur Aplikasi

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages   │  │Components│  │  Redux   │              │
│  │          │  │          │  │  Store   │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │             │                     │
│       └─────────────┴─────────────┘                     │
│                    │                                     │
│              Axios Client                                │
└────────────────────┼─────────────────────────────────────┘
                     │ HTTP/REST API
                     │ JWT Authentication
┌────────────────────┼─────────────────────────────────────┐
│                    │         BACKEND (Express)            │
│              ┌─────▼─────┐                               │
│              │ Middleware│                               │
│              │  - Auth   │                               │
│              │  - RBAC   │                               │
│              │  - Valid  │                               │
│              └─────┬─────┘                               │
│                    │                                     │
│              ┌─────▼─────┐                               │
│              │  Routes   │                               │
│              │  - Auth   │                               │
│              │  - Menu   │                               │
│              │  - Order  │                               │
│              │  - Cart   │                               │
│              └─────┬─────┘                               │
│                    │                                     │
│              ┌─────▼─────┐                               │
│              │  Models   │                               │
│              │  (ORM)    │                               │
│              └─────┬─────┘                               │
└────────────────────┼─────────────────────────────────────┘
                     │
              ┌──────▼──────┐
              │   Database  │
              │   (SQLite)  │
              └─────────────┘
```

---

## Slide 9: Database Schema

# 🗄️ Database Schema

## Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    Users    │         │    Menus    │         │   Orders    │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │         │ id (PK)     │
│ name        │         │ name        │         │ customerId  │
│ email (UK)  │◄──┐     │ description │         │ status      │
│ password    │   │     │ price       │         │ totalPrice  │
│ role        │   │     │ image       │         │ createdAt   │
│ createdAt   │   │     │ merchantId  │         │ updatedAt   │
│ updatedAt   │   │     │ createdAt   │         └──────┬──────┘
└─────────────┘   │     │ updatedAt   │                │
                  │     └─────────────┘                │
                  │           │                        │
                  │           │                        │
                  │     ┌─────▼──────────┐             │
                  │     │  OrderItems   │             │
                  │     ├───────────────┤             │
                  │     │ id (PK)       │             │
                  └─────┤ orderId (FK)  │◄────────────┘
                        │ menuId (FK)   │
                        │ quantity      │
                        │ price         │
                        └───────────────┘
```

### Relationships:
- **User** (1) ──< **Menu** (Many) - Merchant owns menus
- **User** (1) ──< **Order** (Many) - Customer creates orders
- **Order** (1) ──< **OrderItem** (Many) - Order contains items
- **Menu** (1) ──< **OrderItem** (Many) - Menu referenced in items

---

## Slide 10: Database Schema - Detail

# 🗄️ Database Schema - Detail

## Table Definitions

### **Users Table**
```sql
- id: INTEGER (Primary Key, Auto Increment)
- name: STRING (Required)
- email: STRING (Required, Unique)
- password: STRING (Hashed with bcrypt)
- role: ENUM('customer', 'merchant')
- createdAt: DATE
- updatedAt: DATE
```

### **Menus Table**
```sql
- id: INTEGER (Primary Key, Auto Increment)
- name: STRING (Required)
- description: TEXT (Optional)
- price: DECIMAL (Required)
- image: STRING (URL, Optional)
- merchantId: INTEGER (Foreign Key → Users.id)
- createdAt: DATE
- updatedAt: DATE
```

### **Orders Table**
```sql
- id: INTEGER (Primary Key, Auto Increment)
- customerId: INTEGER (Foreign Key → Users.id)
- status: ENUM('pending', 'preparing', 'ready', 'delivered', 'cancelled')
- totalPrice: DECIMAL
- createdAt: DATE
- updatedAt: DATE
```

### **OrderItems Table**
```sql
- id: INTEGER (Primary Key, Auto Increment)
- orderId: INTEGER (Foreign Key → Orders.id)
- menuId: INTEGER (Foreign Key → Menus.id)
- quantity: INTEGER
- price: DECIMAL (Snapshot price at order time)
```

---

## Slide 11: Fitur Customer - Overview

# 👤 Fitur Customer

## User Journey

### 1. **Authentication**
- Register dengan role "customer"
- Login dengan email & password
- JWT token disimpan di localStorage
- Auto-redirect ke menu page setelah login

### 2. **Browse Menu**
- View semua menu items dari semua merchants
- Display dalam DataGrid dengan:
  - Image, Name, Description, Price
  - Add to Cart button
- Real-time menu updates

### 3. **Shopping Cart**
- Add items ke cart
- Update quantity
- Remove items
- View total price
- Checkout untuk create order

### 4. **Order Management**
- View semua orders (milik sendiri)
- Track order status
- View order details
- Order history

---

## Slide 12: Fitur Customer - Implementation

# 👤 Fitur Customer - Implementation Details

## Key Components

### **MenuList.jsx**
```jsx
- DataGrid dengan columns: ID, Image, Name, Description, Price, Actions
- Add to Cart functionality
- Real-time menu fetching dengan Redux
- Material UI components
```

### **Cart.jsx**
```jsx
- Material UI Table untuk cart items
- Quantity controls (increment/decrement)
- Remove item functionality
- Total price calculation
- Checkout button → Create Order
```

### **Orders.jsx**
```jsx
- DataGrid untuk order list
- Columns: Order ID, Date, Items, Total, Status, Actions
- Status chips dengan color coding
- View Details navigation
```

### **OrderDetail.jsx**
```jsx
- Detailed order information
- Order items table
- Status display
- Total price
```

---

## Slide 13: Fitur Merchant - Overview

# 🏪 Fitur Merchant

## Merchant Dashboard

### 1. **Menu Management**
- **Create** menu items
- **Read** semua menu milik merchant
- **Update** menu items
- **Delete** menu items
- Form dengan Formik + Yup validation

### 2. **Order Management**
- View **semua orders** dari semua customers
- Update order status:
  - Pending → Preparing
  - Preparing → Ready
  - Ready → Delivered
- View order details dengan customer info

### 3. **Dashboard**
- Quick access ke Menu Management
- Quick access ke Order Management
- Navigation dengan Material UI Cards

---

## Slide 14: Fitur Merchant - Implementation

# 🏪 Fitur Merchant - Implementation Details

## Key Components

### **MerchantMenu.jsx**
```jsx
- DataGrid untuk menu list
- CRUD operations dengan modal dialog
- Formik form untuk create/update
- Yup validation schema
- Image URL input
- Price validation (min 0.01)
```

### **MerchantOrders.jsx**
```jsx
- DataGrid untuk all orders
- Customer information display
- Status update buttons
- Order details dialog
- Status flow management
```

### **MerchantDashboard.jsx**
```jsx
- Material UI Grid layout
- Navigation cards
- Quick access links
- Role-based UI
```

---

## Slide 15: Form Management - Formik & Yup

# 📝 Form Management - Formik & Yup

## Why Formik & Yup?

### **Formik Benefits:**
- ✅ Simplified form state management
- ✅ Built-in error handling
- ✅ Field-level validation
- ✅ Form submission handling
- ✅ Less boilerplate code

### **Yup Benefits:**
- ✅ Schema-based validation
- ✅ Type-safe validation
- ✅ Reusable validation schemas
- ✅ Custom error messages
- ✅ Async validation support

---

## Slide 16: Formik Implementation

# 📝 Formik Implementation

## Example: Login Form

```jsx
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .trim(),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

function Login() {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        dispatch(login(values));
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field name="email">
            {({ field, meta }) => (
              <TextField
                {...field}
                error={meta.touched && !!meta.error}
                helperText={meta.touched && meta.error}
              />
            )}
          </Field>
          {/* ... */}
        </Form>
      )}
    </Formik>
  );
}
```

---

## Slide 17: Yup Validation Schema

# 📝 Yup Validation Schema

## Validation Rules Examples

### **Register Form Schema**
```javascript
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .trim(),
  
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  
  role: Yup.string()
    .oneOf(['customer', 'merchant'], 'Invalid role')
    .required('Role is required'),
});
```

### **Menu Form Schema**
```javascript
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive')
    .min(0.01, 'Price must be at least 0.01'),
  
  image: Yup.string()
    .url('Must be a valid URL'),
});
```

---

## Slide 18: Material UI Implementation

# 🎨 Material UI Implementation

## Why Material UI?

### **Benefits:**
- ✅ Comprehensive component library
- ✅ Consistent design system
- ✅ Responsive & accessible
- ✅ Customizable themes
- ✅ Production-ready components
- ✅ Active community support

### **Key Components Used:**
- **DataGrid** - Advanced tables
- **TextField** - Form inputs
- **Button** - Actions
- **Dialog** - Modals
- **Chip** - Status badges
- **AppBar** - Navigation
- **Paper** - Containers

---

## Slide 19: Material UI DataGrid

# 🎨 Material UI DataGrid

## Implementation Example

```jsx
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 200, flex: 1 },
  { 
    field: 'price', 
    headerName: 'Price', 
    width: 150,
    renderCell: (params) => formatRupiah(params.value)
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,
    renderCell: (params) => (
      <IconButton onClick={() => handleEdit(params.row)}>
        <EditIcon />
      </IconButton>
    ),
  },
];

<DataGrid
  rows={menus}
  columns={columns}
  pageSize={10}
  rowsPerPageOptions={[10, 25, 50]}
  loading={loading}
  disableSelectionOnClick
  getRowId={(row) => row.id}
/>
```

### **Features:**
- ✅ Built-in sorting
- ✅ Pagination
- ✅ Column resizing
- ✅ Custom cell rendering
- ✅ Loading states
- ✅ Row actions

---

## Slide 20: RBAC - Overview

# 🔐 Role-Based Access Control (RBAC)

## What is RBAC?

**Role-Based Access Control** adalah sistem kontrol akses yang membatasi akses pengguna berdasarkan peran (role) mereka dalam sistem.

### **Components:**
1. **Roles** - Peran pengguna (Customer, Merchant)
2. **Resources** - Objek yang dilindungi (Order, Menu, Cart)
3. **Actions** - Operasi yang bisa dilakukan (Read, Create, Update, Delete)
4. **Permissions** - Kombinasi role, resource, dan action

### **Benefits:**
- ✅ Granular access control
- ✅ Scalable permission system
- ✅ Easy to maintain
- ✅ Security best practice

---

## Slide 21: RBAC - Backend Implementation

# 🔐 RBAC - Backend Implementation

## Permission Definitions

```javascript
import AccessControl from 'accesscontrol';

const ac = new AccessControl();

// Customer permissions
ac.grant('customer')
  .readOwn('order')      // Read own orders
  .createOwn('order')    // Create own orders
  .readOwn('cart')       // Read own cart
  .createOwn('cart')     // Add to own cart
  .updateOwn('cart')    // Update own cart
  .deleteOwn('cart')    // Remove from own cart
  .readAny('menu');      // Read all menus

// Merchant permissions
ac.grant('merchant')
  .extend('customer')    // Inherit customer permissions
  .readAny('order')      // Read all orders
  .updateAny('order')   // Update any order status
  .createOwn('menu')    // Create own menu
  .readOwn('menu')      // Read own menus
  .updateOwn('menu')    // Update own menu
  .deleteOwn('menu');   // Delete own menu
```

---

## Slide 22: RBAC - Middleware

# 🔐 RBAC - Middleware Implementation

## checkPermission Middleware

```javascript
export const checkPermission = (action, resource) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const role = req.user.role;
    
    // Map action to accesscontrol format
    let permission;
    if (action === 'create') {
      permission = ac.can(role).createOwn(resource);
      if (!permission.granted) {
        permission = ac.can(role).createAny(resource);
      }
    }
    // ... similar for read, update, delete

    if (!permission.granted) {
      return res.status(403).json({ 
        message: `Access denied. You don't have permission to ${action} ${resource}.` 
      });
    }

    req.permission = permission;
    next();
  };
};
```

## Usage in Routes

```javascript
router.post('/', 
  authenticate,                    // 1. Check authentication
  checkPermission('create', 'menu'), // 2. Check permission
  validateCreateMenu,               // 3. Validate input
  async (req, res) => {            // 4. Handle request
    // Business logic
  }
);
```

---

## Slide 23: RBAC - Frontend Implementation

# 🔐 RBAC - Frontend Implementation

## Permission Configuration

```javascript
// frontend/src/utils/rbac.js
const permissions = {
  customer: {
    order: ['read', 'create'],
    cart: ['read', 'create', 'update', 'delete'],
    menu: ['read'],
  },
  merchant: {
    order: ['read', 'update'],
    menu: ['read', 'create', 'update', 'delete'],
    cart: ['read', 'create', 'update', 'delete'],
  },
};

export const hasPermission = (role, resource, action) => {
  if (!role || !permissions[role]) return false;
  const rolePermissions = permissions[role][resource];
  return rolePermissions && rolePermissions.includes(action);
};
```

## RBACRoute Component

```jsx
function RBACRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !canAccessRoute(user?.role, requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

---

## Slide 24: RBAC - Permission Matrix

# 🔐 RBAC - Permission Matrix

## Complete Permission Table

| Resource | Action | Customer | Merchant |
|----------|--------|----------|----------|
| **Order** | Read | ✅ Own only | ✅ All |
| **Order** | Create | ✅ Yes | ❌ No |
| **Order** | Update | ❌ No | ✅ Yes |
| **Menu** | Read | ✅ All | ✅ Own only |
| **Menu** | Create | ❌ No | ✅ Own |
| **Menu** | Update | ❌ No | ✅ Own |
| **Menu** | Delete | ❌ No | ✅ Own |
| **Cart** | Read | ✅ Own | ✅ Own |
| **Cart** | Create | ✅ Own | ✅ Own |
| **Cart** | Update | ✅ Own | ✅ Own |
| **Cart** | Delete | ✅ Own | ✅ Own |

### **Key Points:**
- Customer: Can only manage their own orders and cart
- Merchant: Can manage all orders (for fulfillment) but only own menus
- Merchant inherits customer permissions (can also use cart)

---

## Slide 25: Validation - Backend

# ✅ Validation - Backend

## express-validator Implementation

### **Why express-validator?**
- ✅ Middleware-based validation
- ✅ Sanitization support
- ✅ Custom validation rules
- ✅ Error message formatting
- ✅ Type conversion

### **Example: Register Validation**

```javascript
import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  
  handleValidationErrors, // Custom error handler
];
```

---

## Slide 26: Validation - Error Handling

# ✅ Validation - Error Handling

## Validation Error Handler

```javascript
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};
```

## Response Format

### **Success Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### **Error Response:**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

---

## Slide 27: State Management - Redux

# 🔄 State Management - Redux Toolkit

## Why Redux Toolkit?

- ✅ Simplified Redux API
- ✅ Less boilerplate code
- ✅ Built-in async thunks
- ✅ Immer for immutable updates
- ✅ DevTools integration

## Store Structure

```javascript
// store/store.js
export const store = configureStore({
  reducer: {
    auth: authReducer,    // Authentication state
    menu: menuReducer,    // Menu items state
    cart: cartReducer,   // Shopping cart state
    order: orderReducer,  // Orders state
  },
});
```

---

## Slide 28: Redux Slices

# 🔄 Redux Slices

## Example: authSlice

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
```

---

## Slide 29: Security Best Practices

# 🔒 Security Best Practices

## Implemented Security Measures

### **1. Authentication**
- ✅ JWT tokens dengan expiration (7 days)
- ✅ Token stored in localStorage
- ✅ Automatic token refresh
- ✅ Logout clears token

### **2. Authorization**
- ✅ RBAC middleware di setiap protected route
- ✅ Permission checks sebelum business logic
- ✅ Ownership verification
- ✅ Role-based route protection

### **3. Input Validation**
- ✅ Frontend validation (Formik + Yup)
- ✅ Backend validation (express-validator)
- ✅ Input sanitization
- ✅ Type checking

### **4. Password Security**
- ✅ bcrypt hashing (10 salt rounds)
- ✅ Password never stored in plain text
- ✅ Password strength requirements
- ✅ Pre-hook hashing di Sequelize

---

## Slide 30: Security - Layered Approach

# 🔒 Security - Layered Approach

## Defense in Depth

```
┌─────────────────────────────────────────┐
│         Layer 1: Frontend                │
│  - Formik + Yup validation              │
│  - RBACRoute protection                 │
│  - PermissionGate components            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Layer 2: Network                │
│  - HTTPS (production)                   │
│  - CORS configuration                   │
│  - Request headers validation           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Layer 3: Authentication          │
│  - JWT token verification               │
│  - Token expiration check               │
│  - User existence verification          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Layer 4: Authorization          │
│  - RBAC permission check                │
│  - Role verification                    │
│  - Resource ownership check              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Layer 5: Validation             │
│  - express-validator                    │
│  - Input sanitization                   │
│  - Type conversion                      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Layer 6: Business Logic         │
│  - Data integrity checks                │
│  - Business rule validation             │
│  - Error handling                       │
└─────────────────────────────────────────┘
```

---

## Slide 31: User Flow - Customer

# 🔄 User Flow - Customer Journey

## Complete Customer Flow

```
1. REGISTER
   └─> Fill form (Formik + Yup)
   └─> Submit → Backend validation
   └─> Create user → JWT token
   └─> Redirect to /menu

2. BROWSE MENU
   └─> Fetch menus (Redux)
   └─> Display in DataGrid
   └─> Click "Add to Cart"

3. SHOPPING CART
   └─> View cart items
   └─> Update quantities
   └─> Remove items
   └─> Click "Place Order"

4. CREATE ORDER
   └─> Validate cart (not empty)
   └─> Calculate total
   └─> Create order (API)
   └─> Clear cart
   └─> Redirect to /orders

5. VIEW ORDERS
   └─> Fetch orders (Redux)
   └─> Display in DataGrid
   └─> Click "View Details"

6. ORDER DETAILS
   └─> View order items
   └─> View status
   └─> View total
```

---

## Slide 32: User Flow - Merchant

# 🔄 User Flow - Merchant Journey

## Complete Merchant Flow

```
1. REGISTER AS MERCHANT
   └─> Fill form with role="merchant"
   └─> Submit → Backend validation
   └─> Create merchant user
   └─> Redirect to /merchant/dashboard

2. DASHBOARD
   └─> Quick access cards
   └─> Navigate to Menu or Orders

3. MANAGE MENU
   └─> View menus (DataGrid)
   └─> Click "Add Menu Item"
   └─> Fill form (Formik + Yup)
   └─> Submit → Create menu
   └─> Edit/Delete menu items

4. MANAGE ORDERS
   └─> View all orders (DataGrid)
   └─> View order details
   └─> Update status:
       Pending → Preparing
       Preparing → Ready
       Ready → Delivered
```

---

## Slide 33: API Flow - Request Lifecycle

# 🔄 API Flow - Request Lifecycle

## Complete Request Flow

```
┌─────────────────────────────────────────────────┐
│ 1. FRONTEND REQUEST                             │
│    - User action (click button)                 │
│    - Redux thunk dispatched                     │
│    - Axios request with JWT token               │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ 2. NETWORK LAYER                                │
│    - HTTP request sent                           │
│    - CORS check                                 │
│    - Request headers validated                  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ 3. AUTHENTICATION MIDDLEWARE                    │
│    - Extract JWT token from header              │
│    - Verify token signature                     │
│    - Check token expiration                     │
│    - Fetch user from database                   │
│    - Attach user to req.user                    │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ 4. RBAC MIDDLEWARE                              │
│    - Check user role                            │
│    - Check permission for action + resource    │
│    - Verify ownership (if needed)               │
│    - Grant or deny access                       │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ 5. VALIDATION MIDDLEWARE                        │
│    - Validate request body                      │
│    - Sanitize input                             │
│    - Type conversion                            │
│    - Return errors if invalid                   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ 6. ROUTE HANDLER                                │
│    - Execute business logic                     │
│    - Database operations                        │
│    - Return response                            │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ 7. FRONTEND RESPONSE                            │
│    - Receive response                           │
│    - Update Redux state                         │
│    - Update UI                                   │
└─────────────────────────────────────────────────┘
```

---

## Slide 34: Key Features Summary

# ✨ Key Features Summary

## Implemented Features

### **✅ Form Management**
- Formik untuk form state management
- Yup untuk schema validation
- Real-time error display
- Field-level validation

### **✅ UI/UX**
- Material UI component library
- DataGrid untuk data display
- Responsive design
- Consistent theme

### **✅ Security**
- JWT authentication
- RBAC authorization
- Input validation (frontend & backend)
- Password hashing

### **✅ State Management**
- Redux Toolkit
- Async thunks untuk API calls
- Centralized state
- DevTools integration

### **✅ Best Practices**
- Layered security
- Error handling
- Code organization
- Documentation

---

## Slide 35: Code Organization

# 📁 Code Organization

## Project Structure

```
react-food-app/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── rbac.js               # RBAC permissions
│   │   └── validation.js        # Input validation
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Menu.js              # Menu model
│   │   ├── Order.js              # Order model
│   │   └── OrderItem.js          # OrderItem model
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── menu.js               # Menu routes
│   │   ├── order.js              # Order routes
│   │   └── cart.js               # Cart routes
│   └── server.js                 # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Main layout
│   │   │   ├── RBACRoute.jsx     # Route protection
│   │   │   └── PermissionGate.jsx # Permission gate
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Register.jsx     # Register page
│   │   │   ├── MenuList.jsx      # Menu list
│   │   │   ├── Cart.jsx          # Shopping cart
│   │   │   ├── Orders.jsx        # Orders list
│   │   │   ├── OrderDetail.jsx   # Order details
│   │   │   ├── MerchantDashboard.jsx
│   │   │   ├── MerchantMenu.jsx
│   │   │   └── MerchantOrders.jsx
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── menuSlice.js
│   │   │   │   ├── cartSlice.js
│   │   │   │   └── orderSlice.js
│   │   │   └── store.js
│   │   ├── utils/
│   │   │   ├── axios.js          # Axios config
│   │   │   ├── rbac.js           # RBAC utils
│   │   │   └── formatCurrency.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── README.md
├── RBAC.md
└── PRESENTATION.md
```

---

## Slide 36: Testing Considerations

# 🧪 Testing Considerations

## Recommended Testing Strategy

### **1. Unit Testing**
- ✅ Component testing (React Testing Library)
- ✅ Redux slice testing
- ✅ Utility function testing
- ✅ Validation schema testing

### **2. Integration Testing**
- ✅ API endpoint testing
- ✅ Authentication flow testing
- ✅ RBAC permission testing
- ✅ Database operations testing

### **3. E2E Testing**
- ✅ User journey testing
- ✅ Customer flow testing
- ✅ Merchant flow testing
- ✅ Cross-browser testing

### **4. Security Testing**
- ✅ Authentication bypass attempts
- ✅ Authorization bypass attempts
- ✅ Input validation testing
- ✅ SQL injection prevention

---

## Slide 37: Performance Optimization

# ⚡ Performance Optimization

## Implemented Optimizations

### **Frontend:**
- ✅ React.memo untuk component memoization
- ✅ useMemo untuk expensive calculations
- ✅ Lazy loading untuk routes
- ✅ Code splitting dengan Vite
- ✅ Optimized bundle size

### **Backend:**
- ✅ Database indexing
- ✅ Query optimization
- ✅ Response caching (future)
- ✅ Connection pooling

### **Network:**
- ✅ Request batching
- ✅ Debouncing untuk search
- ✅ Optimistic updates
- ✅ Error retry logic

---

## Slide 38: Future Enhancements

# 🚀 Future Enhancements

## Potential Improvements

### **Features:**
- 📧 Email notifications
- 💳 Payment integration
- 📱 Mobile app (React Native)
- 🔔 Real-time notifications (WebSocket)
- ⭐ Rating & reviews
- 📊 Analytics dashboard
- 🔍 Advanced search & filters
- 🖼️ Image upload (not just URL)

### **Technical:**
- 🧪 Comprehensive testing suite
- 📝 API documentation (Swagger)
- 🐳 Docker containerization
- ☁️ Cloud deployment (AWS/Azure)
- 📈 Monitoring & logging
- 🔄 CI/CD pipeline

---

## Slide 39: Lessons Learned

# 💡 Lessons Learned

## Key Takeaways

### **1. Form Management**
- Formik + Yup provides excellent developer experience
- Schema-based validation is maintainable
- Real-time validation improves UX

### **2. UI Libraries**
- Material UI accelerates development
- DataGrid is powerful for data display
- Consistent design system is important

### **3. Security**
- RBAC provides granular access control
- Layered security is essential
- Never trust frontend validation alone

### **4. State Management**
- Redux Toolkit simplifies Redux
- Async thunks handle API calls well
- Centralized state improves maintainability

### **5. Best Practices**
- Code organization matters
- Documentation is crucial
- Error handling is important
- Validation on both sides

---

## Slide 40: Conclusion

# 🎯 Conclusion

## Summary

### **What We Built:**
✅ Fullstack food ordering application
✅ Role-based access control (RBAC)
✅ Form management dengan Formik & Yup
✅ Material UI dengan DataGrid
✅ Comprehensive validation (frontend & backend)
✅ Secure authentication & authorization
✅ State management dengan Redux Toolkit

### **Key Achievements:**
- 🎨 Modern, responsive UI
- 🔒 Secure & scalable architecture
- 📝 Clean, maintainable code
- ✅ Best practices implementation
- 📚 Comprehensive documentation

### **Technologies Mastered:**
- React 18, Redux Toolkit, Material UI
- Node.js, Express, Sequelize
- JWT, RBAC, Formik, Yup
- Best practices & security

---

## Slide 41: Q&A

# ❓ Questions & Answers

## Thank You!

**Questions?**

---

## Slide 42: Resources

# 📚 Resources

## Documentation & Links

### **Official Documentation:**
- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Material UI](https://mui.com)
- [Formik](https://formik.org)
- [Yup](https://github.com/jquense/yup)
- [Express.js](https://expressjs.com)
- [Sequelize](https://sequelize.org)
- [AccessControl](https://github.com/onury/accesscontrol)

### **Project Files:**
- `README.md` - Project overview
- `RBAC.md` - RBAC documentation
- `PRESENTATION.md` - This presentation
- `SETUP.md` - Setup instructions

### **Code Repository:**
- Check repository for complete source code
- All implementations are documented
- Follow best practices shown

---

## Slide 43: Contact & Support

# 📧 Contact & Support

## Get in Touch

**For questions or clarifications:**
- Review documentation files
- Check code comments
- Review RBAC.md for security details
- Review README.md for setup

**Repository Structure:**
- All code is well-organized
- Comments explain complex logic
- Documentation is comprehensive

**Happy Coding! 🚀**

---

## End of Presentation

**Thank you for your attention!**

