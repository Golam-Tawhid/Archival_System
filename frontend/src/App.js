import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import axios from 'axios';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import CreateTask from './pages/CreateTask';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import QueryManagement from './pages/QueryManagement';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Set the auth token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      dispatch(loadUser());
    }
  }, [dispatch]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/login" element={
            !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
          } />
          <Route path="/register" element={
            !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
          } />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/tasks" element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            } />
            
            <Route path="/tasks/create" element={
              <PrivateRoute>
                <CreateTask />
              </PrivateRoute>
            } />
            
            <Route path="/tasks/:taskId" element={
              <PrivateRoute>
                <TaskDetails />
              </PrivateRoute>
            } />
            
            <Route path="/reports" element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            } />
            
            <Route path="/users" element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            <Route path="/query" element={
              <PrivateRoute>
                <QueryManagement />
              </PrivateRoute>
            } />
          </Route>
        </Routes>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
