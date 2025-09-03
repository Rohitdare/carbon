import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FieldData, FieldDataForm } from '../../types';
import { fieldDataService } from '../../services/fieldDataService';

interface FieldDataState {
  fieldData: FieldData[];
  currentFieldData: FieldData | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  offlineData: FieldData[];
}

const initialState: FieldDataState = {
  fieldData: [],
  currentFieldData: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  offlineData: [],
};

// Async thunks
export const fetchFieldData = createAsyncThunk(
  'fieldData/fetchFieldData',
  async (params: { projectId?: string; page?: number; limit?: number; type?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await fieldDataService.getFieldData(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch field data');
    }
  }
);

export const fetchFieldDataById = createAsyncThunk(
  'fieldData/fetchFieldDataById',
  async (dataId: string, { rejectWithValue }) => {
    try {
      const response = await fieldDataService.getFieldDataById(dataId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch field data');
    }
  }
);

export const createFieldData = createAsyncThunk(
  'fieldData/createFieldData',
  async (fieldData: FieldDataForm & { projectId: string }, { rejectWithValue }) => {
    try {
      const response = await fieldDataService.createFieldData(fieldData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create field data');
    }
  }
);

export const updateFieldData = createAsyncThunk(
  'fieldData/updateFieldData',
  async ({ dataId, fieldData }: { dataId: string; fieldData: Partial<FieldDataForm> }, { rejectWithValue }) => {
    try {
      const response = await fieldDataService.updateFieldData(dataId, fieldData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update field data');
    }
  }
);

export const deleteFieldData = createAsyncThunk(
  'fieldData/deleteFieldData',
  async (dataId: string, { rejectWithValue }) => {
    try {
      await fieldDataService.deleteFieldData(dataId);
      return dataId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete field data');
    }
  }
);

export const uploadFieldData = createAsyncThunk(
  'fieldData/uploadFieldData',
  async (dataId: string, { rejectWithValue }) => {
    try {
      const response = await fieldDataService.uploadFieldData(dataId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload field data');
    }
  }
);

export const syncOfflineData = createAsyncThunk(
  'fieldData/syncOfflineData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fieldDataService.syncOfflineData();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync offline data');
    }
  }
);

const fieldDataSlice = createSlice({
  name: 'fieldData',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentFieldData: (state, action: PayloadAction<FieldData | null>) => {
      state.currentFieldData = action.payload;
    },
    clearFieldData: (state) => {
      state.fieldData = [];
      state.currentFieldData = null;
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    },
    addOfflineData: (state, action: PayloadAction<FieldData>) => {
      state.offlineData.push(action.payload);
    },
    removeOfflineData: (state, action: PayloadAction<string>) => {
      state.offlineData = state.offlineData.filter(data => data.id !== action.payload);
    },
    updateFieldDataInList: (state, action: PayloadAction<FieldData>) => {
      const index = state.fieldData.findIndex(data => data.id === action.payload.id);
      if (index !== -1) {
        state.fieldData[index] = action.payload;
      }
      if (state.currentFieldData?.id === action.payload.id) {
        state.currentFieldData = action.payload;
      }
    },
    removeFieldDataFromList: (state, action: PayloadAction<string>) => {
      state.fieldData = state.fieldData.filter(data => data.id !== action.payload);
      if (state.currentFieldData?.id === action.payload) {
        state.currentFieldData = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Field Data
      .addCase(fetchFieldData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFieldData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fieldData = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchFieldData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Field Data by ID
      .addCase(fetchFieldDataById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFieldDataById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFieldData = action.payload;
        state.error = null;
      })
      .addCase(fetchFieldDataById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Field Data
      .addCase(createFieldData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFieldData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fieldData.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createFieldData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Field Data
      .addCase(updateFieldData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFieldData.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.fieldData.findIndex(data => data.id === action.payload.id);
        if (index !== -1) {
          state.fieldData[index] = action.payload;
        }
        if (state.currentFieldData?.id === action.payload.id) {
          state.currentFieldData = action.payload;
        }
        state.error = null;
      })
      .addCase(updateFieldData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Field Data
      .addCase(deleteFieldData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFieldData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fieldData = state.fieldData.filter(data => data.id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentFieldData?.id === action.payload) {
          state.currentFieldData = null;
        }
        state.error = null;
      })
      .addCase(deleteFieldData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload Field Data
      .addCase(uploadFieldData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadFieldData.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.fieldData.findIndex(data => data.id === action.payload.id);
        if (index !== -1) {
          state.fieldData[index] = action.payload;
        }
        if (state.currentFieldData?.id === action.payload.id) {
          state.currentFieldData = action.payload;
        }
        state.error = null;
      })
      .addCase(uploadFieldData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Sync Offline Data
      .addCase(syncOfflineData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncOfflineData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.offlineData = [];
        state.error = null;
      })
      .addCase(syncOfflineData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentFieldData,
  clearFieldData,
  addOfflineData,
  removeOfflineData,
  updateFieldDataInList,
  removeFieldDataFromList,
} = fieldDataSlice.actions;

export default fieldDataSlice.reducer;

