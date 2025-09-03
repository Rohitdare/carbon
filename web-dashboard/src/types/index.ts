// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'government' | 'ngo' | 'researcher' | 'field_worker';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
  phone?: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  ecosystemType: EcosystemType;
  status: ProjectStatus;
  ownerId: string;
  owner?: User;
  boundary: GeoJSON.Polygon;
  areaHectares: number;
  startDate: string;
  endDate?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type EcosystemType = 'mangrove' | 'saltmarsh' | 'seagrass' | 'tidal_marsh';
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'suspended' | 'cancelled';

// MRV Report Types
export interface MRVReport {
  id: string;
  projectId: string;
  project?: Project;
  reportType: ReportType;
  reportingPeriod: string;
  data: ReportData;
  satelliteData?: SatelliteData;
  sensorData?: SensorData;
  fieldMeasurements?: FieldMeasurements;
  carbonEstimate?: number;
  status: ReportStatus;
  submittedBy: string;
  submittedByUser?: User;
  verifiedBy?: string;
  verifiedByUser?: User;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportType = 'baseline' | 'monitoring' | 'verification' | 'annual';
export type ReportStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface ReportData {
  methodology: string;
  dataSources: string[];
  qualityAssurance: string[];
  uncertainties: string[];
  additionalNotes?: string;
}

export interface SatelliteData {
  imageId: string;
  acquisitionDate: string;
  cloudCover: number;
  vegetationIndices: VegetationIndices;
  areaStatistics: AreaStatistics;
  geometry: GeoJSON.Polygon;
  processedAt: string;
}

export interface VegetationIndices {
  ndvi: number;
  evi: number;
  savi: number;
  ndwi: number;
  gci?: number;
}

export interface AreaStatistics {
  areaHectares: number;
  bandStatistics: Record<string, any>;
}

export interface SensorData {
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  salinity?: number;
  ph?: number;
  organicMatter?: number;
  timestamp: string;
}

export interface FieldMeasurements {
  biomassDensity?: number;
  canopyHeight?: number;
  stemDensity?: number;
  leafAreaIndex?: number;
  measurementDate: string;
  location: GeoJSON.Point;
  notes?: string;
}

// Carbon Credit Types
export interface CarbonCredit {
  id: string;
  projectId: string;
  project?: Project;
  creditId: string;
  amountTonnesCo2: number;
  status: CreditStatus;
  verificationStandard: string;
  vintageYear: number;
  issuanceDate?: string;
  expiryDate?: string;
  verifierId?: string;
  verifier?: User;
  verificationNotes?: string;
  blockchainTransactionHash?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type CreditStatus = 'pending' | 'issued' | 'transferred' | 'retired' | 'cancelled';

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

// Dashboard and Analytics Types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalCredits: number;
  issuedCredits: number;
  totalArea: number;
  carbonSequestration: number;
}

export interface ProjectStats {
  projectId: string;
  totalCredits: number;
  issuedCredits: number;
  areaHectares: number;
  carbonSequestration: number;
  lastReportDate?: string;
  nextReportDue?: string;
}

// Map and Geospatial Types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarker {
  id: string;
  position: [number, number];
  type: 'project' | 'sensor' | 'measurement';
  data: any;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'file';
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Chart and Visualization Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

// Filter and Search Types
export interface FilterOptions {
  ecosystemType?: EcosystemType[];
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  areaRange?: {
    min: number;
    max: number;
  };
}

export interface SearchParams {
  query?: string;
  filters?: FilterOptions;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

