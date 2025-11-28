# RBAC Database-Driven Implementation
## (Spatie Laravel Style)

Implementasi RBAC yang fleksibel dengan database-driven permissions, mirip dengan Spatie Laravel Permission package.

---

## 📋 Overview

Sistem RBAC ini menggunakan database untuk menyimpan roles dan permissions, memungkinkan:
- ✅ Dynamic role dan permission management
- ✅ Assign permission langsung ke user atau melalui role
- ✅ Multiple roles per user
- ✅ Granular permission control
- ✅ No code changes needed untuk menambah permission baru

---

## 🗄️ Database Schema

### Tables

1. **roles** - Menyimpan roles
2. **permissions** - Menyimpan permissions
3. **role_has_permissions** - Pivot table untuk role-permission relationship
4. **model_has_roles** - Pivot table untuk user-role relationship
5. **model_has_permissions** - Pivot table untuk user-permission relationship (direct)

### ERD

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│    Users    │         │  model_has_roles  │         │    Roles    │
├─────────────┤         ├──────────────────┤         ├─────────────┤
│ id (PK)     │◄──┐     │ role_id (FK)      │     ┌───┤ id (PK)     │
│ name        │   │     │ model_id (FK)     │     │   │ name (UK)   │
│ email       │   │     │ model_type        │     │   │ guard_name  │
│ password    │   │     └──────────────────┘     │   └─────────────┘
└─────────────┘   │                               │
                  │                               │
┌─────────────┐   │         ┌──────────────────┐  │
│ Permissions │   │         │model_has_perms   │  │
├─────────────┤   │         ├──────────────────┤  │
│ id (PK)     │   │     ┌───┤ permission_id(FK)│  │
│ name (UK)   │   │     │   │ model_id (FK)    │  │
│ guard_name  │   │     │   │ model_type       │  │
└─────────────┘   │     │   └──────────────────┘  │
                  │     │                        │
                  │     │   ┌──────────────────┐ │
                  │     │   │role_has_perms    │ │
                  │     └───┤ permission_id(FK)│─┘
                  │         │ role_id (FK)     │
                  └─────────┤                  │
                            └──────────────────┘
```

---

## 📁 File Structure

```
backend/
├── models/
│   ├── User.js                    # Updated dengan RBAC methods
│   ├── Role.js                    # Role model dengan helper methods
│   ├── Permission.js              # Permission model
│   ├── ModelHasRole.js            # Pivot table model
│   ├── ModelHasPermission.js      # Pivot table model
│   ├── RoleHasPermission.js       # Pivot table model
│   └── index.js                   # Setup relationships
├── middleware/
│   └── rbac.js                    # Updated middleware
├── routes/
│   └── rbac.js                    # RBAC management routes
└── seeders/
    └── rbacSeeder.js              # Initial data seeder
```

---

## 🔧 Model Definitions

### Role Model

```javascript
// backend/models/Role.js
const Role = sequelize.define('Role', {
  id: DataTypes.INTEGER,
  name: DataTypes.STRING (unique),
  guard_name: DataTypes.STRING (default: 'api')
});

// Helper Methods:
Role.prototype.hasPermission(permissionName)
Role.prototype.givePermission(permission)
Role.prototype.revokePermission(permission)
Role.prototype.syncPermissions(permissionNames)
```

### Permission Model

```javascript
// backend/models/Permission.js
const Permission = sequelize.define('Permission', {
  id: DataTypes.INTEGER,
  name: DataTypes.STRING (unique),
  guard_name: DataTypes.STRING (default: 'api')
});
```

### User Model - Helper Methods

```javascript
// Role Methods
User.prototype.hasRole(roleName)
User.prototype.hasAnyRole(roleNames)
User.prototype.hasAllRoles(roleNames)
User.prototype.assignRole(role)
User.prototype.removeRole(role)
User.prototype.syncRoles(roleNames)

