import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export interface NetworkState {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
  details: any;
}

export class NetworkManager {
  private static instance: NetworkManager;
  private networkState: NetworkState | null = null;
  private listeners: ((state: NetworkState) => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Get initial network state
      this.networkState = await NetInfo.fetch();
      this.notifyListeners();

      // Subscribe to network state changes
      this.unsubscribe = NetInfo.addEventListener(state => {
        this.networkState = state;
        this.notifyListeners();
      });
    } catch (error) {
      console.error('Error initializing network manager:', error);
    }
  }

  public getNetworkState(): NetworkState | null {
    return this.networkState;
  }

  public isConnected(): boolean {
    return this.networkState?.isConnected ?? false;
  }

  public isInternetReachable(): boolean {
    return this.networkState?.isInternetReachable ?? false;
  }

  public getConnectionType(): string | null {
    return this.networkState?.type ?? null;
  }

  public addListener(listener: (state: NetworkState) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (state: NetworkState) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    if (this.networkState) {
      this.listeners.forEach(listener => listener(this.networkState!));
    }
  }

  public async refreshNetworkState(): Promise<NetworkState> {
    try {
      this.networkState = await NetInfo.fetch();
      this.notifyListeners();
      return this.networkState;
    } catch (error) {
      console.error('Error refreshing network state:', error);
      throw error;
    }
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
  }
}

export const networkManager = NetworkManager.getInstance();

export const isNetworkAvailable = (): boolean => {
  return networkManager.isConnected();
};

export const isInternetAvailable = (): boolean => {
  return networkManager.isInternetReachable();
};

export const getConnectionType = (): string | null => {
  return networkManager.getConnectionType();
};

export const waitForNetwork = (timeout: number = 30000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isNetworkAvailable()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      networkManager.removeListener(listener);
      resolve(false);
    }, timeout);

    const listener = (state: NetworkState) => {
      if (state.isConnected) {
        clearTimeout(timeoutId);
        networkManager.removeListener(listener);
        resolve(true);
      }
    };

    networkManager.addListener(listener);
  });
};

export const waitForInternet = (timeout: number = 30000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isInternetAvailable()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      networkManager.removeListener(listener);
      resolve(false);
    }, timeout);

    const listener = (state: NetworkState) => {
      if (state.isInternetReachable) {
        clearTimeout(timeoutId);
        networkManager.removeListener(listener);
        resolve(true);
      }
    };

    networkManager.addListener(listener);
  });
};

export const showNetworkError = (message?: string): void => {
  const defaultMessage = 'No internet connection. Please check your network settings and try again.';
  Alert.alert('Network Error', message || defaultMessage, [{ text: 'OK' }]);
};

export const showNetworkWarning = (message?: string): void => {
  const defaultMessage = 'You are currently offline. Some features may not be available.';
  Alert.alert('Network Warning', message || defaultMessage, [{ text: 'OK' }]);
};

export const getNetworkQuality = (): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' => {
  const connectionType = getConnectionType();
  
  switch (connectionType) {
    case 'wifi':
      return 'excellent';
    case 'cellular':
      return 'good';
    case 'ethernet':
      return 'excellent';
    case 'bluetooth':
      return 'fair';
    case 'vpn':
      return 'good';
    case 'other':
      return 'fair';
    default:
      return 'unknown';
  }
};

export const getNetworkQualityColor = (): string => {
  const quality = getNetworkQuality();
  
  switch (quality) {
    case 'excellent':
      return '#4CAF50'; // Green
    case 'good':
      return '#8BC34A'; // Light Green
    case 'fair':
      return '#FF9800'; // Orange
    case 'poor':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Grey
  }
};

export const getNetworkQualityIcon = (): string => {
  const quality = getNetworkQuality();
  
  switch (quality) {
    case 'excellent':
      return '📶';
    case 'good':
      return '📶';
    case 'fair':
      return '📶';
    case 'poor':
      return '📶';
    default:
      return '❓';
  }
};

