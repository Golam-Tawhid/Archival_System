import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import usersReducer from './slices/usersSlice';
import reportsReducer from './slices/reportsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    users: usersReducer,
    reports: reportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/loginSuccess', 'auth/refreshToken'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'payload.due_date'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.created_at', 'tasks.items.due_date'],
      },
    }),
});

export default store;
