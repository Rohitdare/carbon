import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    enabled: boolean;
    fieldDataReminders: boolean;
    reportDeadlines: boolean;
    syncStatus: boolean;
  };
  location: {
    autoCapture: boolean;
    accuracy: number;
    backgroundTracking: boolean;
  };
  camera: {
    quality: number;
    autoSave: boolean;
    compression: boolean;
  };
  offline: {
    autoSync: boolean;
    syncInterval: number;
    maxOfflineItems: number;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    crashReporting: boolean;
  };
}

const initialState: SettingsState = {
  theme: 'light',
  language: 'en',
  notifications: {
    enabled: true,
    fieldDataReminders: true,
    reportDeadlines: true,
    syncStatus: true,
  },
  location: {
    autoCapture: true,
    accuracy: 10,
    backgroundTracking: false,
  },
  camera: {
    quality: 0.8,
    autoSave: true,
    compression: true,
  },
  offline: {
    autoSync: true,
    syncInterval: 5 * 60 * 1000, // 5 minutes
    maxOfflineItems: 1000,
  },
  privacy: {
    dataSharing: false,
    analytics: true,
    crashReporting: true,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    updateNotifications: (state, action: PayloadAction<Partial<SettingsState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updateLocation: (state, action: PayloadAction<Partial<SettingsState['location']>>) => {
      state.location = { ...state.location, ...action.payload };
    },
    updateCamera: (state, action: PayloadAction<Partial<SettingsState['camera']>>) => {
      state.camera = { ...state.camera, ...action.payload };
    },
    updateOffline: (state, action: PayloadAction<Partial<SettingsState['offline']>>) => {
      state.offline = { ...state.offline, ...action.payload };
    },
    updatePrivacy: (state, action: PayloadAction<Partial<SettingsState['privacy']>>) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },
    resetSettings: (state) => {
      return initialState;
    },
    loadSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setTheme,
  setLanguage,
  updateNotifications,
  updateLocation,
  updateCamera,
  updateOffline,
  updatePrivacy,
  resetSettings,
  loadSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

