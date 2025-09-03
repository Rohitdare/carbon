import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineData } from '../types';
import { STORAGE_KEYS, OFFLINE_CONFIG } from '../constants';

class OfflineService {
  private offlineData: OfflineData[] = [];

  async initialize(): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
      if (storedData) {
        this.offlineData = JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error initializing offline service:', error);
    }
  }

  async addOfflineData(type: string, data: any): Promise<OfflineData> {
    const offlineData: OfflineData = {
      id: this.generateId(),
      type,
      data,
      isUploaded: false,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    this.offlineData.push(offlineData);
    await this.saveOfflineData();
    return offlineData;
  }

  async removeOfflineData(dataId: string): Promise<void> {
    this.offlineData = this.offlineData.filter(data => data.id !== dataId);
    await this.saveOfflineData();
  }

  async getOfflineData(): Promise<OfflineData[]> {
    return this.offlineData;
  }

  async getOfflineDataByType(type: string): Promise<OfflineData[]> {
    return this.offlineData.filter(data => data.type === type);
  }

  async getUnuploadedData(): Promise<OfflineData[]> {
    return this.offlineData.filter(data => !data.isUploaded);
  }

  async markAsUploaded(dataId: string): Promise<void> {
    const index = this.offlineData.findIndex(data => data.id === dataId);
    if (index !== -1) {
      this.offlineData[index].isUploaded = true;
      await this.saveOfflineData();
    }
  }

  async incrementRetryCount(dataId: string): Promise<void> {
    const index = this.offlineData.findIndex(data => data.id === dataId);
    if (index !== -1) {
      this.offlineData[index].retryCount += 1;
      await this.saveOfflineData();
    }
  }

  async clearOfflineData(): Promise<void> {
    this.offlineData = [];
    await this.saveOfflineData();
  }

  async clearUploadedData(): Promise<void> {
    this.offlineData = this.offlineData.filter(data => !data.isUploaded);
    await this.saveOfflineData();
  }

  async getOfflineDataCount(): Promise<number> {
    return this.offlineData.length;
  }

  async getUnuploadedDataCount(): Promise<number> {
    return this.offlineData.filter(data => !data.isUploaded).length;
  }

  async isOfflineDataLimitReached(): Promise<boolean> {
    return this.offlineData.length >= OFFLINE_CONFIG.MAX_OFFLINE_ITEMS;
  }

  async getRetryableData(): Promise<OfflineData[]> {
    return this.offlineData.filter(
      data => !data.isUploaded && data.retryCount < OFFLINE_CONFIG.MAX_RETRY_ATTEMPTS
    );
  }

  async getFailedData(): Promise<OfflineData[]> {
    return this.offlineData.filter(
      data => !data.isUploaded && data.retryCount >= OFFLINE_CONFIG.MAX_RETRY_ATTEMPTS
    );
  }

  async syncAllOfflineData(): Promise<string[]> {
    const unuploadedData = await this.getUnuploadedData();
    const syncedIds: string[] = [];

    for (const data of unuploadedData) {
      try {
        await this.syncOfflineData(data);
        syncedIds.push(data.id);
        await this.markAsUploaded(data.id);
      } catch (error) {
        console.error(`Failed to sync offline data ${data.id}:`, error);
        await this.incrementRetryCount(data.id);
      }
    }

    return syncedIds;
  }

  async retryOfflineData(dataId: string): Promise<OfflineData> {
    const data = this.offlineData.find(d => d.id === dataId);
    if (!data) {
      throw new Error('Offline data not found');
    }

    if (data.retryCount >= OFFLINE_CONFIG.MAX_RETRY_ATTEMPTS) {
      throw new Error('Maximum retry attempts reached');
    }

    try {
      await this.syncOfflineData(data);
      await this.markAsUploaded(dataId);
      return data;
    } catch (error) {
      await this.incrementRetryCount(dataId);
      throw error;
    }
  }

  private async syncOfflineData(data: OfflineData): Promise<void> {
    // This method should be implemented based on the data type
    // For now, we'll simulate the sync process
    switch (data.type) {
      case 'field_data':
        // Sync field data
        break;
      case 'mrv_report':
        // Sync MRV report
        break;
      default:
        throw new Error(`Unknown data type: ${data.type}`);
    }
  }

  private async saveOfflineData(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(this.offlineData));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async getOfflineDataStatistics(): Promise<{
    total: number;
    uploaded: number;
    unuploaded: number;
    failed: number;
    retryable: number;
  }> {
    const total = this.offlineData.length;
    const uploaded = this.offlineData.filter(data => data.isUploaded).length;
    const unuploaded = total - uploaded;
    const failed = this.offlineData.filter(
      data => !data.isUploaded && data.retryCount >= OFFLINE_CONFIG.MAX_RETRY_ATTEMPTS
    ).length;
    const retryable = this.offlineData.filter(
      data => !data.isUploaded && data.retryCount < OFFLINE_CONFIG.MAX_RETRY_ATTEMPTS
    ).length;

    return {
      total,
      uploaded,
      unuploaded,
      failed,
      retryable,
    };
  }

  async exportOfflineData(): Promise<string> {
    const data = {
      offlineData: this.offlineData,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };

    return JSON.stringify(data, null, 2);
  }

  async importOfflineData(data: string): Promise<void> {
    try {
      const importedData = JSON.parse(data);
      if (importedData.offlineData && Array.isArray(importedData.offlineData)) {
        this.offlineData = [...this.offlineData, ...importedData.offlineData];
        await this.saveOfflineData();
      }
    } catch (error) {
      throw new Error('Invalid offline data format');
    }
  }
}

export const offlineService = new OfflineService();
export default offlineService;

