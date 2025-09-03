import { Theme } from '../types';

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:8000/api' : 'https://api.bluecarbonmrv.com/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  OFFLINE_DATA: 'offline_data',
  SETTINGS: 'settings',
  LAST_SYNC: 'last_sync',
};

// Field Data Types
export const FIELD_DATA_TYPES = {
  BIOMASS: 'biomass',
  SOIL: 'soil',
  WATER: 'water',
  VEGETATION: 'vegetation',
  ENVIRONMENTAL: 'environmental',
} as const;

// Project Status
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  MONITORING: 'monitoring',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// MRV Report Status
export const MRV_REPORT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Carbon Credit Status
export const CARBON_CREDIT_STATUS = {
  PENDING: 'pending',
  ISSUED: 'issued',
  TRANSFERRED: 'transferred',
  RETIRED: 'retired',
} as const;

// User Roles
export const USER_ROLES = {
  FIELD_WORKER: 'field_worker',
  NGO_ADMIN: 'ngo_admin',
  GOVERNMENT: 'government',
  VERIFIER: 'verifier',
} as const;

// Ecosystem Types
export const ECOSYSTEM_TYPES = {
  MANGROVE: 'mangrove',
  SEAGRASS: 'seagrass',
  SALT_MARSH: 'salt_marsh',
  TIDAL_WETLAND: 'tidal_wetland',
} as const;

// Measurement Units
export const MEASUREMENT_UNITS = {
  LENGTH: ['cm', 'm', 'km'],
  AREA: ['cm²', 'm²', 'ha', 'km²'],
  VOLUME: ['ml', 'l', 'm³'],
  WEIGHT: ['g', 'kg', 't'],
  TEMPERATURE: ['°C', '°F'],
  PH: ['pH'],
  SALINITY: ['ppt', 'psu'],
  CARBON: ['g C', 'kg C', 't C', 'tCO2e'],
} as const;

// Camera Configuration
export const CAMERA_CONFIG = {
  QUALITY: 0.8,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  ALLOWS_EDITING: true,
};

// Location Configuration
export const LOCATION_CONFIG = {
  ACCURACY: 10, // meters
  TIMEOUT: 15000, // milliseconds
  MAXIMUM_AGE: 10000, // milliseconds
};

// Offline Configuration
export const OFFLINE_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_OFFLINE_ITEMS: 1000,
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NOTES_MAX_LENGTH: 1000,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  PERMISSION_ERROR: 'Permission denied. Please check app permissions.',
  LOCATION_ERROR: 'Unable to get location. Please enable location services.',
  CAMERA_ERROR: 'Camera error. Please check camera permissions.',
  UPLOAD_ERROR: 'Upload failed. Please try again.',
  SYNC_ERROR: 'Sync failed. Data will be synced when connection is restored.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  DATA_SAVED: 'Data saved successfully',
  DATA_UPLOADED: 'Data uploaded successfully',
  SYNC_SUCCESS: 'Data synced successfully',
  REPORT_SUBMITTED: 'Report submitted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
};

// Theme Configuration
export const theme: Theme = {
  colors: {
    primary: '#2E7D32', // Green
    secondary: '#1976D2', // Blue
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#F57C00',
    info: '#1976D2',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  typography: {
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 12,
  },
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_LATITUDE: 0,
  DEFAULT_LONGITUDE: 0,
  DEFAULT_LATITUDE_DELTA: 0.0922,
  DEFAULT_LONGITUDE_DELTA: 0.0421,
  ZOOM_LEVEL: 15,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_IMAGES_PER_FIELD_DATA: 10,
  MAX_ATTACHMENTS_PER_REPORT: 5,
};

// Animation Configuration
export const ANIMATION_CONFIG = {
  DURATION: 300,
  SPRING_CONFIG: {
    tension: 100,
    friction: 8,
  },
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Feature Flags
export const FEATURE_FLAGS = {
  OFFLINE_MODE: true,
  CAMERA_INTEGRATION: true,
  GPS_TRACKING: true,
  BLOCKCHAIN_INTEGRATION: true,
  PUSH_NOTIFICATIONS: true,
  BIOMETRIC_AUTH: false,
};

