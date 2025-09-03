// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'field_worker' | 'ngo_admin' | 'government' | 'verifier';
  organization: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  ecosystemType: 'mangrove' | 'seagrass' | 'salt_marsh' | 'tidal_wetland';
  status: 'planning' | 'active' | 'monitoring' | 'completed' | 'cancelled';
  ownerId: string;
  boundary: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  areaHectares: number;
  startDate: string;
  endDate?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Field Data Types
export interface FieldData {
  id: string;
  projectId: string;
  fieldWorkerId: string;
  type: 'biomass' | 'soil' | 'water' | 'vegetation' | 'environmental';
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
  };
  measurements: Record<string, any>;
  images: string[];
  notes: string;
  timestamp: string;
  isUploaded: boolean;
  createdAt: string;
  updatedAt: string;
}

// MRV Report Types
export interface MRVReport {
  id: string;
  projectId: string;
  title: string;
  description: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  carbonEstimate: {
    amount: number;
    unit: 'tCO2e';
    methodology: string;
    confidence: 'low' | 'medium' | 'high';
  };
  fieldData: FieldData[];
  attachments: string[];
  submittedBy: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

// Carbon Credit Types
export interface CarbonCredit {
  id: string;
  projectId: string;
  ownerId: string;
  amount: number;
  type: string;
  status: 'pending' | 'issued' | 'transferred' | 'retired';
  issuedDate: string;
  expiryDate: string;
  verificationId: string;
  mrvReportId: string;
  blockchainHash: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Projects: undefined;
  ProjectDetail: { projectId: string };
  FieldData: { projectId: string };
  FieldDataForm: { projectId: string; type?: string };
  FieldDataDetail: { dataId: string };
  MRVReports: { projectId: string };
  MRVReportForm: { projectId: string; reportId?: string };
  MRVReportDetail: { reportId: string };
  Profile: undefined;
  Settings: undefined;
  OfflineData: undefined;
  Camera: { type: 'field_data' | 'mrv_report'; projectId: string };
  Map: { projectId?: string; dataId?: string };
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization: string;
  role: string;
}

export interface FieldDataForm {
  type: string;
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  measurements: Record<string, any>;
  notes: string;
  images: string[];
}

export interface MRVReportForm {
  title: string;
  description: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  fieldData: string[];
  attachments: string[];
}

// Location Types
export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
}

// Camera Types
export interface CameraOptions {
  mediaType: 'photo' | 'video';
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  allowsEditing?: boolean;
}

// Offline Types
export interface OfflineData {
  id: string;
  type: 'field_data' | 'mrv_report';
  data: any;
  isUploaded: boolean;
  createdAt: string;
  retryCount: number;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
  };
}