// Permission Methods
User.prototype.hasPermission(permissionName)
User.prototype.hasAnyPermission(permissionNames)
User.prototype.hasAllPermissions(permissionNames)
User.prototype.givePermission(permission)
User.prototype.revokePermission(permission)
```

---

## 🛡️ Middleware

### hasPermission(permissionName)

Check jika user memiliki permission tertentu.

```javascript
router.post('/menu',
  authenticate,
  hasPermission('menu.create'),
  async (req, res) => {
    // Handler
  }
);
```

### hasAnyPermission(permissionNames)

Check jika user memiliki salah satu dari permissions.

```javascript
router.get('/admin/stats',
  authenticate,
  hasAnyPermission(['menu.view.all', 'admin.access']),
  async (req, res) => {
    // Handler
  }
);
```

### hasAllPermissions(permissionNames)

Check jika user memiliki semua permissions.

```javascript
router.delete('/menu/:id',
  authenticate,
  hasAllPermissions(['menu.delete', 'menu.force.delete']),
  async (req, res) => {
    // Handler
  }
);
```

### hasRole(roleName)

Check jika user memiliki role tertentu.

```javascript
router.get('/admin',
  authenticate,
  hasRole('admin'),
  async (req, res) => {
    // Handler
  }
);
```

### hasAnyRole(roleNames)

Check jika user memiliki salah satu dari roles.

```javascript
router.get('/dashboard',
  authenticate,
  hasAnyRole(['merchant', 'admin']),
  async (req, res) => {
    // Handler
  }
);
```

---

## 📝 Permission Naming Convention

### Format: `resource.action` atau `resource.action.scope`

Examples:
- `menu.view` - View menus
- `menu.create` - Create menu
- `menu.update` - Update menu
- `menu.delete` - Delete menu
- `menu.view.all` - View all menus (admin)
- `order.view` - View own orders
- `order.view.all` - View all orders
- `order.update.status` - Update order status
- `cart.view` - View cart
- `cart.add` - Add to cart
- `cart.update` - Update cart
- `cart.delete` - Delete from cart

---

## 🚀 Usage Examples

### Backend - Route Protection

```javascript
// Single permission
router.post('/menu',
  authenticate,
  hasPermission('menu.create'),
  async (req, res) => { ... }
);

// Multiple permissions (any)
router.get('/admin',
  authenticate,
  hasAnyPermission(['admin.access', 'super.admin']),
  async (req, res) => { ... }
);

// Multiple permissions (all)
router.delete('/menu/:id',
  authenticate,
  hasAllPermissions(['menu.delete', 'menu.force.delete']),
  async (req, res) => { ... }
);

// Role check
router.get('/merchant/dashboard',
  authenticate,
  hasRole('merchant'),
  async (req, res) => { ... }
);
```

### Backend - Programmatic Checks

```javascript
// In route handler
const user = await User.findByPk(req.user.id, {
  include: [
    { model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] },
    { model: Permission, as: 'permissions' }
  ]
});

// Check permission
if (await user.hasPermission('menu.create')) {
  // Allow create
}

// Check role
if (await user.hasRole('merchant')) {
  // Merchant logic
}

// Assign role
await user.assignRole('merchant');

// Give permission directly
await user.givePermission('menu.view.all');
```

### Frontend - Permission Checks

```javascript
// In component
import { useSelector } from 'react-redux';
import { hasPermission, hasRole } from '../utils/rbac';

function MenuList() {
  const { user } = useSelector((state) => state.auth);
  
  const canCreate = hasPermission(user, 'menu.create');
  const isMerchant = hasRole(user, 'merchant');
  
  return (
    <div>
      {canCreate && <Button>Add Menu</Button>}
    </div>
  );
}
```

### Frontend - PermissionGate Component

```jsx
import PermissionGate from '../components/PermissionGate';

// Single permission
<PermissionGate permission="menu.create">
  <Button>Add Menu</Button>
</PermissionGate>

// Any permission
<PermissionGate anyPermission={['menu.create', 'menu.update']}>
  <Button>Edit Menu</Button>
</PermissionGate>

// Role check
<PermissionGate role="merchant">
  <MerchantDashboard />
</PermissionGate>
```

---

## 🔄 Migration dari Old System

### Step 1: Database Migration

Tables akan dibuat otomatis saat `sequelize.sync()` dijalankan.

### Step 2: Seed Initial Data

Seeder akan dijalankan otomatis saat server start:

```javascript
// backend/seeders/rbacSeeder.js
await seedRBAC();
```

Seeder akan:
1. Create permissions
2. Create roles (customer, merchant, admin)
3. Assign permissions to roles
4. Migrate existing users ke new system

### Step 3: Update Routes

Ganti `checkPermission` dengan `hasPermission`:

```javascript
// Old
router.post('/', authenticate, checkPermission('create', 'menu'), ...)

