import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export interface StorageItem {
  key: string;
  value: any;
  timestamp: number;
  expiresAt?: number;
}

export class StorageManager {
  private static instance: StorageManager;
  private cache: Map<string, StorageItem> = new Map();
  private maxCacheSize: number = 100;

  private constructor() {}

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  public async setItem(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const item: StorageItem = {
        key,
        value,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined,
      };

      // Store in cache
      this.cache.set(key, item);

      // Store in AsyncStorage
      await AsyncStorage.setItem(key, JSON.stringify(item));

      // Clean up cache if it's too large
      if (this.cache.size > this.maxCacheSize) {
        this.cleanupCache();
      }
    } catch (error) {
      console.error('Error setting storage item:', error);
      throw error;
    }
  }

  public async getItem<T = any>(key: string): Promise<T | null> {
    try {
      // Check cache first
      const cachedItem = this.cache.get(key);
      if (cachedItem && !this.isExpired(cachedItem)) {
        return cachedItem.value;
      }

      // Get from AsyncStorage
      const itemString = await AsyncStorage.getItem(key);
      if (!itemString) {
        return null;
      }

      const item: StorageItem = JSON.parse(itemString);
      
      // Check if expired
      if (this.isExpired(item)) {
        await this.removeItem(key);
        return null;
      }

      // Update cache
      this.cache.set(key, item);
      return item.value;
    } catch (error) {
      console.error('Error getting storage item:', error);
      return null;
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      // Remove from cache
      this.cache.delete(key);

      // Remove from AsyncStorage
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing storage item:', error);
      throw error;
    }
  }

  public async clear(): Promise<void> {
    try {
      // Clear cache
      this.cache.clear();

      // Clear AsyncStorage
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  public async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  public async getMultiple(keys: string[]): Promise<{ [key: string]: any }> {
    try {
      const items = await AsyncStorage.multiGet(keys);
      const result: { [key: string]: any } = {};

      items.forEach(([key, value]) => {
        if (value) {
          try {
            const item: StorageItem = JSON.parse(value);
            if (!this.isExpired(item)) {
              result[key] = item.value;
            }
          } catch (error) {
            console.error('Error parsing storage item:', error);
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  }

  public async setMultiple(items: { [key: string]: any }, ttl?: number): Promise<void> {
    try {
      const storageItems: [string, string][] = [];

      Object.entries(items).forEach(([key, value]) => {
        const item: StorageItem = {
          key,
          value,
          timestamp: Date.now(),
          expiresAt: ttl ? Date.now() + ttl : undefined,
        };

        // Update cache
        this.cache.set(key, item);

        // Prepare for AsyncStorage
        storageItems.push([key, JSON.stringify(item)]);
      });

      // Store in AsyncStorage
      await AsyncStorage.multiSet(storageItems);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  }

  public async removeMultiple(keys: string[]): Promise<void> {
    try {
      // Remove from cache
      keys.forEach(key => this.cache.delete(key));

      // Remove from AsyncStorage
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
      throw error;
    }
  }

  public async getSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error getting storage size:', error);
      return 0;
    }
  }

  public async cleanup(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      const expiredKeys: string[] = [];

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            const item: StorageItem = JSON.parse(value);
            if (this.isExpired(item)) {
              expiredKeys.push(key);
            }
          } catch (error) {
            // Invalid item, remove it
            expiredKeys.push(key);
          }
        }
      }

      if (expiredKeys.length > 0) {
        await this.removeMultiple(expiredKeys);
      }

      // Clean up cache
      this.cleanupCache();
    } catch (error) {
      console.error('Error cleaning up storage:', error);
    }
  }

  private isExpired(item: StorageItem): boolean {
    if (!item.expiresAt) {
      return false;
    }
    return Date.now() > item.expiresAt;
  }

  private cleanupCache(): void {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }

    // Remove oldest items
    const items = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    const itemsToRemove = items.slice(0, this.cache.size - this.maxCacheSize);
    itemsToRemove.forEach(([key]) => this.cache.delete(key));
  }
}

export const storage = StorageManager.getInstance();

export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const stats = await RNFS.stat(filePath);
    return stats.size;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

export const getFileInfo = async (filePath: string): Promise<{
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  mtime: Date;
  ctime: Date;
} | null> => {
  try {
    const stats = await RNFS.stat(filePath);
    return {
      size: stats.size,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      mtime: new Date(stats.mtime),
      ctime: new Date(stats.ctime),
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

export const createDirectory = async (dirPath: string): Promise<boolean> => {
  try {
    const exists = await RNFS.exists(dirPath);
    if (!exists) {
      await RNFS.mkdir(dirPath);
    }
    return true;
  } catch (error) {
    console.error('Error creating directory:', error);
    return false;
  }
};

export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const copyFile = async (sourcePath: string, destPath: string): Promise<boolean> => {
  try {
    await RNFS.copyFile(sourcePath, destPath);
    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
};

export const moveFile = async (sourcePath: string, destPath: string): Promise<boolean> => {
  try {
    await RNFS.moveFile(sourcePath, destPath);
    return true;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
};

export const readFile = async (filePath: string, encoding: 'utf8' | 'base64' = 'utf8'): Promise<string | null> => {
  try {
    const content = await RNFS.readFile(filePath, encoding);
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

export const writeFile = async (filePath: string, content: string, encoding: 'utf8' | 'base64' = 'utf8'): Promise<boolean> => {
  try {
    await RNFS.writeFile(filePath, content, encoding);
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    return false;
  }
};

export const getDocumentDirectory = (): string => {
  return Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath;
};

export const getCacheDirectory = (): string => {
  return RNFS.CachesDirectoryPath;
};

export const getTempDirectory = (): string => {
  return RNFS.TemporaryDirectoryPath;
};

export const getAppDataDirectory = (): string => {
  return Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStorageInfo = async (): Promise<{
  total: number;
  used: number;
  available: number;
  percentage: number;
}> => {
  try {
    const total = await RNFS.getFSInfo();
    return {
      total: total.totalSpace,
      used: total.totalSpace - total.freeSpace,
      available: total.freeSpace,
      percentage: ((total.totalSpace - total.freeSpace) / total.totalSpace) * 100,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      total: 0,
      used: 0,
      available: 0,
      percentage: 0,
    };
  }
};

export const cleanupTempFiles = async (): Promise<void> => {
  try {
    const tempDir = getTempDirectory();
    const files = await RNFS.readDir(tempDir);
    
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const file of files) {
      if (file.isFile() && (now - file.mtime.getTime()) > maxAge) {
        await RNFS.unlink(file.path);
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

