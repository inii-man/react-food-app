# Redux Tutorial - Food App

## 📚 Daftar Isi

1. [Pengenalan Redux Toolkit](#pengenalan-redux-toolkit)
2. [Setup Redux di Project](#setup-redux-di-project)
3. [Store Configuration](#store-configuration)
4. [Membuat Slice](#membuat-slice)
5. [Async Thunks](#async-thunks)
6. [Menggunakan Redux di Components](#menggunakan-redux-di-components)
7. [State Management Patterns](#state-management-patterns)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Pengenalan Redux Toolkit

### Apa itu Redux Toolkit?

**Redux Toolkit (RTK)** adalah cara resmi yang direkomendasikan untuk menulis logika Redux. Redux Toolkit menyederhanakan banyak tugas umum Redux, termasuk:

- ✅ Mengurangi boilerplate code
- ✅ Built-in support untuk async logic (thunks)
- ✅ Immer untuk immutable updates
- ✅ DevTools integration
- ✅ TypeScript support

### Mengapa Menggunakan Redux?

Redux membantu mengelola **global state** aplikasi dengan cara yang predictable dan mudah di-debug. Di aplikasi Food App ini, Redux digunakan untuk:

- **Authentication state** - User info, token, login status
- **Menu state** - List menu items, current menu
- **Cart state** - Shopping cart items
- **Order state** - Orders list, current order

### Redux vs Local State

| Use Case | Local State (useState) | Redux |
|----------|------------------------|-------|
| Form input | ✅ Ya | ❌ Tidak perlu |
| User authentication | ❌ Tidak | ✅ Ya |
| Shopping cart | ❌ Tidak | ✅ Ya |
| Menu items | ❌ Tidak | ✅ Ya |
| UI state (modal open/close) | ✅ Ya | ❌ Tidak perlu |

**Rule of thumb:** Gunakan Redux untuk state yang perlu diakses oleh banyak components atau perlu persist.

---

## Setup Redux di Project

### 1. Install Dependencies

Redux Toolkit sudah terinstall di project ini. Jika perlu install manual:

```bash
cd frontend
pnpm add @reduxjs/toolkit react-redux
```

### 2. Project Structure

Struktur Redux di project ini:

```
frontend/src/
├── store/
│   ├── store.js              # Store configuration
│   └── slices/
│       ├── authSlice.js      # Authentication slice
│       ├── menuSlice.js       # Menu slice
│       ├── cartSlice.js       # Cart slice
│       └── orderSlice.js      # Order slice
```

### 3. Provider Setup

Redux Provider sudah di-setup di `main.jsx`:

```jsx
// main.jsx
import { Provider } from 'react-redux';
import { store } from './store/store.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

**Provider** membuat Redux store tersedia untuk semua components di aplikasi.

---

## Store Configuration

### Store Setup

File `store/store.js` mengkonfigurasi Redux store:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import menuReducer from './slices/menuSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    cart: cartReducer,
    order: orderReducer,
  },
});
```

### Penjelasan:

1. **`configureStore`** - Function dari Redux Toolkit untuk membuat store
2. **`reducer`** - Object yang menggabungkan semua reducers
3. **State structure** - State akan terstruktur seperti ini:

```javascript
{
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  menu: {
    menus: [],
    currentMenu: null,
    loading: false,
    error: null
  },
  cart: {
    items: [],
    loading: false,
    error: null
  },
  order: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null
  }
}
```

### Redux DevTools

Redux Toolkit secara otomatis mengaktifkan Redux DevTools. Install extension di browser:
- [Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

---

## Membuat Slice

### Apa itu Slice?

**Slice** adalah collection of Redux reducer logic dan actions untuk feature tertentu. Setiap slice mengelola bagian state yang spesifik.

### Struktur Slice

Slice terdiri dari:

1. **Initial State** - State awal
2. **Reducers** - Synchronous actions
3. **Async Thunks** - Asynchronous actions (API calls)
4. **Extra Reducers** - Handle async thunk states

### Contoh: authSlice

Mari kita lihat `authSlice.js` sebagai contoh:

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 1. Initial State
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// 2. Create Slice
const authSlice = createSlice({
  name: 'auth',  // Nama slice (untuk DevTools)
  initialState,
  
  // 3. Synchronous Reducers
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  
  // 4. Extra Reducers (untuk async thunks)
  extraReducers: (builder) => {
    // Handle async thunk states
  },
});

// Export actions
export const { logout, clearError } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
```

### Penjelasan:

1. **`createSlice`** - Membuat slice dengan reducers dan actions
2. **`name`** - Prefix untuk action types (misal: `auth/logout`)
3. **`reducers`** - Object berisi reducer functions
4. **Immer** - Redux Toolkit menggunakan Immer, jadi kita bisa mutate state langsung (akan di-convert ke immutable)

---

## Async Thunks

### Apa itu Async Thunk?

**Async Thunk** adalah function yang mengembalikan function yang bisa digunakan untuk async operations (API calls, timers, dll).

### Membuat Async Thunk

Contoh dari `authSlice.js`:

```javascript
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const login = createAsyncThunk(
  'auth/login',  // Action type prefix
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });
      
      // Save to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;  // Return sebagai action.payload
    } catch (error) {
      // Return error sebagai rejected value
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);
```

### Penjelasan:

1. **`createAsyncThunk`** - Membuat async thunk
2. **Action type** - `'auth/login'` akan generate 3 action types:
   - `auth/login/pending` - Saat request dimulai
   - `auth/login/fulfilled` - Saat request berhasil
   - `auth/login/rejected` - Saat request gagal
3. **`rejectWithValue`** - Untuk return custom error message

### Handling Async Thunk di Extra Reducers

```javascript
extraReducers: (builder) => {
  builder
    // Pending state
    .addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    // Fulfilled state (success)
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    })
    // Rejected state (error)
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
}
```

### Async Thunk Pattern yang Digunakan

Di project ini, setiap async thunk mengikuti pattern:

```javascript
export const fetchMenus = createAsyncThunk(
  'menu/fetchMenus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/menu`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch menus'
      );
    }
  }
);
```

**Pattern:**
- ✅ Try-catch untuk error handling
- ✅ `rejectWithValue` untuk custom error messages
- ✅ Return response data sebagai payload
- ✅ Consistent error message format

---

## Menggunakan Redux di Components

### 1. Menggunakan useSelector

**`useSelector`** hook untuk membaca state dari Redux store:

```jsx
import { useSelector } from 'react-redux';

function MenuList() {
  // Read state dari Redux store
  const { menus, loading } = useSelector((state) => state.menu);
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div>
      {loading ? 'Loading...' : menus.map(menu => ...)}
    </div>
  );
}
```

### 2. Menggunakan useDispatch

**`useDispatch`** hook untuk dispatch actions:

```jsx
import { useDispatch } from 'react-redux';
import { fetchMenus, addToCart } from '../store/slices/menuSlice';

