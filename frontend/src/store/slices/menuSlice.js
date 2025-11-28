import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Async thunks
export const fetchMenus = createAsyncThunk(
  'menu/fetchMenus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/menu`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menus');
    }
  }
);

export const fetchMenuById = createAsyncThunk(
  'menu/fetchMenuById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/menu/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu');
    }
  }
);

export const createMenu = createAsyncThunk(
  'menu/createMenu',
  async (menuData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/menu`, menuData, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create menu');
    }
  }
);

export const updateMenu = createAsyncThunk(
  'menu/updateMenu',
  async ({ id, ...menuData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/menu/${id}`, menuData, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update menu');
    }
  }
);

export const deleteMenu = createAsyncThunk(
  'menu/deleteMenu',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/menu/${id}`, getAuthHeaders());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete menu');
    }
  }
);

const initialState = {
  menus: [],
  currentMenu: null,
  loading: false,
  error: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearCurrentMenu: (state) => {
      state.currentMenu = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = action.payload;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMenuById.fulfilled, (state, action) => {
        state.currentMenu = action.payload;
      })
      .addCase(createMenu.fulfilled, (state, action) => {
        state.menus.push(action.payload);
      })
      .addCase(updateMenu.fulfilled, (state, action) => {
        const index = state.menus.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.menus[index] = action.payload;
        }
      })
      .addCase(deleteMenu.fulfilled, (state, action) => {
        state.menus = state.menus.filter((m) => m.id !== action.payload);
      });
  },
});

export const { clearCurrentMenu, clearError } = menuSlice.actions;
export default menuSlice.reducer;

