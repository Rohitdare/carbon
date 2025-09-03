import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OfflineData } from '../../types';
import { offlineService } from '../../services/offlineService';

interface OfflineState {
  offlineData: OfflineData[];
  isOnline: boolean;
  lastSyncTime: string | null;
  syncInProgress: boolean;
  error: string | null;
}

const initialState: OfflineState = {
  offlineData: [],
  isOnline: true,
  lastSyncTime: null,
  syncInProgress: false,
  error: null,
};

// Async thunks
export const syncOfflineData = createAsyncThunk(
  'offline/syncOfflineData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await offlineService.syncAllOfflineData();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync offline data');
    }
  }
);

export const addOfflineData = createAsyncThunk(
  'offline/addOfflineData',
  async (data: { type: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await offlineService.addOfflineData(data.type, data.data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add offline data');
    }
  }
);

export const removeOfflineData = createAsyncThunk(
  'offline/removeOfflineData',
  async (dataId: string, { rejectWithValue }) => {
    try {
      await offlineService.removeOfflineData(dataId);
      return dataId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove offline data');
    }
  }
);

export const retryOfflineData = createAsyncThunk(
  'offline/retryOfflineData',
  async (dataId: string, { rejectWithValue }) => {
    try {
      const response = await offlineService.retryOfflineData(dataId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to retry offline data');
    }
  }
);

export const clearOfflineData = createAsyncThunk(
  'offline/clearOfflineData',
  async (_, { rejectWithValue }) => {
    try {
      await offlineService.clearOfflineData();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear offline data');
    }
  }
);

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
    updateOfflineData: (state, action: PayloadAction<OfflineData>) => {
      const index = state.offlineData.findIndex(data => data.id === action.payload.id);
      if (index !== -1) {
        state.offlineData[index] = action.payload;
      }
    },
    incrementRetryCount: (state, action: PayloadAction<string>) => {
      const index = state.offlineData.findIndex(data => data.id === action.payload);
      if (index !== -1) {
        state.offlineData[index].retryCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Sync Offline Data
      .addCase(syncOfflineData.pending, (state) => {
        state.syncInProgress = true;
        state.error = null;
      })
      .addCase(syncOfflineData.fulfilled, (state, action) => {
        state.syncInProgress = false;
        state.offlineData = state.offlineData.filter(data => !action.payload.includes(data.id));
        state.lastSyncTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(syncOfflineData.rejected, (state, action) => {
        state.syncInProgress = false;
        state.error = action.payload as string;
      })
      // Add Offline Data
      .addCase(addOfflineData.pending, (state) => {
        state.error = null;
      })
      .addCase(addOfflineData.fulfilled, (state, action) => {
        state.offlineData.push(action.payload);
        state.error = null;
      })
      .addCase(addOfflineData.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Remove Offline Data
      .addCase(removeOfflineData.pending, (state) => {
        state.error = null;
      })
      .addCase(removeOfflineData.fulfilled, (state, action) => {
        state.offlineData = state.offlineData.filter(data => data.id !== action.payload);
        state.error = null;
      })
      .addCase(removeOfflineData.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Retry Offline Data
      .addCase(retryOfflineData.pending, (state) => {
        state.error = null;
      })
      .addCase(retryOfflineData.fulfilled, (state, action) => {
        const index = state.offlineData.findIndex(data => data.id === action.payload.id);
        if (index !== -1) {
          state.offlineData[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(retryOfflineData.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Clear Offline Data
      .addCase(clearOfflineData.pending, (state) => {
        state.error = null;
      })
      .addCase(clearOfflineData.fulfilled, (state) => {
        state.offlineData = [];
        state.error = null;
      })
      .addCase(clearOfflineData.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setOnlineStatus,
  clearError,
  setLastSyncTime,
  updateOfflineData,
  incrementRetryCount,
} = offlineSlice.actions;

export default offlineSlice.reducer;

