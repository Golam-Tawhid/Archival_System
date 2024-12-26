import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Save as SaveIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  CalendarMonth as CalendarIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Business as DepartmentIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { updateProfile, updatePassword } from '../../store/slices/authSlice';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name should be of minimum 2 characters length'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

function Profile() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      notificationPreferences: user?.notificationPreferences || {
        email: true,
        inApp: true
      }
    },
    enableReinitialize: true, // Add this to update form when user data changes
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(updateProfile(values)).unwrap();
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Failed to update profile:', err);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(updatePassword(values)).unwrap();
        setChangePasswordDialog(false);
        setSuccessMessage('Password updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        passwordFormik.resetForm();
      } catch (err) {
        console.error('Failed to update password:', err);
      }
    },
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Failed to load profile data</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Profile Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                margin: '0 auto 16px',
                bgcolor: 'primary.main'
              }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {user?.name}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {user?.email}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {user?.roles?.map((role) => (
                <Chip
                  key={role}
                  label={role.replace('_', ' ').toUpperCase()}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
            <List sx={{ mt: 2, textAlign: 'left' }}>
              <ListItem>
                <ListItemIcon>
                  <DepartmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Department"
                  secondary={user?.department}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BadgeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Employee ID"
                  secondary={user?._id}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Joined"
                  secondary={new Date(user?.created_at).toLocaleDateString()}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setChangePasswordDialog(true)}
                  >
                    Change Password
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive task updates and reminders via email"
                />
                <Button
                  variant={formik.values.notificationPreferences?.email ? "contained" : "outlined"}
                  onClick={() => formik.setFieldValue('notificationPreferences.email', 
                    !formik.values.notificationPreferences?.email)}
                >
                  {formik.values.notificationPreferences?.email ? 'Enabled' : 'Disabled'}
                </Button>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="In-App Notifications"
                  secondary="Receive notifications within the application"
                />
                <Button
                  variant={formik.values.notificationPreferences?.inApp ? "contained" : "outlined"}
                  onClick={() => formik.setFieldValue('notificationPreferences.inApp',
                    !formik.values.notificationPreferences?.inApp)}
                >
                  {formik.values.notificationPreferences?.inApp ? 'Enabled' : 'Disabled'}
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={changePasswordDialog}
        onClose={() => setChangePasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={passwordFormik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  label="Current Password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                  helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  label="New Password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm New Password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePasswordDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Update Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Profile;
