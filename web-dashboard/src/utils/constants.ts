// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
export const AI_ML_API_URL = process.env.REACT_APP_AI_ML_API_URL || 'http://localhost:8000';

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  GOVERNMENT: 'government',
  NGO: 'ngo',
  RESEARCHER: 'researcher',
  FIELD_WORKER: 'field_worker'
} as const;

export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.GOVERNMENT]: 'Government Official',
  [USER_ROLES.NGO]: 'NGO Representative',
  [USER_ROLES.RESEARCHER]: 'Researcher',
  [USER_ROLES.FIELD_WORKER]: 'Field Worker'
} as const;

// Project Status
export const PROJECT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const PROJECT_STATUS_DISPLAY = {
  [PROJECT_STATUS.PENDING]: 'Pending',
  [PROJECT_STATUS.ACTIVE]: 'Active',
  [PROJECT_STATUS.COMPLETED]: 'Completed',
  [PROJECT_STATUS.CANCELLED]: 'Cancelled'
} as const;

// MRV Report Status
export const MRV_REPORT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const;

export const MRV_REPORT_STATUS_DISPLAY = {
  [MRV_REPORT_STATUS.DRAFT]: 'Draft',
  [MRV_REPORT_STATUS.SUBMITTED]: 'Submitted',
  [MRV_REPORT_STATUS.UNDER_REVIEW]: 'Under Review',
  [MRV_REPORT_STATUS.VERIFIED]: 'Verified',
  [MRV_REPORT_STATUS.REJECTED]: 'Rejected'
} as const;

// Carbon Credit Status
export const CARBON_CREDIT_STATUS = {
  PENDING: 'pending',
  ISSUED: 'issued',
  TRANSFERRED: 'transferred',
  RETIRED: 'retired'
} as const;

export const CARBON_CREDIT_STATUS_DISPLAY = {
  [CARBON_CREDIT_STATUS.PENDING]: 'Pending',
  [CARBON_CREDIT_STATUS.ISSUED]: 'Issued',
  [CARBON_CREDIT_STATUS.TRANSFERRED]: 'Transferred',
  [CARBON_CREDIT_STATUS.RETIRED]: 'Retired'
} as const;

// Carbon Credit Types
export const CARBON_CREDIT_TYPES = {
  BLUE_CARBON: 'blue_carbon',
  MANGROVE: 'mangrove',
  SEAGRASS: 'seagrass',
  SALT_MARSH: 'salt_marsh',
  KELP: 'kelp'
} as const;

export const CARBON_CREDIT_TYPE_DISPLAY = {
  [CARBON_CREDIT_TYPES.BLUE_CARBON]: 'Blue Carbon',
  [CARBON_CREDIT_TYPES.MANGROVE]: 'Mangrove',
  [CARBON_CREDIT_TYPES.SEAGRASS]: 'Seagrass',
  [CARBON_CREDIT_TYPES.SALT_MARSH]: 'Salt Marsh',
  [CARBON_CREDIT_TYPES.KELP]: 'Kelp'
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  ORGANIZATION_MAX_LENGTH: 200,
  PHONE_PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm'
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 10,
  DEFAULT_CENTER: {
    lat: 0,
    lng: 0
  },
  MAX_ZOOM: 18,
  MIN_ZOOM: 2
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    CSV: ['text/csv', 'application/csv']
  }
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#0ea5e9',
  SECONDARY: '#22c55e',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  GRAY: '#6b7280'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const;

// Environment
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  BLOCKCHAIN_INTEGRATION: process.env.REACT_APP_ENABLE_BLOCKCHAIN === 'true',
  AI_ML_INTEGRATION: process.env.REACT_APP_ENABLE_AI_ML === 'true',
  MOBILE_APP: process.env.REACT_APP_ENABLE_MOBILE === 'true',
  ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true'
} as const;