export const isSlowConnection = (): boolean => {
  const quality = getNetworkQuality();
  return quality === 'fair' || quality === 'poor';
};

export const shouldUseLowQualityImages = (): boolean => {
  return isSlowConnection();
};

export const shouldCompressImages = (): boolean => {
  return isSlowConnection();
};

export const getOptimalImageQuality = (): number => {
  const quality = getNetworkQuality();
  
  switch (quality) {
    case 'excellent':
      return 0.9;
    case 'good':
      return 0.8;
    case 'fair':
      return 0.6;
    case 'poor':
      return 0.4;
    default:
      return 0.7;
  }
};

export const getOptimalVideoQuality = (): number => {
  const quality = getNetworkQuality();
  
  switch (quality) {
    case 'excellent':
      return 0.9;
    case 'good':
      return 0.7;
    case 'fair':
      return 0.5;
    case 'poor':
      return 0.3;
    default:
      return 0.6;
  }
};

export const getOptimalBatchSize = (): number => {
  const quality = getNetworkQuality();
  
  switch (quality) {
    case 'excellent':
      return 50;
    case 'good':
      return 25;
    case 'fair':
      return 10;
    case 'poor':
      return 5;
    default:
      return 15;
  }
};

export const getOptimalRetryDelay = (): number => {
  const quality = getNetworkQuality();
  
  switch (quality) {
    case 'excellent':
      return 1000;
    case 'good':
      return 2000;
    case 'fair':
      return 3000;
    case 'poor':
      return 5000;
    default:
      return 2000;
  }
};

export const getOptimalTimeout = (): number => {
  const quality = getNetworkQuality();
  
  switch (quality) {
    case 'excellent':
      return 10000;
    case 'good':
      return 15000;
    case 'fair':
      return 20000;
    case 'poor':
      return 30000;
    default:
      return 15000;
  }
};

export const formatConnectionType = (type: string | null): string => {
  if (!type) return 'Unknown';
  
  switch (type.toLowerCase()) {
    case 'wifi':
      return 'Wi-Fi';
    case 'cellular':
      return 'Cellular';
    case 'ethernet':
      return 'Ethernet';
    case 'bluetooth':
      return 'Bluetooth';
    case 'vpn':
      return 'VPN';
    case 'other':
      return 'Other';
    default:
      return type;
  }
};

export const getNetworkStatusText = (): string => {
  if (!isNetworkAvailable()) {
    return 'No Connection';
  }
  
  if (!isInternetAvailable()) {
    return 'Connected (No Internet)';
  }
  
  const type = getConnectionType();
  return `Connected (${formatConnectionType(type)})`;
};

export const getNetworkStatusColor = (): string => {
  if (!isNetworkAvailable()) {
    return '#F44336'; // Red
  }
  
  if (!isInternetAvailable()) {
    return '#FF9800'; // Orange
  }
  
  return getNetworkQualityColor();
};

export const getNetworkStatusIcon = (): string => {
  if (!isNetworkAvailable()) {
    return '❌';
  }
  
  if (!isInternetAvailable()) {
    return '⚠️';
  }
  
  return getNetworkQualityIcon();
};

export const isWifiConnection = (): boolean => {
  return getConnectionType() === 'wifi';
};

export const isCellularConnection = (): boolean => {
  return getConnectionType() === 'cellular';
};

export const isEthernetConnection = (): boolean => {
  return getConnectionType() === 'ethernet';
};

export const isBluetoothConnection = (): boolean => {
  return getConnectionType() === 'bluetooth';
};

export const isVpnConnection = (): boolean => {
  return getConnectionType() === 'vpn';
};

export const shouldWarnAboutDataUsage = (): boolean => {
  return isCellularConnection();
};

export const getDataUsageWarning = (): string => {
  return 'You are using cellular data. Large file uploads may consume significant data.';
};

export const shouldPauseLargeUploads = (): boolean => {
  return isCellularConnection() && isSlowConnection();
};

export const shouldResumeUploads = (): boolean => {
  return isWifiConnection() || (isCellularConnection() && !isSlowConnection());
};

