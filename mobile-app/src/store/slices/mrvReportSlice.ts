import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MRVReport, MRVReportForm } from '../../types';
import { mrvReportService } from '../../services/mrvReportService';

interface MRVReportState {
  reports: MRVReport[];
  currentReport: MRVReport | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: MRVReportState = {
  reports: [],
  currentReport: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchMRVReports = createAsyncThunk(
  'mrvReports/fetchMRVReports',
  async (params: { projectId?: string; page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await mrvReportService.getMRVReports(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch MRV reports');
    }
  }
);

export const fetchMRVReportById = createAsyncThunk(
  'mrvReports/fetchMRVReportById',
  async (reportId: string, { rejectWithValue }) => {
    try {
      const response = await mrvReportService.getMRVReportById(reportId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch MRV report');
    }
  }
);

export const createMRVReport = createAsyncThunk(
  'mrvReports/createMRVReport',
  async (reportData: MRVReportForm & { projectId: string }, { rejectWithValue }) => {
    try {
      const response = await mrvReportService.createMRVReport(reportData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create MRV report');
    }
  }
);

export const updateMRVReport = createAsyncThunk(
  'mrvReports/updateMRVReport',
  async ({ reportId, reportData }: { reportId: string; reportData: Partial<MRVReportForm> }, { rejectWithValue }) => {
    try {
      const response = await mrvReportService.updateMRVReport(reportId, reportData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update MRV report');
    }
  }
);

export const deleteMRVReport = createAsyncThunk(
  'mrvReports/deleteMRVReport',
  async (reportId: string, { rejectWithValue }) => {
    try {
      await mrvReportService.deleteMRVReport(reportId);
      return reportId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete MRV report');
    }
  }
);

export const submitMRVReport = createAsyncThunk(
  'mrvReports/submitMRVReport',
  async (reportId: string, { rejectWithValue }) => {
    try {
      const response = await mrvReportService.submitMRVReport(reportId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit MRV report');
    }
  }
);

export const reviewMRVReport = createAsyncThunk(
  'mrvReports/reviewMRVReport',
  async ({ reportId, status, comments }: { reportId: string; status: string; comments?: string }, { rejectWithValue }) => {
    try {
      const response = await mrvReportService.reviewMRVReport(reportId, status, comments);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to review MRV report');
    }
  }
);

const mrvReportSlice = createSlice({
  name: 'mrvReports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReport: (state, action: PayloadAction<MRVReport | null>) => {
      state.currentReport = action.payload;
    },
    clearReports: (state) => {
      state.reports = [];
      state.currentReport = null;
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    },
    updateReportInList: (state, action: PayloadAction<MRVReport>) => {
      const index = state.reports.findIndex(report => report.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
      if (state.currentReport?.id === action.payload.id) {
        state.currentReport = action.payload;
      }
    },
    removeReportFromList: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(report => report.id !== action.payload);
      if (state.currentReport?.id === action.payload) {
        state.currentReport = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch MRV Reports
      .addCase(fetchMRVReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMRVReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchMRVReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch MRV Report by ID
      .addCase(fetchMRVReportById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMRVReportById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReport = action.payload;
        state.error = null;
      })
      .addCase(fetchMRVReportById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create MRV Report
      .addCase(createMRVReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMRVReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createMRVReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update MRV Report
      .addCase(updateMRVReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMRVReport.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reports.findIndex(report => report.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload;
        }
        state.error = null;
      })
      .addCase(updateMRVReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete MRV Report
      .addCase(deleteMRVReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMRVReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = state.reports.filter(report => report.id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentReport?.id === action.payload) {
          state.currentReport = null;
        }
        state.error = null;
      })
      .addCase(deleteMRVReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Submit MRV Report
      .addCase(submitMRVReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitMRVReport.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reports.findIndex(report => report.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload;
        }
        state.error = null;
      })
      .addCase(submitMRVReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Review MRV Report
      .addCase(reviewMRVReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reviewMRVReport.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reports.findIndex(report => report.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload;
        }
        state.error = null;
      })
      .addCase(reviewMRVReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentReport,
  clearReports,
  updateReportInList,
  removeReportFromList,
} = mrvReportSlice.actions;

export default mrvReportSlice.reducer;

