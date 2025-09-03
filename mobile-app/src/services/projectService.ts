import { apiService } from './api';
import { Project, ApiResponse, PaginatedResponse } from '../types';

class ProjectService {
  async getProjects(params: {
    page?: number;
    limit?: number;
    status?: string;
    ecosystemType?: string;
  } = {}): Promise<PaginatedResponse<Project>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<Project>>>(
      '/projects',
      { params }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch projects');
    }
  }

  async getProjectById(projectId: string): Promise<Project> {
    const response = await apiService.get<ApiResponse<Project>>(`/projects/${projectId}`);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch project');
    }
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await apiService.post<ApiResponse<Project>>('/projects', projectData);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create project');
    }
  }

  async updateProject(projectId: string, projectData: Partial<Project>): Promise<Project> {
    const response = await apiService.put<ApiResponse<Project>>(
      `/projects/${projectId}`,
      projectData
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update project');
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    const response = await apiService.delete<ApiResponse<void>>(`/projects/${projectId}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete project');
    }
  }

  async getProjectStatistics(projectId: string): Promise<any> {
    const response = await apiService.get<ApiResponse<any>>(`/projects/${projectId}/statistics`);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch project statistics');
    }
  }

  async getProjectFieldData(projectId: string, params: {
    page?: number;
    limit?: number;
    type?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<any>>>(
      `/projects/${projectId}/field-data`,
      { params }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch project field data');
    }
  }

  async getProjectMRVReports(projectId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<any>>>(
      `/projects/${projectId}/mrv-reports`,
      { params }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch project MRV reports');
    }
  }

  async getProjectCarbonCredits(projectId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<any>>>(
      `/projects/${projectId}/carbon-credits`,
      { params }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch project carbon credits');
    }
  }

  async searchProjects(query: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Project>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<Project>>>(
      '/projects/search',
      { params: { ...params, q: query } }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to search projects');
    }
  }

  async getProjectsByLocation(latitude: number, longitude: number, radius: number = 10000): Promise<Project[]> {
    const response = await apiService.get<ApiResponse<Project[]>>(
      '/projects/nearby',
      { params: { latitude, longitude, radius } }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch nearby projects');
    }
  }

  async exportProjectData(projectId: string, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<string> {
    const response = await apiService.get<ApiResponse<{ downloadUrl: string }>>(
      `/projects/${projectId}/export`,
      { params: { format } }
    );

    if (response.success) {
      return response.data.downloadUrl;
    } else {
      throw new Error(response.message || 'Failed to export project data');
    }
  }
}

export const projectService = new ProjectService();
export default projectService;

