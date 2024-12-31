import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch tasks based on filters
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (filters = {}, { rejectWithValue }) => {
    try {
      let url = "/api/tasks";

      if (filters.department && filters.department !== "") {
        url = `/api/tasks/department/${filters.department}`;
      } else if (filters.status) {
        url = `/api/tasks/status/${filters.status}`;
      }

      const response = await axios.get(url || "/api/tasks"); // Fetch all tasks if no filters are applied
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Create new task
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/tasks", taskData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ taskId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Approve task
export const approveTask = createAsyncThunk(
  "tasks/approveTask",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/tasks/${taskId}/approve`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Archive task
export const archiveTask = createAsyncThunk(
  "tasks/archiveTask",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/tasks/${taskId}/archive`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Search tasks
export const searchTasks = createAsyncThunk(
  "tasks/searchTasks",
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/tasks/search", searchParams);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const initialState = {
  items: [],
  currentTask: null,
  loading: false,
  error: null,
  filters: {
    department: null,
    status: null,
    searchTerm: "",
    dateRange: null,
  },
};

const tasksSlice = createSlice({
  name: "tasks",
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
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks cases
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to fetch tasks";
      })

      // Create task cases
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to create task";
      })

      // Update task cases
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to update task";
      })

      // Approve task cases
      .addCase(approveTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })

      // Archive task cases
      .addCase(archiveTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })

      // Search tasks cases
      .addCase(searchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(searchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to search tasks";
      });
  },
});

export const { setFilters, clearFilters, clearError } = tasksSlice.actions;

export default tasksSlice.reducer;
