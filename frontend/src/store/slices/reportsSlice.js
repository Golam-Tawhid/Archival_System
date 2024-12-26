import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch reports
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/reports');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Generate report
export const generateReport = createAsyncThunk(
  'reports/generateReport',
  async ({ template, params }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/reports/generate', {
        template,
        ...params
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Download report
export const downloadReport = createAsyncThunk(
  'reports/downloadReport',
  async ({ reportId, format }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/reports/${reportId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return reportId;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Delete report
export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (reportId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/reports/${reportId}`);
      return reportId;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Get report templates
export const getReportTemplates = createAsyncThunk(
  'reports/getReportTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/reports/templates');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const initialState = {
  reports: [],
  templates: [],
  loading: false,
  error: null,
  currentReport: null,
  generatingReport: false,
  downloadingReport: false
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReport: (state, action) => {
      state.currentReport = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports cases
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch reports';
      })
      
      // Generate report cases
      .addCase(generateReport.pending, (state) => {
        state.generatingReport = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generatingReport = false;
        state.reports.unshift(action.payload);
        state.currentReport = action.payload;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generatingReport = false;
        state.error = action.payload?.error || 'Failed to generate report';
      })
      
      // Download report cases
      .addCase(downloadReport.pending, (state) => {
        state.downloadingReport = true;
      })
      .addCase(downloadReport.fulfilled, (state) => {
        state.downloadingReport = false;
      })
      .addCase(downloadReport.rejected, (state, action) => {
        state.downloadingReport = false;
        state.error = action.payload?.error || 'Failed to download report';
      })
      
      // Delete report cases
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter(report => report._id !== action.payload);
        if (state.currentReport?._id === action.payload) {
          state.currentReport = null;
        }
      })
      
      // Get report templates cases
      .addCase(getReportTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReportTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(getReportTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch report templates';
      });
  }
});

export const { clearError, setCurrentReport } = reportsSlice.actions;

export default reportsSlice.reducer;
