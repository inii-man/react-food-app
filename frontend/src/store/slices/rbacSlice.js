import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Async thunks
export const fetchRoles = createAsyncThunk(
  'rbac/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/rbac/roles');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
    }
  }
);

export const fetchRoleById = createAsyncThunk(
  'rbac/fetchRoleById',
  async (roleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/rbac/roles/${roleId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch role');
    }
  }
);

export const fetchPermissions = createAsyncThunk(
  'rbac/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/rbac/permissions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
    }
  }
);

export const updateRolePermissions = createAsyncThunk(
  'rbac/updateRolePermissions',
  async ({ roleId, permissionNames }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/rbac/roles/${roleId}/permissions`, {
        permissionNames
      });
      return { roleId, permissionNames, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update role permissions');
    }
  }
);

export const assignRoleToUser = createAsyncThunk(
  'rbac/assignRoleToUser',
  async ({ userId, roleName }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/rbac/users/${userId}/roles`, {
        roleName
      });
      return { userId, roleName, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign role');
    }
  }
);

export const givePermissionToUser = createAsyncThunk(
  'rbac/givePermissionToUser',
  async ({ userId, permissionName }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/rbac/users/${userId}/permissions`, {
        permissionName
      });
      return { userId, permissionName, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to give permission');
    }
  }
);

const initialState = {
  roles: [],
  permissions: [],
  currentRole: null,
  loading: false,
  error: null,
};

const rbacSlice = createSlice({
  name: 'rbac',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRole: (state, action) => {
      state.currentRole = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Role By ID
      .addCase(fetchRoleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRole = action.payload;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Role Permissions
      .addCase(updateRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        // Update role in roles array
        const roleIndex = state.roles.findIndex(r => r.id === action.payload.roleId);
        if (roleIndex !== -1) {
          // Reload role data
          state.roles[roleIndex] = { ...state.roles[roleIndex], permissions: action.payload.permissionNames };
        }
        // Update current role if it's the same
        if (state.currentRole && state.currentRole.id === action.payload.roleId) {
          state.currentRole = { ...state.currentRole, permissions: action.payload.permissionNames };
        }
      })
      .addCase(updateRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentRole } = rbacSlice.actions;
export default rbacSlice.reducer;