// New
router.post('/', authenticate, hasPermission('menu.create'), ...)
```

### Step 4: Update Frontend

Frontend sudah di-update untuk support dynamic permissions dari API.

---

## 📊 Permission Matrix

| Permission | Customer | Merchant | Admin |
|------------|----------|----------|-------|
| menu.view | ✅ | ✅ | ✅ |
| menu.create | ❌ | ✅ | ✅ |
| menu.update | ❌ | ✅ | ✅ |
| menu.delete | ❌ | ✅ | ✅ |
| menu.view.all | ❌ | ❌ | ✅ |
| order.view | ✅ | ✅ | ✅ |
| order.create | ✅ | ❌ | ✅ |
| order.view.all | ❌ | ✅ | ✅ |
| order.update.status | ❌ | ✅ | ✅ |
| cart.view | ✅ | ✅ | ✅ |
| cart.add | ✅ | ✅ | ✅ |
| cart.update | ✅ | ✅ | ✅ |
| cart.delete | ✅ | ✅ | ✅ |

---

## 🎯 API Endpoints

### RBAC Management

```
GET    /api/rbac/roles              # Get all roles
GET    /api/rbac/roles/:id          # Get role by ID
GET    /api/rbac/permissions        # Get all permissions
GET    /api/rbac/user/me            # Get current user roles & permissions
POST   /api/rbac/users/:id/roles    # Assign role to user
DELETE /api/rbac/users/:id/roles/:roleName  # Remove role from user
POST   /api/rbac/users/:id/permissions      # Give permission to user
DELETE /api/rbac/users/:id/permissions/:permissionName  # Revoke permission
POST   /api/rbac/roles/:id/permissions      # Assign permissions to role
```

---

## 💡 Best Practices

### 1. Permission Naming

- Gunakan format: `resource.action` atau `resource.action.scope`
- Consistent naming convention
- Use lowercase dengan dots sebagai separator

### 2. Role vs Permission

- **Role**: Group of permissions (customer, merchant, admin)
- **Permission**: Specific action (menu.create, order.view.all)
- Assign permissions to roles, not individual users (kecuali special cases)

### 3. Direct Permissions

- Gunakan direct permissions hanya untuk special cases
- Contoh: User tertentu perlu akses khusus tanpa role baru

### 4. Performance

- Cache permissions di frontend (Redux)
- Reload permissions setelah assign/revoke
- Use indexes di database untuk performance

### 5. Security

- Always check permissions di backend
- Frontend checks hanya untuk UX
- Never trust frontend permission checks

---

## 🔍 Troubleshooting

### Issue: Permission tidak terdeteksi

**Solution:**
1. Check apakah user sudah di-assign role
2. Check apakah role memiliki permission tersebut
3. Reload user dengan relationships:
   ```javascript
   const user = await User.findByPk(userId, {
     include: [
       { model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] },
       { model: Permission, as: 'permissions' }
     ]
   });
   ```

### Issue: Seeder tidak jalan

**Solution:**
1. Check apakah models sudah di-import di server.js
2. Check console untuk error messages
3. Run seeder manually:
   ```javascript
   import { seedRBAC } from './seeders/rbacSeeder.js';
   await seedRBAC();
   ```

### Issue: Relationships tidak bekerja

**Solution:**
1. Pastikan `models/index.js` sudah di-import di server.js
2. Check apakah relationships sudah di-setup dengan benar
3. Verify table names match dengan model definitions

---

## 📚 Advanced Usage

### Custom Permission Logic

```javascript
// Check permission dengan custom logic
router.put('/menu/:id',
  authenticate,
  async (req, res, next) => {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] },
        { model: Permission, as: 'permissions' }
      ]
    });

    const menu = await Menu.findByPk(req.params.id);
    
    // Custom logic: can update if has permission OR owns the menu
    const canUpdate = await user.hasPermission('menu.update') || 
                     (await user.hasPermission('menu.update.own') && menu.merchantId === user.id);

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.user = user;
    next();
  },
  async (req, res) => {
    // Handler
  }
);
```

### Permission Inheritance

Permissions dari roles otomatis di-inherit oleh user. Direct permissions juga di-merge dengan role permissions.

### Multiple Roles

User bisa memiliki multiple roles, dan semua permissions dari semua roles akan di-merge.

---

## 🎉 Benefits

1. ✅ **Fleksibel** - Bisa assign permission langsung atau melalui role
2. ✅ **Dynamic** - Tidak perlu code change untuk permission baru
3. ✅ **Scalable** - Mudah menambah role/permission baru
4. ✅ **Granular** - Fine-grained permission control
5. ✅ **Laravel Compatible** - Struktur sama dengan Spatie Laravel

---

## 📖 Next Steps

1. Test semua endpoints
2. Create admin panel untuk manage roles & permissions
3. Add permission caching untuk performance
4. Add audit log untuk permission changes
5. Add permission groups untuk better organization

---

**Happy Coding! 🚀**

