# RBAC Quick Reference Guide

Quick reference untuk menggunakan RBAC database-driven system.

---

## 🔑 Permission Names

### Menu
- `menu.view` - View menus
- `menu.create` - Create menu
- `menu.update` - Update menu
- `menu.delete` - Delete menu
- `menu.view.all` - View all menus

### Order
- `order.view` - View own orders
- `order.create` - Create order
- `order.update` - Update order
- `order.view.all` - View all orders
- `order.update.status` - Update order status

### Cart
- `cart.view` - View cart
- `cart.add` - Add to cart
- `cart.update` - Update cart
- `cart.delete` - Delete from cart

---

## 🛡️ Backend Middleware

### Single Permission
```javascript
router.post('/menu',
  authenticate,
  hasPermission('menu.create'),
  async (req, res) => { ... }
);
```

### Any Permission
```javascript
router.get('/admin',
  authenticate,
  hasAnyPermission(['admin.access', 'super.admin']),
  async (req, res) => { ... }
);
```

### All Permissions
```javascript
router.delete('/menu/:id',
  authenticate,
  hasAllPermissions(['menu.delete', 'menu.force.delete']),
  async (req, res) => { ... }
);
```

### Role Check
```javascript
router.get('/merchant/dashboard',
  authenticate,
  hasRole('merchant'),
  async (req, res) => { ... }
);
```

### Any Role
```javascript
router.get('/dashboard',
  authenticate,
  hasAnyRole(['merchant', 'admin']),
  async (req, res) => { ... }
);
```

---

## 🎨 Frontend Usage

### Permission Check
```jsx
import { useSelector } from 'react-redux';
import { hasPermission } from '../utils/rbac';

function Component() {
  const { user } = useSelector(state => state.auth);
  
  if (hasPermission(user, 'menu.create')) {
    return <Button>Add Menu</Button>;
  }
  return null;
}
```

### PermissionGate Component
```jsx
import PermissionGate from '../components/PermissionGate';

<PermissionGate permission="menu.create">
  <Button>Add Menu</Button>
</PermissionGate>

<PermissionGate anyPermission={['menu.create', 'menu.update']}>
  <Button>Edit Menu</Button>
</PermissionGate>

<PermissionGate role="merchant">
  <MerchantDashboard />
</PermissionGate>
```

### RBACRoute Component
```jsx
<Route
  path="/merchant/menu"
  element={
    <RBACRoute requiredRole="merchant">
      <MerchantMenu />
    </RBACRoute>
  }
/>

<Route
  path="/admin"
  element={
    <RBACRoute requiredPermission="admin.access">
      <AdminPanel />
    </RBACRoute>
  }
/>
```

---

## 🔧 Programmatic Usage

### Backend - Check Permission
```javascript
const user = await User.findByPk(userId, {
  include: [
    { model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] },
    { model: Permission, as: 'permissions' }
  ]
});

if (await user.hasPermission('menu.create')) {
  // Allow
}
```

### Backend - Assign Role
```javascript
await user.assignRole('merchant');
```

### Backend - Give Permission
```javascript
await user.givePermission('menu.view.all');
```

### Backend - Role Methods
```javascript
await role.givePermission('menu.create');
await role.revokePermission('menu.create');
await role.syncPermissions(['menu.create', 'menu.update']);
```

---

## 📡 API Endpoints

### Get Current User Permissions
```bash
GET /api/rbac/user/me
Authorization: Bearer TOKEN

Response:
{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "roles": ["customer"],
  "permissions": ["menu.view", "order.view", ...]
}
```

### Assign Role to User
```bash
POST /api/rbac/users/:userId/roles
Authorization: Bearer TOKEN
Body: { "roleName": "merchant" }
```

### Give Permission to User
```bash
POST /api/rbac/users/:userId/permissions
Authorization: Bearer TOKEN
Body: { "permissionName": "menu.view.all" }
```

### Get All Roles
```bash
GET /api/rbac/roles
Authorization: Bearer TOKEN (requires role.view)
```

### Get All Permissions
```bash
GET /api/rbac/permissions
Authorization: Bearer TOKEN (requires permission.view)
```

---

## 🎯 Common Patterns

### Pattern 1: Own Resource Check
```javascript
router.put('/menu/:id',
  authenticate,
  hasPermission('menu.update'),
  async (req, res) => {
    const menu = await Menu.findByPk(req.params.id);
    const canViewAll = await req.user.hasPermission('menu.view.all');
    
    if (!canViewAll && menu.merchantId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // ...
  }
);
```

### Pattern 2: Conditional Permission
```javascript
router.get('/orders',
  authenticate,
  async (req, res) => {
    const canViewAll = await req.user.hasPermission('order.view.all');
    
    const orders = canViewAll
      ? await Order.findAll()
      : await Order.findAll({ where: { customerId: req.user.id } });
    
    res.json(orders);
  }
);
```

### Pattern 3: Multiple Checks
```javascript
router.delete('/menu/:id',
  authenticate,
  hasPermission('menu.delete'),
  async (req, res) => {
    const menu = await Menu.findByPk(req.params.id);
    const canViewAll = await req.user.hasPermission('menu.view.all');
    
    if (!canViewAll && menu.merchantId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Additional check
    if (menu.status === 'published' && !await req.user.hasPermission('menu.force.delete')) {
      return res.status(403).json({ message: 'Cannot delete published menu' });
    }
    
    await menu.destroy();
    res.json({ message: 'Deleted' });
  }
);
```

---

## ⚡ Performance Tips

1. **Cache Permissions** - Store di Redux setelah login
2. **Eager Load** - Load relationships sekali di auth middleware
3. **Index Database** - Add indexes untuk foreign keys
4. **Batch Checks** - Use `hasAnyPermission` instead of multiple `hasPermission`

---

## 🐛 Common Issues

### Issue: Permission always false
**Fix:** Reload user dengan relationships
```javascript
const user = await User.findByPk(userId, {
  include: [
    { model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] },
    { model: Permission, as: 'permissions' }
  ]
});
```

### Issue: Role tidak ter-assign
**Fix:** Check apakah role sudah ada di database
```javascript
const role = await Role.findOne({ where: { name: 'merchant' } });
if (!role) {
  // Role belum dibuat, run seeder
}
```

---

**Quick Reference Complete! 🚀**

