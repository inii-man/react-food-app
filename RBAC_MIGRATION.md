# RBAC Database Migration Guide

Panduan lengkap untuk migrate dari static RBAC ke database-driven RBAC.

---

## 📋 Pre-Migration Checklist

- [ ] Backup database
- [ ] Review current permissions yang digunakan
- [ ] Plan permission naming convention
- [ ] Test di development environment dulu

---

## 🔄 Migration Steps

### Step 1: Install Dependencies

Dependencies sudah terinstall:
- ✅ `accesscontrol` (masih bisa digunakan untuk fallback)
- ✅ `sequelize` (sudah ada)

### Step 2: Database Tables

Tables akan dibuat otomatis saat `sequelize.sync()` dijalankan. Pastikan:

1. Models sudah di-import di `server.js`:
   ```javascript
   import './models/index.js'; // Setup relationships
   ```

2. Server start akan:
   - Create tables jika belum ada
   - Run seeder untuk initial data
   - Migrate existing users

### Step 3: Update Code

#### Backend Routes

**Before:**
```javascript
router.post('/',
  authenticate,
  checkPermission('create', 'menu'),
  async (req, res) => { ... }
);
```

**After:**
```javascript
router.post('/',
  authenticate,
  hasPermission('menu.create'),
  async (req, res) => { ... }
);
```

#### Permission Mapping

| Old Format | New Format |
|------------|------------|
| `checkPermission('create', 'menu')` | `hasPermission('menu.create')` |
| `checkPermission('read', 'order')` | `hasPermission('order.view')` |
| `checkPermission('update', 'order')` | `hasPermission('order.update.status')` |
| `checkPermission('delete', 'menu')` | `hasPermission('menu.delete')` |

### Step 4: Test

1. Start server - check apakah seeder berjalan
2. Login sebagai user - check apakah roles & permissions ter-load
3. Test setiap endpoint - verify permissions bekerja
4. Test assign/revoke permissions via API

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] User bisa login dan dapat roles/permissions
- [ ] Customer hanya bisa akses customer routes
- [ ] Merchant bisa akses merchant routes
- [ ] Permission checks bekerja dengan benar
- [ ] Direct permissions bekerja
- [ ] Role-based permissions bekerja

### Frontend Tests

- [ ] User data ter-load dengan roles & permissions
- [ ] RBACRoute bekerja dengan roles
- [ ] PermissionGate bekerja dengan permissions
- [ ] UI elements hide/show berdasarkan permissions

### API Tests

- [ ] GET /api/rbac/user/me - return roles & permissions
- [ ] POST /api/rbac/users/:id/roles - assign role
- [ ] DELETE /api/rbac/users/:id/roles/:roleName - remove role
- [ ] POST /api/rbac/users/:id/permissions - give permission
- [ ] DELETE /api/rbac/users/:id/permissions/:permissionName - revoke permission

---

## 🔧 Troubleshooting

### Issue: Tables tidak terbuat

**Solution:**
```javascript
// Force sync (HATI-HATI: akan drop existing tables!)
await sequelize.sync({ force: true });

// Atau manual create:
await sequelize.query(`
  CREATE TABLE IF NOT EXISTS roles (...);
  CREATE TABLE IF NOT EXISTS permissions (...);
  ...
`);
```

### Issue: Seeder error

**Solution:**
1. Check console untuk error messages
2. Pastikan models sudah di-import
3. Run seeder manual:
   ```javascript
   import { seedRBAC } from './seeders/rbacSeeder.js';
   await seedRBAC();
   ```

### Issue: User tidak punya roles setelah migration

**Solution:**
```javascript
// Manual assign role
const user = await User.findByPk(userId);
await user.assignRole('customer'); // or 'merchant'
```

### Issue: Permission check selalu false

**Solution:**
1. Check apakah user sudah di-assign role
2. Check apakah role memiliki permission
3. Reload user dengan relationships:
   ```javascript
   const user = await User.findByPk(userId, {
     include: [
       { model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] },
       { model: Permission, as: 'permissions' }
     ]
   });
   ```

---

## 📊 Permission Mapping Reference

### Menu Permissions

- `menu.view` - View menus (public)
- `menu.create` - Create menu
- `menu.update` - Update menu
- `menu.delete` - Delete menu
- `menu.view.all` - View all menus (admin)

### Order Permissions

- `order.view` - View own orders
- `order.create` - Create order
- `order.update` - Update order
- `order.view.all` - View all orders
- `order.update.status` - Update order status

### Cart Permissions

- `cart.view` - View cart
- `cart.add` - Add to cart
- `cart.update` - Update cart
- `cart.delete` - Delete from cart

### User Management

- `user.view` - View users
- `user.create` - Create user
- `user.update` - Update user
- `user.delete` - Delete user

### RBAC Management

- `role.view` - View roles
- `role.create` - Create role
- `role.update` - Update role
- `role.delete` - Delete role
- `permission.view` - View permissions
- `permission.assign` - Assign permissions

---

## 🎯 Rollback Plan

Jika perlu rollback:

1. **Keep old middleware** - Jangan hapus `checkPermission` dulu
2. **Gradual migration** - Migrate route per route
3. **Feature flag** - Gunakan env variable untuk switch

```javascript
// Use new system if enabled
if (process.env.USE_DB_RBAC === 'true') {
  router.post('/', authenticate, hasPermission('menu.create'), ...);
} else {
  router.post('/', authenticate, checkPermission('create', 'menu'), ...);
}
```

---

## ✅ Post-Migration

Setelah migration selesai:

1. ✅ Remove old `checkPermission` middleware (optional)
2. ✅ Remove `accesscontrol` dependency (optional)
3. ✅ Update documentation
4. ✅ Create admin panel untuk manage RBAC
5. ✅ Add permission caching untuk performance

---

**Migration Complete! 🎉**

