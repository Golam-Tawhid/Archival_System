import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { createTask } from '../../store/slices/tasksSlice';

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title should be at least 3 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description should be at least 10 characters'),
  department: Yup.string()
    .required('Department is required'),
  priority: Yup.string()
    .required('Priority is required'),
  due_date: Yup.date()
    .min(new Date(), 'Due date cannot be in the past')
    .required('Due date is required')
});

const departments = [
  { value: 'CSE', label: 'Computer Science and Engineering' },
  { value: 'ECE', label: 'Electronics and Communication Engineering' },
  { value: 'ME', label: 'Mechanical Engineering' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'ADMIN', label: 'Administration' }
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

function CreateTask() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [files, setFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      department: user?.department || '',
      priority: 'medium',
      due_date: '',
      tags: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'tags') {
          formData.append(key, values[key].split(',').map(tag => tag.trim()));
        } else {
          formData.append(key, values[key]);
        }
      });
      
      files.forEach(file => {
        formData.append('attachments', file);
      });

      try {
        await dispatch(createTask(formData)).unwrap();
        navigate('/tasks');
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    },
  });

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = newFiles.filter(file => file.size > maxSize);

    if (invalidFiles.length > 0) {
      setUploadError('Some files exceed the 5MB size limit');
      return;
    }

    setFiles([...files, ...newFiles]);
    setUploadError(null);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleBack = () => {
    navigate('/tasks');
  };

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Tasks
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
          Create New Task
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Task Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                id="description"
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                id="department"
                name="department"
                label="Department"
                value={formik.values.department}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.department && Boolean(formik.errors.department)}
                helperText={formik.touched.department && formik.errors.department}
              >
                {departments.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                id="priority"
                name="priority"
                label="Priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.priority && Boolean(formik.errors.priority)}
                helperText={formik.touched.priority && formik.errors.priority}
              >
                {priorities.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                id="due_date"
                name="due_date"
                label="Due Date"
                value={formik.values.due_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.due_date && Boolean(formik.errors.due_date)}
                helperText={formik.touched.due_date && formik.errors.due_date}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="tags"
                name="tags"
                label="Tags (comma-separated)"
                value={formik.values.tags}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText="Enter tags separated by commas"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                sx={{ mr: 2 }}
              >
                Upload Attachments
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
              </Button>

              {uploadError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {uploadError}
                </Alert>
              )}

              {files.length > 0 && (
                <List>
                  {files.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Task'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleBack}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default CreateTask;
