import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchOfflineData, 
  syncOfflineData, 
  clearOfflineData,
  setOfflineMode,
  setSyncStatus,
  addOfflineAction,
  removeOfflineAction,
  clearOfflineActions
} from '../store/slices/offlineSlice';
import { isNetworkAvailable, isInternetAvailable } from '../utils/networkUtils';

export const useOffline = () => {
  const dispatch = useAppDispatch();
  const { 
    isOfflineMode, 
    syncStatus, 
    offlineActions, 
    lastSyncTime,
    isLoading, 
    error 
  } = useAppSelector(state => state.offline);

  const loadOfflineData = useCallback(async () => {
    try {
      await dispatch(fetchOfflineData()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSyncOfflineData = useCallback(async () => {
    try {
      await dispatch(syncOfflineData()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleClearOfflineData = useCallback(async () => {
    try {
      await dispatch(clearOfflineData()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetOfflineMode = useCallback(async (isOffline: boolean) => {
    try {
      await dispatch(setOfflineMode(isOffline)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetSyncStatus = useCallback(async (status: string) => {
    try {
      await dispatch(setSyncStatus(status)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleAddOfflineAction = useCallback(async (action: any) => {
    try {
      await dispatch(addOfflineAction(action)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleRemoveOfflineAction = useCallback(async (actionId: string) => {
    try {
      await dispatch(removeOfflineAction(actionId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleClearOfflineActions = useCallback(async () => {
    try {
      await dispatch(clearOfflineActions()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Monitor network status and update offline mode accordingly
  useEffect(() => {
    const checkNetworkStatus = () => {
      const isOnline = isNetworkAvailable() && isInternetAvailable();
      if (isOnline !== !isOfflineMode) {
        handleSetOfflineMode(!isOnline);
      }
    };

    // Check immediately
    checkNetworkStatus();

    // Set up interval to check network status
    const interval = setInterval(checkNetworkStatus, 5000);

    return () => clearInterval(interval);
  }, [isOfflineMode, handleSetOfflineMode]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (!isOfflineMode && offlineActions.length > 0) {
      handleSyncOfflineData();
    }
  }, [isOfflineMode, offlineActions.length, handleSyncOfflineData]);

  return {
    isOfflineMode,
    syncStatus,
    offlineActions,
    lastSyncTime,
    isLoading,
    error,
    loadOfflineData,
    syncOfflineData: handleSyncOfflineData,
    clearOfflineData: handleClearOfflineData,
    setOfflineMode: handleSetOfflineMode,
    setSyncStatus: handleSetSyncStatus,
    addOfflineAction: handleAddOfflineAction,
    removeOfflineAction: handleRemoveOfflineAction,
    clearOfflineActions: handleClearOfflineActions,
  };
};

