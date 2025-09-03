import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchSettings, 
  updateSettings, 
  resetSettings,
  setTheme,
  setLanguage,
  setNotifications,
  setLocationTracking,
  setDataSync,
  setOfflineMode,
  setImageQuality,
  setVideoQuality,
  setAutoSync,
  setSyncInterval,
  setMaxOfflineStorage,
  setDataRetention,
  setPrivacySettings,
  setSecuritySettings
} from '../store/slices/settingsSlice';
import { Settings, Theme, Language, NotificationSettings, PrivacySettings, SecuritySettings } from '../types';

export const useSettings = () => {
  const dispatch = useAppDispatch();
  const { 
    settings, 
    isLoading, 
    error 
  } = useAppSelector(state => state.settings);

  const loadSettings = useCallback(async () => {
    try {
      await dispatch(fetchSettings()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleUpdateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      const result = await dispatch(updateSettings(newSettings)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleResetSettings = useCallback(async () => {
    try {
      await dispatch(resetSettings()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetTheme = useCallback(async (theme: Theme) => {
    try {
      await dispatch(setTheme(theme)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetLanguage = useCallback(async (language: Language) => {
    try {
      await dispatch(setLanguage(language)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetNotifications = useCallback(async (notifications: NotificationSettings) => {
    try {
      await dispatch(setNotifications(notifications)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetLocationTracking = useCallback(async (enabled: boolean) => {
    try {
      await dispatch(setLocationTracking(enabled)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetDataSync = useCallback(async (enabled: boolean) => {
    try {
      await dispatch(setDataSync(enabled)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetOfflineMode = useCallback(async (enabled: boolean) => {
    try {
      await dispatch(setOfflineMode(enabled)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetImageQuality = useCallback(async (quality: number) => {
    try {
      await dispatch(setImageQuality(quality)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetVideoQuality = useCallback(async (quality: number) => {
    try {
      await dispatch(setVideoQuality(quality)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetAutoSync = useCallback(async (enabled: boolean) => {
    try {
      await dispatch(setAutoSync(enabled)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetSyncInterval = useCallback(async (interval: number) => {
    try {
      await dispatch(setSyncInterval(interval)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetMaxOfflineStorage = useCallback(async (maxStorage: number) => {
    try {
      await dispatch(setMaxOfflineStorage(maxStorage)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetDataRetention = useCallback(async (retention: number) => {
    try {
      await dispatch(setDataRetention(retention)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetPrivacySettings = useCallback(async (privacy: PrivacySettings) => {
    try {
      await dispatch(setPrivacySettings(privacy)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetSecuritySettings = useCallback(async (security: SecuritySettings) => {
    try {
      await dispatch(setSecuritySettings(security)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    updateSettings: handleUpdateSettings,
    resetSettings: handleResetSettings,
    setTheme: handleSetTheme,
    setLanguage: handleSetLanguage,
    setNotifications: handleSetNotifications,
    setLocationTracking: handleSetLocationTracking,
    setDataSync: handleSetDataSync,
    setOfflineMode: handleSetOfflineMode,
    setImageQuality: handleSetImageQuality,
    setVideoQuality: handleSetVideoQuality,
    setAutoSync: handleSetAutoSync,
    setSyncInterval: handleSetSyncInterval,
    setMaxOfflineStorage: handleSetMaxOfflineStorage,
    setDataRetention: handleSetDataRetention,
    setPrivacySettings: handleSetPrivacySettings,
    setSecuritySettings: handleSetSecuritySettings,
  };
};

