import { api } from './api';
import { MRVReport, PaginatedResponse, SearchParams } from '@/types';

export class MRVService {
  // Get all MRV reports with pagination and filters
  static async getReports(params?: SearchParams): Promise<PaginatedResponse<MRVReport>> {
    const response = await api.get<PaginatedResponse<MRVReport>>('/mrv/reports', params);
    return response.data;
  }

  // Get MRV report by ID
  static async getReport(id: string): Promise<MRVReport> {
    const response = await api.get<MRVReport>(`/mrv/reports/${id}`);
    return response.data;
  }

  // Create new MRV report
  static async createReport(reportData: Omit<MRVReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<MRVReport> {
    const response = await api.post<MRVReport>('/mrv/reports', reportData);
    return response.data;
  }

  // Update MRV report
  static async updateReport(id: string, reportData: Partial<MRVReport>): Promise<MRVReport> {
    const response = await api.put<MRVReport>(`/mrv/reports/${id}`, reportData);
    return response.data;
  }

  // Delete MRV report
  static async deleteReport(id: string): Promise<void> {
    await api.delete(`/mrv/reports/${id}`);
  }

  // Submit MRV report for verification
  static async submitReport(id: string): Promise<MRVReport> {
    const response = await api.post<MRVReport>(`/mrv/reports/${id}/submit`);
    return response.data;
  }

  // Verify MRV report
  static async verifyReport(id: string, verificationNotes: string, approved: boolean): Promise<MRVReport> {
    const response = await api.post<MRVReport>(`/mrv/reports/${id}/verify`, {
      verificationNotes,
      approved,
    });
    return response.data;
  }

  // Get reports by project
  static async getReportsByProject(projectId: string): Promise<MRVReport[]> {
    const response = await api.get<MRVReport[]>(`/mrv/reports/project/${projectId}`);
    return response.data;
  }

  // Get reports by status
  static async getReportsByStatus(status: string): Promise<MRVReport[]> {
    const response = await api.get<MRVReport[]>(`/mrv/reports/status/${status}`);
    return response.data;
  }

  // Get reports by user
  static async getReportsByUser(userId: string): Promise<MRVReport[]> {
    const response = await api.get<MRVReport[]>(`/mrv/reports/user/${userId}`);
    return response.data;
  }

  // Get pending verification reports
  static async getPendingVerificationReports(): Promise<MRVReport[]> {
    const response = await api.get<MRVReport[]>('/mrv/reports/pending-verification');
    return response.data;
  }

  // Generate MRV report template
  static async generateReportTemplate(projectId: string, reportType: string): Promise<MRVReport> {
    const response = await api.post<MRVReport>('/mrv/reports/template', {
      projectId,
      reportType,
    });
    return response.data;
  }

  // Export MRV report
  static async exportReport(id: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    const response = await api.get(`/mrv/reports/${id}/export`, {
      format,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Get report statistics
  static async getReportStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byMonth: Array<{ month: string; count: number }>;
  }> {
    const response = await api.get('/mrv/reports/statistics');
    return response.data;
  }

  // Get report history
  static async getReportHistory(id: string): Promise<any[]> {
    const response = await api.get<any[]>(`/mrv/reports/${id}/history`);
    return response.data;
  }

  // Add report comment
  static async addComment(reportId: string, comment: string): Promise<void> {
    await api.post(`/mrv/reports/${reportId}/comments`, { comment });
  }

  // Get report comments
  static async getComments(reportId: string): Promise<any[]> {
    const response = await api.get<any[]>(`/mrv/reports/${reportId}/comments`);
    return response.data;
  }

  // Attach file to report
  static async attachFile(reportId: string, file: File, description?: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    await api.post(`/mrv/reports/${reportId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get report attachments
  static async getAttachments(reportId: string): Promise<any[]> {
    const response = await api.get<any[]>(`/mrv/reports/${reportId}/attachments`);
    return response.data;
  }

  // Download attachment
  static async downloadAttachment(reportId: string, attachmentId: string): Promise<Blob> {
    const response = await api.get(`/mrv/reports/${reportId}/attachments/${attachmentId}/download`, {}, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Delete attachment
  static async deleteAttachment(reportId: string, attachmentId: string): Promise<void> {
    await api.delete(`/mrv/reports/${reportId}/attachments/${attachmentId}`);
  }

  // Get report validation errors
  static async validateReport(id: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await api.get(`/mrv/reports/${id}/validate`);
    return response.data;
  }

  // Bulk update reports
  static async bulkUpdateReports(reportIds: string[], updates: Partial<MRVReport>): Promise<void> {
    await api.patch('/mrv/reports/bulk-update', {
      reportIds,
      updates,
    });
  }

  // Get report comparison
  static async compareReports(reportIds: string[]): Promise<{
    differences: any[];
    summary: any;
  }> {
    const response = await api.post('/mrv/reports/compare', { reportIds });
    return response.data;
  }
}

