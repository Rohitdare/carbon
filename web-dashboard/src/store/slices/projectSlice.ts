import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectStats, PaginatedResponse, SearchParams } from '@/types';
import { ProjectService } from '@/services/projectService';

// Initial state
interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  projectStats: ProjectStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  filters: SearchParams;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  projectStats: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params?: SearchParams, { rejectWithValue }) => {
    try {
      const response = await ProjectService.getProjects(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const fetchProject = createAsyncThunk(
  'projects/fetchProject',
  async (id: string, { rejectWithValue }) => {
    try {
      const project = await ProjectService.getProject(id);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const project = await ProjectService.createProject(projectData);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }: { id: string; projectData: Partial<Project> }, { rejectWithValue }) => {
    try {
      const project = await ProjectService.updateProject(id, projectData);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await ProjectService.deleteProject(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

export const fetchProjectStats = createAsyncThunk(
  'projects/fetchProjectStats',
  async (id: string, { rejectWithValue }) => {
    try {
      const stats = await ProjectService.getProjectStats(id);
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project stats');
    }
  }
);

export const fetchAllProjectStats = createAsyncThunk(
  'projects/fetchAllProjectStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await ProjectService.getAllProjectStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project stats');
    }
  }
);

export const searchProjects = createAsyncThunk(
  'projects/searchProjects',
  async ({ query, filters }: { query: string; filters?: any }, { rejectWithValue }) => {
    try {
      const projects = await ProjectService.searchProjects(query, filters);
      return projects;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search projects');
    }
  }
);

// Project slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<SearchParams>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch project
    builder
      .addCase(fetchProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create project
    builder
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update project
    builder
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch project stats
    builder
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        const index = state.projectStats.findIndex(s => s.projectId === action.payload.projectId);
        if (index !== -1) {
          state.projectStats[index] = action.payload;
        } else {
          state.projectStats.push(action.payload);
        }
      });

    // Fetch all project stats
    builder
      .addCase(fetchAllProjectStats.fulfilled, (state, action) => {
        state.projectStats = action.payload;
      });

    // Search projects
    builder
      .addCase(searchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(searchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, setCurrentProject, clearError, setLoading } = projectSlice.actions;
export default projectSlice.reducer;

