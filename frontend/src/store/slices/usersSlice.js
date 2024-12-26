import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      let url = '/api/users';
      const params = new URLSearchParams();
      
      if (filters.department) {
        params.append('department', filters.department);
      }
      if (filters.role) {
        params.append('role', filters.role);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/users/${userId}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Update user roles
export const updateUserRoles = createAsyncThunk(
  'users/updateUserRoles',
  async ({ userId, roles }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/users/${userId}/roles`, { roles });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Update user department
export const updateUserDepartment = createAsyncThunk(
  'users/updateUserDepartment',
  async ({ userId, department }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/users/${userId}/department`, { department });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
  filters: {
    department: '',
    role: ''
  }
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users cases
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch users';
      })
      
      // Update user cases
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update user';
      })
      
      // Update user roles cases
      .addCase(updateUserRoles.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      
      // Update user department cases
      .addCase(updateUserDepartment.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  }
});

export const { setFilters, clearFilters, clearError } = usersSlice.actions;

export default usersSlice.reducer;
