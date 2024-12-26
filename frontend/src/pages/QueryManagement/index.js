import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { searchTasks } from '../../store/slices/tasksSlice';
import { generateReport } from '../../store/slices/reportsSlice';

const departments = [
  { value: 'CSE', label: 'Computer Science and Engineering' },
  { value: 'ECE', label: 'Electronics and Communication Engineering' },
  { value: 'ME', label: 'Mechanical Engineering' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'ADMIN', label: 'Administration' }
];

const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived' }
];

const reportTemplates = [
  { id: 'task_summary', name: 'Task Summary Report' },
  { id: 'department_performance', name: 'Department Performance Report' },
  { id: 'user_activity', name: 'User Activity Report' },
  { id: 'archive_summary', name: 'Archive Summary Report' }
];

function QueryManagement() {
  const dispatch = useDispatch();
  const { items: tasks, loading } = useSelector((state) => state.tasks);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  const [filters, setFilters] = useState({
    title: '',
    department: '',
    status: '',
    startDate: null,
    endDate: null,
    tags: '',
    priority: ''
  });

  const [activeFilters, setActiveFilters] = useState([]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    const activeFiltersList = Object.entries(filters)
      .filter(([_, value]) => value && value !== '')
      .map(([key, value]) => ({
        key,
        value: value instanceof Date ? value.toLocaleDateString() : value
      }));
    
    setActiveFilters(activeFiltersList);
    
    dispatch(searchTasks({
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      tags: filters.tags.split(',').map(tag => tag.trim())
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      title: '',
      department: '',
      status: '',
      startDate: null,
      endDate: null,
      tags: '',
      priority: ''
    });
    setActiveFilters([]);
  };

  const handleRemoveFilter = (filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: ''
    }));
    setActiveFilters(prev => prev.filter(filter => filter.key !== filterKey));
  };

  const handlePrint = () => {
    setPrintDialogOpen(true);
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;

    try {
      await dispatch(generateReport({
        template: selectedTemplate,
        filters: {
          ...filters,
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString()
        }
      })).unwrap();
      setPrintDialogOpen(false);
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Query Management
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" component="div">
              Search Filters
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Title Contains"
                  name="title"
                  value={filters.title}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tags (comma-separated)"
                  name="tags"
                  value={filters.tags}
                  onChange={handleFilterChange}
                  helperText="Enter tags separated by commas"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(newValue) => handleDateChange('startDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(newValue) => handleDateChange('endDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                  >
                    Generate Report
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {activeFilters.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {activeFilters.map((filter) => (
              <Chip
                key={filter.key}
                label={`${filter.key}: ${filter.value}`}
                onDelete={() => handleRemoveFilter(filter.key)}
              />
            ))}
          </Box>
        )}
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Priority</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.department}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        color={
                          task.status === 'done' ? 'success' :
                          task.status === 'in_progress' ? 'primary' :
                          task.status === 'pending_approval' ? 'warning' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(task.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{task.priority}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={tasks.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
      >
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Report Template</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              label="Report Template"
            >
              {reportTemplates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            disabled={!selectedTemplate}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default QueryManagement;
