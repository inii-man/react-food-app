# Role-Based Access Control (RBAC) Documentation

## Overview

Sistem RBAC (Role-Based Access Control) telah diimplementasikan di aplikasi Food App untuk mengatur akses pengguna berdasarkan peran mereka. Sistem ini menggunakan library `accesscontrol` di backend dan implementasi custom di frontend untuk memastikan keamanan dan kontrol akses yang konsisten.

## Arsitektur RBAC

### Backend Implementation

#### 1. Middleware RBAC (`backend/middleware/rbac.js`)

Sistem RBAC backend menggunakan library `accesscontrol` untuk mendefinisikan dan memeriksa izin.

**Definisi Roles dan Permissions:**

```javascript
// Customer permissions
ac.grant('customer')
  .readOwn('order')
  .createOwn('order')
  .readOwn('cart')
  .createOwn('cart')
  .updateOwn('cart')
  .deleteOwn('cart')
  .readAny('menu');

// Merchant permissions
ac.grant('merchant')
  .extend('customer') // Merchant inherits customer permissions
  .readAny('order')
  .updateAny('order')
  .createOwn('menu')
  .readOwn('menu')
  .updateOwn('menu')
  .deleteOwn('menu');
```

**Penjelasan:**
- **Customer** dapat:
  - Membaca dan membuat order miliknya sendiri
  - Mengelola cart miliknya sendiri (read, create, update, delete)
  - Membaca semua menu (readAny)
  
- **Merchant** dapat:
  - Semua yang bisa dilakukan customer (inherit)
  - Membaca semua order (readAny)
  - Mengupdate status order apapun (updateAny)
  - Mengelola menu miliknya sendiri (create, read, update, delete)

#### 2. Middleware Functions

**`checkPermission(action, resource)`**
- Middleware untuk memeriksa apakah user memiliki permission untuk melakukan action tertentu pada resource
- Digunakan di route handlers untuk proteksi endpoint
- Contoh: `checkPermission('create', 'menu')` untuk memastikan hanya user dengan permission create menu yang bisa mengakses endpoint

**`checkOwnership(resource, resourceUserId)`**
- Helper function untuk memeriksa ownership resource
- Digunakan untuk memastikan user hanya bisa mengakses resource miliknya sendiri
- Merchant memiliki exception untuk order (bisa akses semua order untuk management)

#### 3. Penggunaan di Routes

Contoh implementasi di route:

```javascript
router.post('/', 
  authenticate,                    // Pastikan user sudah login
  checkPermission('create', 'menu'), // Cek permission
  validateCreateMenu,               // Validasi input
  async (req, res) => {
    // Handler logic
  }
);
```

### Frontend Implementation

#### 1. RBAC Configuration (`frontend/src/utils/rbac.js`)

File ini mendefinisikan permissions untuk setiap role di frontend:

```javascript
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
```

**Functions:**
- `hasPermission(role, resource, action)`: Mengecek apakah role memiliki permission untuk action pada resource
- `canAccessRoute(userRole, requiredRole)`: Mengecek apakah user bisa mengakses route tertentu
- `getRolePermissions(role)`: Mendapatkan semua permissions untuk role tertentu

#### 2. RBAC Components

**`RBACRoute` Component (`frontend/src/components/RBACRoute.jsx`)**
- Component untuk proteksi route berdasarkan role
- Menggantikan `PrivateRoute` yang sebelumnya digunakan
- Redirect ke login jika belum authenticated
- Redirect ke dashboard sesuai role jika tidak memiliki akses

**Penggunaan:**
```jsx
<Route
  path="/merchant/menu"
  element={
    <RBACRoute requiredRole="merchant">
      <MerchantMenu />
    </RBACRoute>
  }
/>
```

**`PermissionGate` Component (`frontend/src/components/PermissionGate.jsx`)**
- Component untuk conditionally render content berdasarkan permission
- Berguna untuk menyembunyikan/menampilkan UI elements berdasarkan permission user

**Penggunaan:**
```jsx
<PermissionGate resource="menu" action="create">
  <Button>Add Menu</Button>
</PermissionGate>
```

## Flow Authentication & Authorization

### 1. User Login Flow

```
1. User submit login form (Formik + Yup validation)
2. Frontend mengirim request ke /api/auth/login
3. Backend memvalidasi input (express-validator)
4. Backend memverifikasi credentials
5. Backend generate JWT token dengan payload { userId, role }
6. Frontend menyimpan token dan user info di Redux store
7. User di-redirect sesuai role:
   - Customer → /menu
   - Merchant → /merchant/dashboard
```

### 2. Protected Route Access Flow

```
1. User mencoba akses protected route
2. RBACRoute component check:
   - Apakah user authenticated? → Redirect ke /login jika tidak
   - Apakah user memiliki required role? → Redirect sesuai role jika tidak
3. Jika authorized, render component
```

### 3. API Request Flow

```
1. Frontend membuat API request dengan JWT token di header
2. Backend authenticate middleware:
   - Verify JWT token
   - Extract user info dari token
   - Attach user object ke req.user
3. RBAC middleware (checkPermission):
   - Cek role user dari req.user
   - Cek permission untuk action dan resource
   - Jika tidak granted → Return 403 Forbidden
4. Validation middleware:
   - Validasi input dengan express-validator
   - Return 400 Bad Request jika invalid
5. Route handler:
   - Eksekusi business logic
   - Return response
```

