import { apiService } from './api';
import { MRVReport, MRVReportForm, ApiResponse, PaginatedResponse } from '../types';

class MRVReportService {
  async getMRVReports(params: {
    projectId?: string;
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<PaginatedResponse<MRVReport>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<MRVReport>>>(
      '/mrv-reports',
      { params }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch MRV reports');
    }
  }

  async getMRVReportById(reportId: string): Promise<MRVReport> {
    const response = await apiService.get<ApiResponse<MRVReport>>(`/mrv-reports/${reportId}`);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch MRV report');
    }
  }

  async createMRVReport(reportData: MRVReportForm & { projectId: string }): Promise<MRVReport> {
    const response = await apiService.post<ApiResponse<MRVReport>>('/mrv-reports', reportData);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create MRV report');
    }
  }

  async updateMRVReport(reportId: string, reportData: Partial<MRVReportForm>): Promise<MRVReport> {
    const response = await apiService.put<ApiResponse<MRVReport>>(
      `/mrv-reports/${reportId}`,
      reportData
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update MRV report');
    }
  }

  async deleteMRVReport(reportId: string): Promise<void> {
    const response = await apiService.delete<ApiResponse<void>>(`/mrv-reports/${reportId}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete MRV report');
    }
  }

  async submitMRVReport(reportId: string): Promise<MRVReport> {
    const response = await apiService.post<ApiResponse<MRVReport>>(
      `/mrv-reports/${reportId}/submit`
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to submit MRV report');
    }
  }

  async reviewMRVReport(reportId: string, status: string, comments?: string): Promise<MRVReport> {
    const response = await apiService.post<ApiResponse<MRVReport>>(
      `/mrv-reports/${reportId}/review`,
      { status, comments }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to review MRV report');
    }
  }

  async uploadAttachment(reportId: string, fileUri: string, onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('attachment', {
      uri: fileUri,
      type: 'application/pdf',
      name: 'attachment.pdf',
    } as any);

    const response = await apiService.uploadFile<ApiResponse<{ attachmentUrl: string }>>(
      `/mrv-reports/${reportId}/attachments`,
      formData,
      onProgress
    );

    if (response.success) {
      return response.data.attachmentUrl;
    } else {
      throw new Error(response.message || 'Failed to upload attachment');
    }
  }

  async deleteAttachment(reportId: string, attachmentUrl: string): Promise<void> {
    const response = await apiService.delete<ApiResponse<void>>(
      `/mrv-reports/${reportId}/attachments`,
      { data: { attachmentUrl } }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete attachment');
    }
  }

  async generateMRVReport(reportId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<string> {
    const response = await apiService.get<ApiResponse<{ downloadUrl: string }>>(
      `/mrv-reports/${reportId}/generate`,
      { params: { format } }
    );

    if (response.success) {
      return response.data.downloadUrl;
    } else {
      throw new Error(response.message || 'Failed to generate MRV report');
    }
  }

  async getMRVReportTemplate(projectId: string, ecosystemType: string): Promise<any> {
    const response = await apiService.get<ApiResponse<any>>(
      '/mrv-reports/template',
      { params: { projectId, ecosystemType } }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch MRV report template');
    }
  }

  async validateMRVReport(reportData: MRVReportForm): Promise<{ valid: boolean; errors: string[] }> {
    const response = await apiService.post<ApiResponse<{ valid: boolean; errors: string[] }>>(
      '/mrv-reports/validate',
      reportData
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to validate MRV report');
    }
  }

  async getMRVReportStatistics(projectId?: string, params: {
    startDate?: string;
    endDate?: string;
    status?: string;
  } = {}): Promise<any> {
    const response = await apiService.get<ApiResponse<any>>(
      '/mrv-reports/statistics',
      { params: { ...params, projectId } }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch MRV report statistics');
    }
  }

  async exportMRVReports(projectId?: string, params: {
    status?: string;
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'excel' | 'pdf';
  } = {}): Promise<string> {
    const response = await apiService.get<ApiResponse<{ downloadUrl: string }>>(
      '/mrv-reports/export',
      { params: { ...params, projectId } }
    );

    if (response.success) {
      return response.data.downloadUrl;
    } else {
      throw new Error(response.message || 'Failed to export MRV reports');
    }
  }

  async getMRVReportHistory(reportId: string): Promise<any[]> {
    const response = await apiService.get<ApiResponse<any[]>>(
      `/mrv-reports/${reportId}/history`
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch MRV report history');
    }
  }

  async duplicateMRVReport(reportId: string, newTitle: string): Promise<MRVReport> {
    const response = await apiService.post<ApiResponse<MRVReport>>(
      `/mrv-reports/${reportId}/duplicate`,
      { title: newTitle }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to duplicate MRV report');
    }
  }

  async getMRVReportComments(reportId: string): Promise<any[]> {
    const response = await apiService.get<ApiResponse<any[]>>(
      `/mrv-reports/${reportId}/comments`
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch MRV report comments');
    }
  }

  async addMRVReportComment(reportId: string, comment: string): Promise<any> {
    const response = await apiService.post<ApiResponse<any>>(
      `/mrv-reports/${reportId}/comments`,
      { comment }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to add MRV report comment');
    }
  }

  async getMRVReportDeadlines(projectId?: string): Promise<any[]> {
    const response = await apiService.get<ApiResponse<any[]>>(
      '/mrv-reports/deadlines',
      { params: { projectId } }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch MRV report deadlines');
    }
  }
}

export const mrvReportService = new MRVReportService();
export default mrvReportService;

