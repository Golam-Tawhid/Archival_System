import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { fetchUsers, updateUser, deleteUser } from '../../store/slices/usersSlice';

const departments = [
  { value: 'CSE', label: 'Computer Science and Engineering' },
  { value: 'ECE', label: 'Electronics and Communication Engineering' },
  { value: 'ME', label: 'Mechanical Engineering' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'ADMIN', label: 'Administration' }
];

const roles = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'department_head', label: 'Department Head' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'staff', label: 'Staff' }
];

function UserManagement() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({
    open: false,
    user: null
  });
  const [filters, setFilters] = useState({
    department: '',
    role: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers(filters));
  }, [dispatch, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditUser = (user) => {
    setEditDialog({
      open: true,
      user: { ...user }
    });
  };

  const handleCloseEdit = () => {
    setEditDialog({
      open: false,
      user: null
    });
  };

  const handleSaveEdit = async () => {
    try {
      await dispatch(updateUser({
        userId: editDialog.user._id,
        data: editDialog.user
      })).unwrap();
      handleCloseEdit();
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditDialog(prev => ({
      ...prev,
      user: {
        ...prev.user,
        [name]: value
      }
    }));
  };

  const handleRolesChange = (event) => {
    const { value } = event.target;
    setEditDialog(prev => ({
      ...prev,
      user: {
        ...prev.user,
        roles: value
      }
    }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const canEditUser = (userToEdit) => {
    if (currentUser.roles.includes('super_admin')) return true;
    if (currentUser.roles.includes('admin')) {
      return !userToEdit.roles.includes('super_admin');
    }
    return false;
  };

  const canEditRoles = (userToEdit) => {
    return currentUser.roles.includes('super_admin') ||
           (currentUser.roles.includes('admin') && !userToEdit.roles.includes('super_admin'));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Box>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 2 }}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => {/* Handle new user */}}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Department"
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Role"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      {user.roles.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          size="small"
                          sx={{ mr: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        color={user.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {canEditUser(user) && (
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={users.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      <Dialog
        open={editDialog.open}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={editDialog.user?.name || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editDialog.user?.email || ''}
                  onChange={handleInputChange}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  name="department"
                  value={editDialog.user?.department || ''}
                  onChange={handleInputChange}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {canEditRoles(editDialog.user) && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Roles</InputLabel>
                    <Select
                      multiple
                      value={editDialog.user?.roles || []}
                      onChange={handleRolesChange}
                      input={<OutlinedInput label="Roles" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {roles.map((role) => (
                        <MenuItem
                          key={role.value}
                          value={role.value}
                          disabled={
                            role.value === 'super_admin' &&
                            !currentUser.roles.includes('super_admin')
                          }
                        >
                          <Checkbox checked={editDialog.user?.roles.includes(role.value)} />
                          <ListItemText primary={role.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;
