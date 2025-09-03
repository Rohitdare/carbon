import { apiService } from './api';
import { FieldData, FieldDataForm, ApiResponse, PaginatedResponse } from '../types';

class FieldDataService {
  async getFieldData(params: {
    projectId?: string;
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<PaginatedResponse<FieldData>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<FieldData>>>(
      '/field-data',
      { params }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch field data');
    }
  }

  async getFieldDataById(dataId: string): Promise<FieldData> {
    const response = await apiService.get<ApiResponse<FieldData>>(`/field-data/${dataId}`);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch field data');
    }
  }

  async createFieldData(fieldData: FieldDataForm & { projectId: string }): Promise<FieldData> {
    const response = await apiService.post<ApiResponse<FieldData>>('/field-data', fieldData);

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create field data');
    }
  }

  async updateFieldData(dataId: string, fieldData: Partial<FieldDataForm>): Promise<FieldData> {
    const response = await apiService.put<ApiResponse<FieldData>>(
      `/field-data/${dataId}`,
      fieldData
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update field data');
    }
  }

  async deleteFieldData(dataId: string): Promise<void> {
    const response = await apiService.delete<ApiResponse<void>>(`/field-data/${dataId}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete field data');
    }
  }

  async uploadFieldData(dataId: string): Promise<FieldData> {
    const response = await apiService.post<ApiResponse<FieldData>>(
      `/field-data/${dataId}/upload`
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to upload field data');
    }
  }

  async uploadImage(dataId: string, imageUri: string, onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);

    const response = await apiService.uploadFile<ApiResponse<{ imageUrl: string }>>(
      `/field-data/${dataId}/images`,
      formData,
      onProgress
    );

    if (response.success) {
      return response.data.imageUrl;
    } else {
      throw new Error(response.message || 'Failed to upload image');
    }
  }

  async deleteImage(dataId: string, imageUrl: string): Promise<void> {
    const response = await apiService.delete<ApiResponse<void>>(
      `/field-data/${dataId}/images`,
      { data: { imageUrl } }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete image');
    }
  }

  async getFieldDataByLocation(latitude: number, longitude: number, radius: number = 1000): Promise<FieldData[]> {
    const response = await apiService.get<ApiResponse<FieldData[]>>(
      '/field-data/nearby',
      { params: { latitude, longitude, radius } }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch nearby field data');
    }
  }

  async getFieldDataStatistics(projectId?: string, params: {
    startDate?: string;
    endDate?: string;
    type?: string;
  } = {}): Promise<any> {
    const response = await apiService.get<ApiResponse<any>>(
      '/field-data/statistics',
      { params: { ...params, projectId } }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch field data statistics');
    }
  }

  async exportFieldData(projectId?: string, params: {
    type?: string;
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'excel' | 'pdf';
  } = {}): Promise<string> {
    const response = await apiService.get<ApiResponse<{ downloadUrl: string }>>(
      '/field-data/export',
      { params: { ...params, projectId } }
    );

    if (response.success) {
      return response.data.downloadUrl;
    } else {
      throw new Error(response.message || 'Failed to export field data');
    }
  }

  async validateFieldData(fieldData: FieldDataForm): Promise<{ valid: boolean; errors: string[] }> {
    const response = await apiService.post<ApiResponse<{ valid: boolean; errors: string[] }>>(
      '/field-data/validate',
      fieldData
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to validate field data');
    }
  }

  async getFieldDataTypes(): Promise<string[]> {
    const response = await apiService.get<ApiResponse<string[]>>('/field-data/types');

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch field data types');
    }
  }

  async getMeasurementUnits(type: string): Promise<string[]> {
    const response = await apiService.get<ApiResponse<string[]>>(
      `/field-data/measurement-units/${type}`
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch measurement units');
    }
  }

  async syncOfflineData(): Promise<FieldData[]> {
    const response = await apiService.post<ApiResponse<FieldData[]>>('/field-data/sync-offline');

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to sync offline data');
    }
  }

  async batchUploadFieldData(fieldDataList: (FieldDataForm & { projectId: string })[]): Promise<FieldData[]> {
    const response = await apiService.post<ApiResponse<FieldData[]>>(
      '/field-data/batch-upload',
      { fieldDataList }
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to batch upload field data');
    }
  }
}

export const fieldDataService = new FieldDataService();
export default fieldDataService;