function MenuList() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Dispatch async thunk
    dispatch(fetchMenus());
  }, [dispatch]);

  const handleAddToCart = (menuId) => {
    // Dispatch action
    dispatch(addToCart({ menuId, quantity: 1 }));
  };

  return <div>...</div>;
}
```

### 3. Complete Example

Contoh lengkap dari `MenuList.jsx`:

```jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenus } from '../store/slices/menuSlice';
import { addToCart } from '../store/slices/cartSlice';

function MenuList() {
  const dispatch = useDispatch();
  
  // Read state
  const { menus, loading } = useSelector((state) => state.menu);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fetch menus on component mount
  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  const handleAddToCart = (menuId) => {
    if (!isAuthenticated) {
      alert('Please login first');
      return;
    }
    dispatch(addToCart({ menuId, quantity: 1 }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {menus.map(menu => (
        <div key={menu.id}>
          <h3>{menu.name}</h3>
          <button onClick={() => handleAddToCart(menu.id)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 4. Handling Async Actions dengan unwrap()

Untuk handle promise dari async thunk:

```jsx
import { createOrder } from '../store/slices/orderSlice';

function Cart() {
  const dispatch = useDispatch();

  const handleCheckout = async () => {
    try {
      // unwrap() untuk get promise dari thunk
      await dispatch(createOrder(orderItems)).unwrap();
      // Success - order created
      navigate('/orders');
    } catch (error) {
      // Error handling
      alert('Failed to create order: ' + error);
    }
  };

  return <button onClick={handleCheckout}>Checkout</button>;
}
```

**`unwrap()`** mengembalikan promise yang bisa di-handle dengan try-catch.

---

## State Management Patterns

### Pattern 1: Loading States

Setiap slice memiliki `loading` state untuk track async operations:

```javascript
// Slice
const initialState = {
  menus: [],
  loading: false,
  error: null,
};

// Component
const { menus, loading } = useSelector((state) => state.menu);

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <MenuList menus={menus} />;
```

### Pattern 2: Error Handling

Error disimpan di state dan ditampilkan di UI:

```javascript
// Slice
.addCase(fetchMenus.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

// Component
const { error } = useSelector((state) => state.menu);

{error && <Alert severity="error">{error}</Alert>}
```

### Pattern 3: Optimistic Updates

Update state sebelum API call selesai (untuk better UX):

```javascript
// Example: Update cart quantity
.addCase(updateCartItem.pending, (state, action) => {
  // Optimistically update UI
  const item = state.items.find(i => i.menuId === action.meta.arg.menuId);
  if (item) {
    item.quantity = action.meta.arg.quantity;
  }
})
```

### Pattern 4: Normalized State

Untuk complex data, normalize state structure:

```javascript
// Instead of array
menus: [{ id: 1, ... }, { id: 2, ... }]

// Use normalized structure
menus: {
  byId: {
    1: { id: 1, ... },
    2: { id: 2, ... }
  },
  allIds: [1, 2]
}
```

### Pattern 5: Selectors

Gunakan selectors untuk computed values:

```javascript
// Selector function
export const selectMenuById = (state, menuId) => 
  state.menu.menus.find(m => m.id === menuId);

// Usage
const menu = useSelector(state => selectMenuById(state, menuId));
```

---

## Best Practices

### 1. Organize Slices by Feature

Setiap feature memiliki slice sendiri:

```
slices/
├── authSlice.js      # Authentication
├── menuSlice.js      # Menu management
├── cartSlice.js      # Shopping cart
└── orderSlice.js     # Orders
```

### 2. Consistent State Structure

Setiap slice mengikuti struktur yang konsisten:

```javascript
const initialState = {
  // Data
  items: [],
  currentItem: null,
  
  // UI state
  loading: false,
  error: null,
};
```

### 3. Error Handling

Selalu handle error dengan baik:

```javascript
// ✅ Good
try {
  await dispatch(createOrder(items)).unwrap();
} catch (error) {
  // Show user-friendly error
  alert(error.message || 'Something went wrong');
}

// ❌ Bad
dispatch(createOrder(items)); // No error handling
```

### 4. Loading States

Selalu track loading states:

```javascript
// ✅ Good
const { loading } = useSelector(state => state.order);
{loading && <Spinner />}

// ❌ Bad
// No loading indicator
```

### 5. Avoid Unnecessary Re-renders

Gunakan selector yang spesifik:

```javascript
// ✅ Good - Only re-render when menus change
const menus = useSelector(state => state.menu.menus);

// ❌ Bad - Re-render on any state change
const state = useSelector(state => state);
const menus = state.menu.menus;
```

### 6. Clean Up on Unmount

Clear state jika perlu:

```javascript
useEffect(() => {
  dispatch(fetchMenus());
  
  return () => {
    dispatch(clearError()); // Clean up
  };
}, [dispatch]);
```

### 7. Type Safety (jika menggunakan TypeScript)

Gunakan typed hooks:

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 8. Async Thunk Best Practices

- ✅ Always use `rejectWithValue` untuk custom errors
- ✅ Return meaningful error messages
- ✅ Handle all three states (pending, fulfilled, rejected)
- ✅ Update loading state di semua cases

---

## Contoh Lengkap: Membuat Slice Baru

Mari kita buat slice baru untuk contoh: `notificationSlice.js`

### Step 1: Buat File Slice

```javascript
// store/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'info',
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { 
  addNotification, 
  removeNotification, 
  clearNotifications 
} = notificationSlice.actions;

export default notificationSlice.reducer;
```

### Step 2: Tambahkan ke Store

```javascript
// store/store.js
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    cart: cartReducer,
    order: orderReducer,
    notification: notificationReducer, // Add here
  },
});
```

### Step 3: Gunakan di Component

```jsx
// components/Notification.jsx
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../store/slices/notificationSlice';

function Notification() {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notification.notifications);

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id}>
          {notif.message}
          <button onClick={() => dispatch(removeNotification(notif.id))}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Troubleshooting

### Problem 1: State tidak update

**Solution:**
- Pastikan component di-wrap dengan `<Provider>`
- Check apakah action di-dispatch dengan benar
- Verify reducer mengupdate state dengan benar

```javascript
// Debug dengan console.log
console.log('Current state:', store.getState());
```

### Problem 2: Re-render terlalu sering

**Solution:**
- Gunakan selector yang spesifik
- Gunakan `useMemo` untuk expensive computations
- Check apakah object/array reference berubah

```javascript
// ✅ Good
const menus = useSelector(state => state.menu.menus);

// ❌ Bad - creates new object every time
const menuState = useSelector(state => ({ 
  menus: state.menu.menus 
}));
```

### Problem 3: Async thunk tidak bekerja

**Solution:**
- Pastikan menggunakan `unwrap()` untuk handle promise
- Check error di rejected case
- Verify API endpoint dan headers

```javascript
// ✅ Good
try {
  await dispatch(fetchMenus()).unwrap();
} catch (error) {
  console.error('Error:', error);
}

// ❌ Bad
dispatch(fetchMenus()); // No error handling
```

### Problem 4: State hilang setelah refresh

**Solution:**
- State Redux tidak persist secara default
- Gunakan `localStorage` untuk persist (seperti di authSlice)
- Atau gunakan library seperti `redux-persist`

```javascript
// Example: Persist auth state
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
};
```

### Problem 5: Cannot read property of undefined

**Solution:**
- Pastikan state sudah di-initialize dengan benar
- Gunakan optional chaining
- Check initial state structure

```javascript
// ✅ Good
const user = useSelector(state => state.auth?.user);

// ❌ Bad
const user = useSelector(state => state.auth.user); // Might be undefined
```

---

## Redux DevTools

### Menggunakan Redux DevTools

1. **Install Extension** di browser
2. **Open DevTools** → Redux tab
3. **Monitor Actions** - Lihat semua actions yang di-dispatch
4. **Time Travel** - Jump ke state sebelumnya
5. **State Inspector** - Lihat current state

### Action Types

Di DevTools, Anda akan melihat action types seperti:
- `auth/login/pending`
- `auth/login/fulfilled`
- `auth/login/rejected`
- `menu/fetchMenus/pending`
- `cart/addToCart/fulfilled`

### State Diff

DevTools menampilkan diff antara state sebelum dan sesudah action.

---

## Summary

### Key Takeaways

1. **Redux Toolkit** menyederhanakan Redux dengan less boilerplate
2. **Slices** mengorganisir reducers dan actions per feature
3. **Async Thunks** handle API calls dengan baik
4. **useSelector** untuk read state
5. **useDispatch** untuk dispatch actions
6. **Consistent patterns** membuat code maintainable

### File Structure Summary

```
store/
├── store.js              # Store configuration
└── slices/
    ├── authSlice.js      # Auth: login, register, logout
    ├── menuSlice.js      # Menu: CRUD operations
    ├── cartSlice.js      # Cart: add, update, remove, clear
    └── orderSlice.js     # Order: create, fetch, update status
```

### Common Patterns

- ✅ Loading states untuk async operations
- ✅ Error handling dengan error state
- ✅ localStorage untuk persist auth
- ✅ Optimistic updates untuk better UX
- ✅ Consistent state structure

---

## Resources

### Official Documentation
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

### Project Files
- `store/store.js` - Store configuration
- `store/slices/*.js` - All slices
- Components menggunakan Redux hooks

### Next Steps
- Explore Redux DevTools
- Try membuat slice baru
- Experiment dengan different patterns
- Read Redux Toolkit documentation

---

**Happy Coding! 🚀**

