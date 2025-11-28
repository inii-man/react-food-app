# Super Admin Login Guide

## Default Super Admin Credentials

Setelah server start dan seeder berjalan, default superadmin user akan dibuat otomatis:

**Email:** `superadmin@foodapp.com`  
**Password:** `superadmin123`

⚠️ **PENTING:** Ganti password ini di production!

---

## Cara Login sebagai Super Admin

### 1. Via Frontend

1. Buka aplikasi di browser
2. Klik "Login"
3. Masukkan credentials:
   - Email: `superadmin@foodapp.com`
   - Password: `superadmin123`
4. Klik "Login"
5. Setelah login, menu "RBAC Management" akan muncul di navbar

### 2. Via API (curl/Postman)

```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@foodapp.com",
    "password": "superadmin123"
  }'
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Super Admin",
    "email": "superadmin@foodapp.com",
    "roles": ["superadmin"],
    "permissions": ["menu.view", "menu.create", ...],
    "role": "superadmin"
  }
}
```

---

## Cara Membuat Super Admin User Baru

### Option 1: Via API (setelah login sebagai superadmin)

```bash
# 1. Register user biasa
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Super Admin",
    "email": "newadmin@foodapp.com",
    "password": "password123"
  }'

# 2. Assign superadmin role (harus login sebagai superadmin dulu)
curl -X POST http://localhost:5002/api/rbac/users/{userId}/roles \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "superadmin"
  }'
```

### Option 2: Via Database (SQL)

```sql
-- 1. Insert user
INSERT INTO Users (name, email, password, role, createdAt, updatedAt)
VALUES ('Super Admin', 'superadmin@foodapp.com', '$2a$10$...', NULL, datetime('now'), datetime('now'));

-- 2. Get user ID and role ID
-- User ID: (dari query di atas)
-- Role ID: SELECT id FROM roles WHERE name = 'superadmin';

-- 3. Assign role
INSERT INTO model_has_roles (role_id, model_id, model_type)
VALUES (
  (SELECT id FROM roles WHERE name = 'superadmin'),
  (SELECT id FROM Users WHERE email = 'superadmin@foodapp.com'),
  'User'
);
```

### Option 3: Via Seeder (modify seeder)

Edit `backend/seeders/rbacSeeder.js` dan tambahkan user baru:

```javascript
const [newSuperAdmin, created] = await User.findOrCreate({
  where: { email: "newadmin@foodapp.com" },
  defaults: {
    name: "New Super Admin",
    email: "newadmin@foodapp.com",
    password: "password123",
  },
});

if (created) {
  await newSuperAdmin.assignRole("superadmin");
}
```

---

## Cara Assign Super Admin Role ke User yang Sudah Ada

### Via API (setelah login sebagai superadmin)

```bash
# Get user ID dulu
curl -X GET http://localhost:5002/api/rbac/user/me \
  -H "Authorization: Bearer USER_TOKEN"

# Assign superadmin role
curl -X POST http://localhost:5002/api/rbac/users/{userId}/roles \
  -H "Authorization: Bearer SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "superadmin"
  }'
```

### Via Frontend (jika sudah ada superadmin)

1. Login sebagai superadmin
2. Buka RBAC Management page
3. (Feature ini bisa ditambahkan untuk manage users)

---

## Troubleshooting

### Issue: Superadmin user tidak terbuat

**Solution:**
1. Check console saat server start - seeder harus berjalan
2. Check database - query:
   ```sql
   SELECT * FROM Users WHERE email = 'superadmin@foodapp.com';
   SELECT * FROM model_has_roles WHERE model_id = (SELECT id FROM Users WHERE email = 'superadmin@foodapp.com');
   ```
3. Run seeder manual:
   ```javascript
   import { seedRBAC } from './seeders/rbacSeeder.js';
   await seedRBAC();
   ```

### Issue: Login gagal dengan password default (Invalid Credentials)

**Solution:**

Ini biasanya terjadi karena password tidak ter-hash dengan benar saat user dibuat. Ada beberapa cara untuk fix:

#### Option 1: Reset Password via Script (Recommended)

```bash
cd backend
npm run reset-superadmin
```

Script ini akan:
- Create superadmin user jika belum ada
- Reset password ke `superadmin123` dengan hash yang benar
- Assign superadmin role

#### Option 2: Delete User dan Restart Server

```bash
# Delete user dari database (SQLite)
sqlite3 database.sqlite
DELETE FROM Users WHERE email = 'superadmin@foodapp.com';
DELETE FROM model_has_roles WHERE model_id = (SELECT id FROM Users WHERE email = 'superadmin@foodapp.com');
.exit

# Restart server - seeder akan create user baru dengan password yang benar
npm run dev
```

#### Option 3: Manual Reset via Database

```sql
-- Hash password: superadmin123
-- Hash value (bcrypt): $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- (Note: hash akan berbeda setiap kali, jadi lebih baik gunakan script)

-- Update password
UPDATE Users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'superadmin@foodapp.com';
```

**Cara terbaik:** Gunakan script `npm run reset-superadmin` untuk memastikan password ter-hash dengan benar.

### Issue: Menu "RBAC Management" tidak muncul

**Solution:**
1. Check apakah user punya role superadmin:
   ```bash
   curl -X GET http://localhost:5002/api/rbac/user/me \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
2. Check response - harus ada `"roles": ["superadmin"]`
3. Refresh browser setelah login

---

## Security Best Practices

1. ✅ **Ganti default password** - Jangan gunakan `superadmin123` di production
2. ✅ **Limit superadmin users** - Hanya buat superadmin untuk admin yang benar-benar perlu
3. ✅ **Use strong passwords** - Minimal 12 karakter, kombinasi huruf, angka, simbol
4. ✅ **Enable 2FA** (optional) - Untuk extra security
5. ✅ **Audit log** - Track semua perubahan permissions

---

**Happy Admining! 🚀**

