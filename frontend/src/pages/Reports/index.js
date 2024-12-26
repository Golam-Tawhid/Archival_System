import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip
} from '@mui/material';
import {
  Description as ReportIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fetchReports, generateReport, downloadReport, deleteReport } from '../../store/slices/reportsSlice';

const reportTemplates = [
  {
    id: 'task_summary',
    name: 'Task Summary Report',
    description: 'Overview of all tasks with their current status and completion rates',
    icon: <ReportIcon />
  },
  {
    id: 'department_performance',
    name: 'Department Performance Report',
    description: 'Detailed analysis of task completion and efficiency by department',
    icon: <ReportIcon />
  },
  {
    id: 'user_activity',
    name: 'User Activity Report',
    description: 'Track user contributions and task management patterns',
    icon: <ReportIcon />
  },
  {
    id: 'archive_summary',
    name: 'Archive Summary Report',
    description: 'Summary of archived tasks and historical data',
    icon: <ReportIcon />
  }
];

function Reports() {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.reports);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [reportParams, setReportParams] = useState({
    startDate: null,
    endDate: null,
    department: user?.department || '',
    format: 'pdf'
  });

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;

    try {
      await dispatch(generateReport({
        template: selectedTemplate.id,
        params: reportParams
      })).unwrap();
      setGenerateDialog(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const handleDownload = async (reportId, format) => {
    try {
      await dispatch(downloadReport({ reportId, format })).unwrap();
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await dispatch(deleteReport(reportId)).unwrap();
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setGenerateDialog(true);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Reports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Report Templates
            </Typography>
            <List>
              {reportTemplates.map((template) => (
                <ListItem
                  key={template.id}
                  button
                  onClick={() => handleTemplateSelect(template)}
                >
                  <ListItemText
                    primary={template.name}
                    secondary={template.description}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Generated Reports
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {reports.map((report) => (
                  <ListItem
                    key={report._id}
                    sx={{
                      mb: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <ListItemText
                      primary={report.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Generated: {new Date(report.created_at).toLocaleString()}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={report.template}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={report.department || 'All Departments'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleDownload(report._id, 'pdf')}
                        title="Download PDF"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(report._id)}
                        title="Delete Report"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {reports.length === 0 && (
                  <Typography color="text.secondary" align="center">
                    No reports generated yet
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={generateDialog}
        onClose={() => setGenerateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate {selectedTemplate?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={reportParams.startDate}
                  onChange={(newValue) => setReportParams(prev => ({
                    ...prev,
                    startDate: newValue
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={reportParams.endDate}
                  onChange={(newValue) => setReportParams(prev => ({
                    ...prev,
                    endDate: newValue
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Format"
                  value={reportParams.format}
                  onChange={(e) => setReportParams(prev => ({
                    ...prev,
                    format: e.target.value
                  }))}
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            startIcon={<PrintIcon />}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Reports;
