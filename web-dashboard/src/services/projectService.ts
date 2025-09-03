import { api } from './api';
import { Project, ProjectStats, PaginatedResponse, SearchParams } from '@/types';

export class ProjectService {
  // Get all projects with pagination and filters
  static async getProjects(params?: SearchParams): Promise<PaginatedResponse<Project>> {
    const response = await api.get<PaginatedResponse<Project>>('/projects', params);
    return response.data;
  }

  // Get project by ID
  static async getProject(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  }

  // Create new project
  static async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await api.post<Project>('/projects', projectData);
    return response.data;
  }

  // Update project
  static async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, projectData);
    return response.data;
  }

  // Delete project
  static async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }

  // Get project statistics
  static async getProjectStats(id: string): Promise<ProjectStats> {
    const response = await api.get<ProjectStats>(`/projects/${id}/stats`);
    return response.data;
  }

  // Get all project statistics
  static async getAllProjectStats(): Promise<ProjectStats[]> {
    const response = await api.get<ProjectStats[]>('/projects/stats');
    return response.data;
  }

  // Search projects
  static async searchProjects(query: string, filters?: any): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects/search', {
      query,
      ...filters,
    });
    return response.data;
  }

  // Get projects by ecosystem type
  static async getProjectsByEcosystemType(ecosystemType: string): Promise<Project[]> {
    const response = await api.get<Project[]>(`/projects/ecosystem/${ecosystemType}`);
    return response.data;
  }

  // Get projects by status
  static async getProjectsByStatus(status: string): Promise<Project[]> {
    const response = await api.get<Project[]>(`/projects/status/${status}`);
    return response.data;
  }

  // Get projects by user
  static async getProjectsByUser(userId: string): Promise<Project[]> {
    const response = await api.get<Project[]>(`/projects/user/${userId}`);
    return response.data;
  }

  // Get projects within geographic bounds
  static async getProjectsInBounds(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects/bounds', bounds);
    return response.data;
  }

  // Export projects data
  static async exportProjects(format: 'csv' | 'excel' | 'geojson', filters?: any): Promise<Blob> {
    const response = await api.get('/projects/export', {
      format,
      ...filters,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Import projects data
  static async importProjects(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{ imported: number; errors: string[] }>('/projects/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Duplicate project
  static async duplicateProject(id: string, newName: string): Promise<Project> {
    const response = await api.post<Project>(`/projects/${id}/duplicate`, { name: newName });
    return response.data;
  }

  // Archive project
  static async archiveProject(id: string): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}/archive`);
    return response.data;
  }

  // Restore project
  static async restoreProject(id: string): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}/restore`);
    return response.data;
  }

  // Get project timeline
  static async getProjectTimeline(id: string): Promise<any[]> {
    const response = await api.get<any[]>(`/projects/${id}/timeline`);
    return response.data;
  }

  // Add project collaborator
  static async addCollaborator(projectId: string, userId: string, role: string): Promise<void> {
    await api.post(`/projects/${projectId}/collaborators`, { userId, role });
  }

  // Remove project collaborator
  static async removeCollaborator(projectId: string, userId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/collaborators/${userId}`);
  }

  // Get project collaborators
  static async getCollaborators(projectId: string): Promise<any[]> {
    const response = await api.get<any[]>(`/projects/${projectId}/collaborators`);
    return response.data;
  }
}

