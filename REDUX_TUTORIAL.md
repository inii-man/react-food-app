# Redux Tutorial - Food App

## 📚 Daftar Isi

1. [Pengenalan Redux Toolkit](#pengenalan-redux-toolkit)
2. [Konsep Dasar Redux](#konsep-dasar-redux)
   - [Store](#store)
   - [Action](#action)
   - [Reducer](#reducer)
   - [Dispatch](#dispatch)
   - [Selector](#selector)
3. [Redux Toolkit Concepts](#redux-toolkit-concepts)
   - [Slice](#slice)
   - [createSlice](#createslice)
   - [createAsyncThunk](#createasyncthunk)
4. [Setup Redux di Project](#setup-redux-di-project)
5. [Store Configuration](#store-configuration)
6. [Membuat Slice](#membuat-slice)
7. [Async Thunks](#async-thunks)
8. [Menggunakan Redux di Components](#menggunakan-redux-di-components)
9. [State Management Patterns](#state-management-patterns)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

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

| Use Case                    | Local State (useState) | Redux          |
| --------------------------- | ---------------------- | -------------- |
| Form input                  | ✅ Ya                  | ❌ Tidak perlu |
| User authentication         | ❌ Tidak               | ✅ Ya          |
| Shopping cart               | ❌ Tidak               | ✅ Ya          |
| Menu items                  | ❌ Tidak               | ✅ Ya          |
| UI state (modal open/close) | ✅ Ya                  | ❌ Tidak perlu |

**Rule of thumb:** Gunakan Redux untuk state yang perlu diakses oleh banyak components atau perlu persist.

---

## Konsep Dasar Redux

Sebelum masuk ke implementasi, penting untuk memahami konsep-konsep fundamental Redux. Mari kita bahas satu per satu dengan detail.

### Store

**Store** adalah object JavaScript yang menyimpan seluruh state aplikasi. Store adalah "single source of truth" - semua state aplikasi berada di satu tempat.

#### Karakteristik Store:

1. **Single Store** - Hanya ada satu store untuk seluruh aplikasi
2. **Immutable** - State tidak bisa diubah langsung
3. **Read-only** - State hanya bisa diubah melalui actions
4. **Predictable** - Perubahan state selalu melalui reducer

#### Visualisasi Store:

```
┌─────────────────────────────────┐
│           REDUX STORE           │
│                                 │
│  ┌───────────────────────────┐  │
│  │      State Object         │  │
│  │  {                        │  │
│  │    auth: { ... },         │  │
│  │    menu: { ... },         │  │
│  │    cart: { ... },         │  │
│  │    order: { ... }         │  │
│  │  }                        │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │      Reducers             │  │
│  │  - authReducer            │  │
│  │  - menuReducer            │  │
│  │  - cartReducer           │  │
│  │  - orderReducer          │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

#### Contoh Store State:

```javascript
{
  auth: {
    user: { id: 1, name: "John", email: "john@example.com" },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    isAuthenticated: true,
    loading: false,
    error: null
  },
  menu: {
    menus: [
      { id: 1, name: "Burger", price: 50000 },
      { id: 2, name: "Pizza", price: 75000 }
    ],
    loading: false,
    error: null
  },
  cart: {
    items: [
      { menuId: 1, quantity: 2 },
      { menuId: 2, quantity: 1 }
    ],
    loading: false
  },
  order: {
    orders: [],
    currentOrder: null,
    loading: false
  }
}
```

---

### Action

**Action** adalah object JavaScript yang menjelaskan **apa yang terjadi** di aplikasi. Action adalah cara untuk memberitahu Redux bahwa sesuatu telah terjadi.

#### Struktur Action:

```javascript
{
  type: 'ACTION_TYPE',  // String yang menjelaskan action
  payload: { ... }      // Data yang dikirim bersama action (optional)
}
```

#### Contoh Action:

```javascript
// Action untuk login
{
  type: 'auth/login/fulfilled',
  payload: {
    user: { id: 1, name: "John" },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Action untuk add to cart
{
  type: 'cart/addToCart/fulfilled',
  payload: [
    { menuId: 1, quantity: 2 },
    { menuId: 2, quantity: 1 }
  ]
}

// Action untuk logout (synchronous)
{
  type: 'auth/logout',
  payload: undefined
}
```

#### Action Types:

Action type adalah string yang unik yang menjelaskan action. Convention:

- Format: `feature/actionName/status`
- Contoh: `auth/login/fulfilled`, `menu/fetchMenus/pending`

#### Membuat Action (Traditional Redux):

```javascript
// Traditional way (tidak digunakan di Redux Toolkit)
const loginAction = {
  type: "auth/login",
  payload: { email: "user@example.com", password: "password123" },
};

// Action creator function
function login(email, password) {
  return {
    type: "auth/login",
    payload: { email, password },
  };
}
```

**Di Redux Toolkit**, actions dibuat otomatis oleh `createSlice`, jadi kita tidak perlu membuat manual.

---

### Reducer

**Reducer** adalah **pure function** yang menentukan bagaimana state berubah berdasarkan action yang di-dispatch. Reducer adalah fungsi yang mengambil current state dan action, lalu mengembalikan new state.

#### Signature Reducer:

```javascript
function reducer(state, action) {
  // Return new state berdasarkan action
  return newState;
}
```

#### Karakteristik Reducer:

1. **Pure Function** - Tidak ada side effects (tidak ada API calls, tidak ada mutations)
2. **Immutable** - Tidak mengubah state langsung, selalu return new state
3. **Predictable** - Input yang sama selalu menghasilkan output yang sama
4. **Synchronous** - Tidak ada async operations di reducer

#### Contoh Reducer (Traditional Redux):

```javascript
// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
};

// Reducer function
function authReducer(state = initialState, action) {
  switch (action.type) {
    case "auth/login/fulfilled":
      // Return NEW state object (immutable)
      return {
        ...state, // Copy existing state
        user: action.payload.user,
        isAuthenticated: true,
      };

    case "auth/logout":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };

    default:
      // Always return current state jika action tidak dikenal
      return state;
  }
}
```

#### Reducer Rules:

1. **Never mutate state directly**

   ```javascript
   // ❌ BAD - Mutating state
   state.user = action.payload.user;
   return state;

   // ✅ GOOD - Return new state
   return {
     ...state,
     user: action.payload.user,
   };
   ```

2. **Always return state**

   ```javascript
   // ❌ BAD - No return
   function reducer(state, action) {
     state.user = action.payload;
   }

   // ✅ GOOD - Always return
   function reducer(state, action) {
     return {
       ...state,
       user: action.payload,
     };
   }
   ```

3. **Handle unknown actions**
   ```javascript
   // ✅ GOOD - Default case
   default:
     return state;
   ```

#### Reducer Flow:

```
Current State + Action → Reducer → New State

Example:
{ user: null } + { type: 'login', payload: { user: {...} } }
    ↓
Reducer processes action
    ↓
{ user: {...}, isAuthenticated: true }
```

#### Visualisasi Reducer:

```
┌─────────────────────────────────────────────────┐
│              REDUCER FUNCTION                   │
│                                                 │
│  function authReducer(state, action) {         │
│    switch (action.type) {                       │
│      case 'auth/login':                         │
│        return {                                 │
│          ...state,                              │
│          user: action.payload,                 │
│          isAuthenticated: true                  │
│        };                                       │
│      case 'auth/logout':                        │
│        return {                                 │
│          ...state,                              │
│          user: null,                            │
│          isAuthenticated: false                 │
│        };                                       │
│      default:                                   │
│        return state;                            │
│    }                                            │
│  }                                              │
└─────────────────────────────────────────────────┘
         ↑                    ↓
    Input: State      Output: New State
    + Action          (Immutable)
```

#### Contoh Reducer Step-by-Step:

```javascript
// Step 1: Initial State
const initialState = {
  user: null,
  isAuthenticated: false,
};

// Step 2: Action dispatched
const action = {
  type: "auth/login",
  payload: { id: 1, name: "John", email: "john@example.com" },
};

// Step 3: Reducer called
const newState = authReducer(initialState, action);

// Step 4: New state returned
// {
//   user: { id: 1, name: 'John', email: 'john@example.com' },
//   isAuthenticated: true
// }

// Step 5: Store updated dengan new state
```

#### Multiple Reducers:

Di aplikasi besar, kita punya banyak reducers untuk features berbeda:

```javascript
// authReducer - handles authentication
function authReducer(state, action) { ... }

// menuReducer - handles menu items
function menuReducer(state, action) { ... }

// cartReducer - handles shopping cart
function cartReducer(state, action) { ... }

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  menu: menuReducer,
  cart: cartReducer,
});
```

**Di Redux Toolkit**, kita menggunakan `configureStore` yang otomatis combine reducers.

---

### Dispatch

**Dispatch** adalah function yang digunakan untuk mengirim action ke store. Ketika kita dispatch action, Redux akan memanggil reducer dengan current state dan action tersebut.

#### Cara Kerja Dispatch:

```
Component → dispatch(action) → Store → Reducer → New State → Component Re-render
```

#### Contoh Dispatch:

```javascript
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

function Header() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Dispatch action
    dispatch(logout());
    // Redux akan:
    // 1. Kirim action ke store
    // 2. Panggil authReducer dengan current state dan action
    // 3. Update state
    // 4. Notify semua components yang subscribe
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

#### Dispatch dengan Payload:

```javascript
// Dispatch action dengan data
dispatch(login({ email: "user@example.com", password: "pass123" }));

// Dispatch async thunk
dispatch(fetchMenus()).then(() => {
  console.log("Menus fetched!");
});
```

#### Dispatch Flow:

```
1. Component calls dispatch(action)
   ↓
2. Store receives action
   ↓
3. Store calls reducer(currentState, action)
   ↓
4. Reducer returns new state
   ↓
5. Store updates state
   ↓
6. Store notifies all subscribers (components using useSelector)
   ↓
7. Components re-render with new state
```

#### Visualisasi Dispatch:

```
┌──────────────┐
│  Component   │
│              │
│  Button Click│
└──────┬───────┘
       │
       │ dispatch(login({ email, password }))
       ↓
┌──────────────────┐
│   Redux Store    │
│                  │
│  1. Receive      │
│     action       │
│                  │
│  2. Call reducer │
│     with current │
│     state        │
│                  │
│  3. Update state │
│                  │
│  4. Notify       │
│     subscribers  │
└──────┬───────────┘
       │
       │ State updated
       ↓
┌──────────────┐
│  Components  │
│  Re-render   │
│  with new    │
│  state       │
└──────────────┘
```

#### Contoh Dispatch Lengkap:

```javascript
// Component
function LoginForm() {
  const dispatch = useDispatch();

  const handleLogin = () => {
    // 1. Dispatch action
    dispatch(
      login({
        email: "user@example.com",
        password: "password123",
      })
    );

    // 2. Redux akan:
    //    - Kirim action ke store
    //    - Store panggil authReducer
    //    - Reducer return new state
    //    - Store update state
    //    - Components yang subscribe akan re-render
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

---

### Selector

**Selector** adalah function yang digunakan untuk **mengambil data** dari Redux store. Selector memungkinkan kita untuk mengambil bagian tertentu dari state.

#### Menggunakan useSelector Hook:

```javascript
import { useSelector } from 'react-redux';

function MenuList() {
  // Selector: mengambil menus dari state.menu.menus
  const menus = useSelector((state) => state.menu.menus);

  // Selector: mengambil loading state
  const loading = useSelector((state) => state.menu.loading);

  // Selector: mengambil multiple values
  const { menus, loading, error } = useSelector((state) => ({
    menus: state.menu.menus,
    loading: state.menu.loading,
    error: state.menu.error,
  }));

  return <div>{menus.map(...)}</div>;
}
```

#### Selector Function:

Kita juga bisa membuat selector function untuk reusability:

```javascript
// Selector functions
export const selectMenus = (state) => state.menu.menus;
export const selectMenuLoading = (state) => state.menu.loading;
export const selectMenuById = (state, menuId) =>
  state.menu.menus.find((menu) => menu.id === menuId);

// Usage
const menus = useSelector(selectMenus);
const loading = useSelector(selectMenuLoading);
const menu = useSelector((state) => selectMenuById(state, menuId));
```

#### Memoized Selectors (dengan reselect):

Untuk performance, kita bisa memoize selectors:

```javascript
import { createSelector } from "@reduxjs/toolkit";

// Memoized selector - hanya re-compute jika menus berubah
export const selectExpensiveMenus = createSelector([selectMenus], (menus) =>
  menus.filter((menu) => menu.price > 100000)
);
```

#### Visualisasi Selector:

```
┌─────────────────────────────────┐
│         Redux Store             │
│                                 │
│  {                              │
│    auth: { user: {...} },      │
│    menu: {                      │
│      menus: [                   │
│        { id: 1, name: "..." }, │
│        { id: 2, name: "..." }   │
│      ]                          │
│    },                           │
│    cart: { items: [...] },     │
│    order: { orders: [...] }     │
│  }                              │
└──────────────┬──────────────────┘
               │
               │ useSelector(state => state.menu.menus)
               ↓
┌─────────────────────────────────┐
│      Component                   │
│                                 │
│  const menus = useSelector(...) │
│                                 │
│  menus = [                      │
│    { id: 1, name: "..." },      │
│    { id: 2, name: "..." }       │
│  ]                              │
└─────────────────────────────────┘
```

#### Selector Comparison:

```javascript
// ❌ BAD - Component re-render on ANY state change
const state = useSelector((state) => state);
const menus = state.menu.menus;
const user = state.auth.user;

// ✅ GOOD - Component hanya re-render ketika menus berubah
const menus = useSelector((state) => state.menu.menus);

// ✅ GOOD - Component hanya re-render ketika user berubah
const user = useSelector((state) => state.auth.user);

// ✅ GOOD - Multiple specific selectors
const menus = useSelector((state) => state.menu.menus);
const loading = useSelector((state) => state.menu.loading);
```

#### Selector Best Practices:

1. **Be Specific** - Ambil hanya data yang diperlukan

   ```javascript
   // ✅ GOOD
   const menus = useSelector((state) => state.menu.menus);

   // ❌ BAD - Re-render on any state change
   const state = useSelector((state) => state);
   const menus = state.menu.menus;
   ```

2. **Use Multiple Selectors** - Untuk granular updates
   ```javascript
   // ✅ GOOD - Only re-render when menus or loading change
   const menus = useSelector((state) => state.menu.menus);
   const loading = useSelector((state) => state.menu.loading);
   ```

---

## Redux Toolkit Concepts

Redux Toolkit menyederhanakan Redux dengan konsep-konsep baru. Mari kita bahas detail.

### Slice

**Slice** adalah collection dari Redux reducer logic dan actions untuk satu feature. Slice menggabungkan:

- Initial state
- Reducer functions
- Action creators
- Action types

#### Mengapa Slice?

**Traditional Redux** memerlukan banyak boilerplate:

```javascript
// ❌ Traditional Redux - Banyak boilerplate
const LOGIN = "auth/login";
const LOGOUT = "auth/logout";

function loginAction(user) {
  return { type: LOGIN, payload: user };
}

function logoutAction() {
  return { type: LOGOUT };
}

function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return { ...state, user: action.payload };
    case LOGOUT:
      return { ...state, user: null };
    default:
      return state;
  }
}
```

**Redux Toolkit dengan Slice** - Lebih sederhana:

```javascript
// ✅ Redux Toolkit - Less boilerplate
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload; // Immer handles immutability
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

// Actions dan reducer dibuat otomatis!
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
```

#### Struktur Slice:

```javascript
const featureSlice = createSlice({
  name: 'feature',        // Nama slice (untuk action types)
  initialState: { ... },   // Initial state
  reducers: {             // Synchronous reducers
    actionName: (state, action) => {
      // Update state
    },
  },
  extraReducers: (builder) => {  // Untuk async thunks
    builder
      .addCase(asyncThunk.pending, (state) => { ... })
      .addCase(asyncThunk.fulfilled, (state, action) => { ... })
      .addCase(asyncThunk.rejected, (state, action) => { ... });
  },
});
```

#### Apa yang Dibuat oleh createSlice?

Ketika kita membuat slice, Redux Toolkit otomatis membuat:

1. **Action Creators** - Functions untuk dispatch actions

   ```javascript
   // Otomatis dibuat:
   authSlice.actions.login({ user: {...} })
   authSlice.actions.logout()
   ```

2. **Action Types** - String constants untuk action types

   ```javascript
   // Otomatis dibuat:
   "auth/login";
   "auth/logout";
   ```

3. **Reducer** - Function untuk handle actions
   ```javascript
   // Otomatis dibuat:
   authSlice.reducer;
   ```

#### Visualisasi createSlice:

```
┌─────────────────────────────────────┐
│      createSlice({                  │
│        name: 'auth',                │
│        initialState: {...},         │
│        reducers: {                  │
│          login: (state, action) => {│
│            state.user = action.payload│
│          },                          │
│          logout: (state) => {       │
│            state.user = null        │
│          }                           │
│        }                             │
│      })                              │
└──────────────┬──────────────────────┘
               │
               │ Auto-generates:
               ↓
┌──────────────────────────────────────┐
│  1. Action Creators:                 │
│     - login(payload)                 │
│     - logout()                       │
│                                      │
│  2. Action Types:                    │
│     - 'auth/login'                   │
│     - 'auth/logout'                  │
│                                      │
│  3. Reducer Function:                │
│     - Handles all actions            │
│     - Uses Immer for immutability    │
└──────────────────────────────────────┘
```

#### Before vs After createSlice:

**Before (Traditional Redux):**

```javascript
// ❌ Banyak boilerplate
const LOGIN = "auth/login";
const LOGOUT = "auth/logout";

const loginAction = (user) => ({ type: LOGIN, payload: user });
const logoutAction = () => ({ type: LOGOUT });

function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return { ...state, user: action.payload };
    case LOGOUT:
      return { ...state, user: null };
    default:
      return state;
  }
}

export { loginAction, logoutAction, authReducer };
```

**After (Redux Toolkit):**

```javascript
// ✅ Less boilerplate
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
```

#### Contoh Lengkap Slice:

```javascript
import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // Immer allows direct mutation
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
});

// Export actions
export const { increment, decrement, incrementByAmount, reset } =
  counterSlice.actions;

// Export reducer
export default counterSlice.reducer;

// Usage:
// dispatch(increment())           → { type: 'counter/increment' }
// dispatch(decrement())           → { type: 'counter/decrement' }
// dispatch(incrementByAmount(5))  → { type: 'counter/incrementByAmount', payload: 5 }
```

---

### createSlice

**`createSlice`** adalah function dari Redux Toolkit yang secara otomatis menghasilkan action creators dan action types berdasarkan reducer functions yang kita definisikan.

#### Parameters createSlice:

```javascript
createSlice({
  name: string,           // Required: Nama slice
  initialState: any,      // Required: Initial state
  reducers: object,       // Required: Reducer functions
  extraReducers: function, // Optional: Untuk async thunks
})
```

#### Detail Parameters:

**1. name (Required)**

- String yang menjadi prefix untuk semua action types
- Contoh: `'auth'` → action types: `'auth/login'`, `'auth/logout'`

**2. initialState (Required)**

- State awal untuk slice ini
- Bisa berupa object, array, atau primitive value

**3. reducers (Required)**

- Object yang berisi reducer functions
- Setiap key menjadi action name
- Setiap value adalah reducer function

**4. extraReducers (Optional)**

- Function untuk handle async thunks atau external actions
- Menggunakan builder pattern

#### Immer Integration:

Redux Toolkit menggunakan **Immer** secara otomatis, jadi kita bisa "mutate" state langsung:

```javascript
// ✅ Dengan Immer (Redux Toolkit)
reducers: {
  addItem: (state, action) => {
    state.items.push(action.payload);  // Looks like mutation
    // Immer converts this to: { ...state, items: [...state.items, action.payload] }
  },
}

// ❌ Tanpa Immer (Traditional Redux)
function reducer(state, action) {
  return {
    ...state,
    items: [...state.items, action.payload]  // Must return new object
  };
}
```

#### Return Value createSlice:

```javascript
const slice = createSlice({ ... });

// slice.actions - Object berisi action creators
slice.actions.login
slice.actions.logout

// slice.reducer - Reducer function
slice.reducer

// slice.name - Nama slice
slice.name  // 'auth'

// slice.getInitialState() - Get initial state
slice.getInitialState()
```

---

### createAsyncThunk

**`createAsyncThunk`** adalah function untuk membuat async action creators yang handle async operations (API calls, timers, dll).

#### Signature:

```javascript
createAsyncThunk(typePrefix, payloadCreator, options?)
```

#### Parameters:

**1. typePrefix (String)**

- Prefix untuk action types yang di-generate
- Contoh: `'auth/login'` → generates:
  - `auth/login/pending`
  - `auth/login/fulfilled`
  - `auth/login/rejected`

**2. payloadCreator (Function)**

- Async function yang melakukan async operation
- Menerima arguments dan `thunkAPI` object
- Harus return promise

**3. options (Object, Optional)**

- Konfigurasi tambahan

#### Contoh createAsyncThunk:

```javascript
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMenus = createAsyncThunk(
  // 1. Type prefix
  "menu/fetchMenus",

  // 2. Payload creator (async function)
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/menu");
      return response.data; // Return sebagai action.payload
    } catch (error) {
      return rejectWithValue(error.message); // Return error
    }
  }
);
```

#### ThunkAPI Object:

Payload creator menerima `thunkAPI` sebagai parameter kedua:

```javascript
async (arg, thunkAPI) => {
  // thunkAPI.dispatch - Dispatch actions
  thunkAPI.dispatch(otherAction());

  // thunkAPI.getState - Get current state
  const state = thunkAPI.getState();

  // thunkAPI.rejectWithValue - Return custom error
  return thunkAPI.rejectWithValue("Custom error");

  // thunkAPI.fulfillWithValue - Return custom value
  return thunkAPI.fulfillWithValue("Custom value");

  // thunkAPI.requestId - Unique request ID
  console.log(thunkAPI.requestId);

  // thunkAPI.signal - AbortSignal untuk cancel request
  if (thunkAPI.signal.aborted) {
    return;
  }
};
```

#### Action Types yang Dihasilkan:

```javascript
// Pending - Saat request dimulai
{ type: 'menu/fetchMenus/pending', payload: undefined }

// Fulfilled - Saat request berhasil
{ type: 'menu/fetchMenus/fulfilled', payload: response.data }

// Rejected - Saat request gagal
{ type: 'menu/fetchMenus/rejected', payload: error, error: true }
```

#### Handling di Extra Reducers:

```javascript
extraReducers: (builder) => {
  builder
    .addCase(fetchMenus.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMenus.fulfilled, (state, action) => {
      state.loading = false;
      state.menus = action.payload; // Data dari return value
    })
    .addCase(fetchMenus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload; // Error dari rejectWithValue
    });
};
```

#### Menggunakan Async Thunk:

```javascript
// Di component
const dispatch = useDispatch();

// Dispatch async thunk
dispatch(fetchMenus());

// Handle promise dengan unwrap()
try {
  const menus = await dispatch(fetchMenus()).unwrap();
  console.log("Success:", menus);
} catch (error) {
  console.error("Error:", error);
}
```

#### Conditional Logic di Thunk:

```javascript
export const fetchMenuById = createAsyncThunk(
  "menu/fetchMenuById",
  async (menuId, { getState, rejectWithValue }) => {
    // Check state sebelum fetch
    const state = getState();
    const existingMenu = state.menu.menus.find((m) => m.id === menuId);

    if (existingMenu) {
      // Return existing data, skip API call
      return existingMenu;
    }

    // Fetch from API
    try {
      const response = await axios.get(`/api/menu/${menuId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

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
import { Provider } from "react-redux";
import { store } from "./store/store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
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
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import menuReducer from "./slices/menuSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";

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
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 1. Initial State
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

// 2. Create Slice
const authSlice = createSlice({
  name: "auth", // Nama slice (untuk DevTools)
  initialState,

  // 3. Synchronous Reducers
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const login = createAsyncThunk(
  "auth/login", // Action type prefix
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Save to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      return response.data; // Return sebagai action.payload
    } catch (error) {
      // Return error sebagai rejected value
      return rejectWithValue(error.response?.data?.message || "Login failed");
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
};
```

### Async Thunk Pattern yang Digunakan

Di project ini, setiap async thunk mengikuti pattern:

```javascript
export const fetchMenus = createAsyncThunk(
  "menu/fetchMenus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/menu`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch menus"
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
import { useDispatch } from "react-redux";
import { fetchMenus, addToCart } from "../store/slices/menuSlice";

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
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenus } from "../store/slices/menuSlice";
import { addToCart } from "../store/slices/cartSlice";

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
      alert("Please login first");
      return;
    }
    dispatch(addToCart({ menuId, quantity: 1 }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {menus.map((menu) => (
        <div key={menu.id}>
          <h3>{menu.name}</h3>
          <button onClick={() => handleAddToCart(menu.id)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
```

### 4. Handling Async Actions dengan unwrap()

Untuk handle promise dari async thunk:

```jsx
import { createOrder } from "../store/slices/orderSlice";

function Cart() {
  const dispatch = useDispatch();

  const handleCheckout = async () => {
    try {
      // unwrap() untuk get promise dari thunk
      await dispatch(createOrder(orderItems)).unwrap();
      // Success - order created
      navigate("/orders");
    } catch (error) {
      // Error handling
      alert("Failed to create order: " + error);
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
  state.menu.menus.find((m) => m.id === menuId);

// Usage
const menu = useSelector((state) => selectMenuById(state, menuId));
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
  alert(error.message || "Something went wrong");
}

// ❌ Bad
dispatch(createOrder(items)); // No error handling
```

### 4. Loading States

Selalu track loading states:

```javascript
// ✅ Good
const { loading } = useSelector((state) => state.order);
{
  loading && <Spinner />;
}

// ❌ Bad
// No loading indicator
```

### 5. Avoid Unnecessary Re-renders

Gunakan selector yang spesifik:

```javascript
// ✅ Good - Only re-render when menus change
const menus = useSelector((state) => state.menu.menus);

// ❌ Bad - Re-render on any state change
const state = useSelector((state) => state);
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
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

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
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || "info",
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
```

### Step 2: Tambahkan ke Store

```javascript
// store/store.js
import notificationReducer from "./slices/notificationSlice";

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
import { useSelector, useDispatch } from "react-redux";
import { removeNotification } from "../store/slices/notificationSlice";

function Notification() {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state) => state.notification.notifications
  );

  return (
    <div>
      {notifications.map((notif) => (
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
console.log("Current state:", store.getState());
```

### Problem 2: Re-render terlalu sering

**Solution:**

- Gunakan selector yang spesifik
- Gunakan `useMemo` untuk expensive computations
- Check apakah object/array reference berubah

```javascript
// ✅ Good
const menus = useSelector((state) => state.menu.menus);

// ❌ Bad - creates new object every time
const menuState = useSelector((state) => ({
  menus: state.menu.menus,
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
  console.error("Error:", error);
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
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
};
```

### Problem 5: Cannot read property of undefined

**Solution:**

- Pastikan state sudah di-initialize dengan benar
- Gunakan optional chaining
- Check initial state structure

```javascript
// ✅ Good
const user = useSelector((state) => state.auth?.user);

// ❌ Bad
const user = useSelector((state) => state.auth.user); // Might be undefined
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
