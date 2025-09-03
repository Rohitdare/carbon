import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { offlineService } from '../services/offlineService';

export const initializeApp = async (): Promise<void> => {
  try {
    // Initialize offline service
    await offlineService.initialize();
    
    // Request necessary permissions
    await requestPermissions();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

export const requestPermissions = async (): Promise<void> => {
  try {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const deniedPermissions = Object.entries(granted)
        .filter(([_, status]) => status !== PermissionsAndroid.RESULTS.GRANTED)
        .map(([permission]) => permission);

      if (deniedPermissions.length > 0) {
        Alert.alert(
          'Permissions Required',
          'Some permissions are required for the app to function properly. Please enable them in settings.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // iOS permissions
      const cameraPermission = await request(PERMISSIONS.IOS.CAMERA);
      const locationPermission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      const photoPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);

      if (cameraPermission === RESULTS.DENIED || locationPermission === RESULTS.DENIED) {
        Alert.alert(
          'Permissions Required',
          'Camera and location permissions are required for the app to function properly.',
          [{ text: 'OK' }]
        );
      }
    }
  } catch (error) {
    console.error('Error requesting permissions:', error);
  }
};

export const checkPermissions = async (): Promise<{
  camera: boolean;
  location: boolean;
  storage: boolean;
}> => {
  try {
    if (Platform.OS === 'android') {
      const camera = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      const location = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      const storage = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);

      return { camera, location, storage };
    } else {
      // iOS permission checks
      const camera = await request(PERMISSIONS.IOS.CAMERA) === RESULTS.GRANTED;
      const location = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE) === RESULTS.GRANTED;
      const storage = await request(PERMISSIONS.IOS.PHOTO_LIBRARY) === RESULTS.GRANTED;

      return { camera, location, storage };
    }
  } catch (error) {
    console.error('Error checking permissions:', error);
    return { camera: false, location: false, storage: false };
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const extension = getFileExtension(fileName);
  return imageExtensions.includes(extension);
};

export const isDocumentFile = (fileName: string): boolean => {
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  const extension = getFileExtension(fileName);
  return documentExtensions.includes(extension);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