## Permission Matrix

| Resource | Action | Customer | Merchant |
|----------|--------|----------|----------|
| Order    | Read   | Own only | All      |
| Order    | Create | Yes      | No       |
| Order    | Update | No       | Yes      |
| Menu     | Read   | All      | Own only |
| Menu     | Create | No       | Own      |
| Menu     | Update | No       | Own      |
| Menu     | Delete | No       | Own      |
| Cart     | Read   | Own      | Own      |
| Cart     | Create | Own      | Own      |
| Cart     | Update | Own      | Own      |
| Cart     | Delete | Own      | Own      |

## Best Practices yang Diterapkan

### Backend

1. **Layered Security:**
   - Authentication (JWT verification)
   - Authorization (RBAC permission check)
   - Validation (Input validation)
   - Business Logic (Ownership check)

2. **Consistent Error Messages:**
   - 401 Unauthorized: User tidak authenticated
   - 403 Forbidden: User tidak memiliki permission
   - 400 Bad Request: Input validation failed
   - 404 Not Found: Resource tidak ditemukan

3. **Ownership Verification:**
   - Selalu verify ownership untuk "Own" resources
   - Merchant exception untuk order management

### Frontend

1. **Route Protection:**
   - Semua protected routes menggunakan RBACRoute
   - Redirect otomatis jika tidak authorized

2. **UI Conditional Rendering:**
   - Gunakan PermissionGate untuk hide/show UI elements
   - Prevent user dari melihat actions yang tidak bisa mereka lakukan

3. **Consistent Permission Checking:**
   - Gunakan utility functions dari rbac.js
   - Jangan hardcode permission checks

## Testing RBAC

### Test Cases yang Perlu Diuji

1. **Customer Access:**
   - ✅ Customer bisa akses /cart, /orders
   - ✅ Customer tidak bisa akses /merchant/*
   - ✅ Customer hanya bisa lihat order miliknya sendiri
   - ✅ Customer bisa create order

2. **Merchant Access:**
   - ✅ Merchant bisa akses /merchant/*
   - ✅ Merchant tidak bisa akses /cart, /orders (sebagai customer)
   - ✅ Merchant bisa lihat semua order
   - ✅ Merchant bisa update status order
   - ✅ Merchant hanya bisa manage menu miliknya sendiri

3. **Unauthenticated Access:**
   - ✅ Redirect ke /login untuk semua protected routes
   - ✅ Bisa akses /menu (public)

## Extending RBAC

### Menambah Role Baru

1. **Backend (`backend/middleware/rbac.js`):**
```javascript
ac.grant('admin')
  .extend('merchant')
  .readAny('menu')
  .updateAny('menu')
  .deleteAny('menu');
```

2. **Frontend (`frontend/src/utils/rbac.js`):**
```javascript
const permissions = {
  // ... existing roles
  admin: {
    order: ['read', 'update', 'delete'],
    menu: ['read', 'create', 'update', 'delete'],
    user: ['read', 'create', 'update', 'delete'],
  },
};
```

3. **Update User Model:**
```javascript
role: {
  type: DataTypes.ENUM('customer', 'merchant', 'admin'),
  // ...
}
```

### Menambah Permission Baru

1. Update `backend/middleware/rbac.js` dengan permission baru
2. Update `frontend/src/utils/rbac.js` dengan permission mapping
3. Update routes yang memerlukan permission baru
4. Update UI components jika diperlukan

## Security Considerations

1. **JWT Token:**
   - Token disimpan di memory (Redux store)
   - Token expire setelah 7 hari
   - Secret key harus kuat dan disimpan di environment variable

2. **API Security:**
   - Semua protected endpoints memerlukan authentication
   - Permission check dilakukan di middleware level
   - Ownership verification untuk "Own" resources

3. **Frontend Security:**
   - Frontend permission check hanya untuk UX
   - Backend validation adalah source of truth
   - Jangan mengandalkan frontend checks untuk security

## Troubleshooting

### Issue: User tidak bisa akses route meskipun sudah login

**Solution:**
1. Cek apakah role user sesuai dengan requiredRole di route
2. Cek apakah token masih valid (tidak expired)
3. Cek console untuk error messages

### Issue: Permission denied meskipun seharusnya punya akses

**Solution:**
1. Cek definisi permission di `backend/middleware/rbac.js`
2. Cek apakah middleware `checkPermission` dipanggil dengan parameter yang benar
3. Cek apakah user role sesuai dengan yang diharapkan

### Issue: Frontend dan backend permission tidak sync

**Solution:**
1. Pastikan definisi permission di frontend dan backend konsisten
2. Update kedua file jika ada perubahan permission

## Kesimpulan

Sistem RBAC yang diimplementasikan memberikan:
- ✅ Kontrol akses yang granular berdasarkan role
- ✅ Security yang kuat dengan multiple layers
- ✅ Konsistensi antara frontend dan backend
- ✅ Kemudahan untuk extend dan maintain
- ✅ Best practices untuk authentication dan authorization

Sistem ini memastikan bahwa setiap user hanya bisa mengakses dan melakukan action yang sesuai dengan role mereka, meningkatkan keamanan aplikasi secara keseluruhan.

