import { FieldData, MRVReport, Project } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateProject = (project: Partial<Project>): ValidationResult => {
  const errors: string[] = [];

  if (!project.name || project.name.trim().length === 0) {
    errors.push('Project name is required');
  }

  if (!project.description || project.description.trim().length === 0) {
    errors.push('Project description is required');
  }

  if (!project.location || !project.location.coordinates) {
    errors.push('Project location is required');
  } else {
    const { latitude, longitude } = project.location.coordinates;
    if (latitude < -90 || latitude > 90) {
      errors.push('Invalid latitude value');
    }
    if (longitude < -180 || longitude > 180) {
      errors.push('Invalid longitude value');
    }
  }

  if (!project.ecosystemType || project.ecosystemType.trim().length === 0) {
    errors.push('Ecosystem type is required');
  }

  if (!project.startDate) {
    errors.push('Project start date is required');
  }

  if (project.endDate && project.startDate && new Date(project.endDate) <= new Date(project.startDate)) {
    errors.push('End date must be after start date');
  }

  if (!project.organizationId || project.organizationId.trim().length === 0) {
    errors.push('Organization ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateFieldData = (fieldData: Partial<FieldData>): ValidationResult => {
  const errors: string[] = [];

  if (!fieldData.projectId || fieldData.projectId.trim().length === 0) {
    errors.push('Project ID is required');
  }

  if (!fieldData.dataType || fieldData.dataType.trim().length === 0) {
    errors.push('Data type is required');
  }

  if (!fieldData.location || !fieldData.location.coordinates) {
    errors.push('Location is required');
  } else {
    const { latitude, longitude } = fieldData.location.coordinates;
    if (latitude < -90 || latitude > 90) {
      errors.push('Invalid latitude value');
    }
    if (longitude < -180 || longitude > 180) {
      errors.push('Invalid longitude value');
    }
  }

  if (!fieldData.timestamp) {
    errors.push('Timestamp is required');
  }

  if (!fieldData.collectedBy || fieldData.collectedBy.trim().length === 0) {
    errors.push('Collector information is required');
  }

  // Validate specific data types
  if (fieldData.dataType === 'soil' && !fieldData.soilData) {
    errors.push('Soil data is required for soil data type');
  }

  if (fieldData.dataType === 'water' && !fieldData.waterData) {
    errors.push('Water data is required for water data type');
  }

  if (fieldData.dataType === 'biomass' && !fieldData.biomassData) {
    errors.push('Biomass data is required for biomass data type');
  }

  if (fieldData.dataType === 'satellite' && !fieldData.satelliteData) {
    errors.push('Satellite data is required for satellite data type');
  }

  // Validate measurements
  if (fieldData.measurements && fieldData.measurements.length === 0) {
    errors.push('At least one measurement is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMRVReport = (report: Partial<MRVReport>): ValidationResult => {
  const errors: string[] = [];

  if (!report.projectId || report.projectId.trim().length === 0) {
    errors.push('Project ID is required');
  }

  if (!report.reportType || report.reportType.trim().length === 0) {
    errors.push('Report type is required');
  }

  if (!report.reportingPeriod || !report.reportingPeriod.start || !report.reportingPeriod.end) {
    errors.push('Reporting period is required');
  } else {
    if (new Date(report.reportingPeriod.end) <= new Date(report.reportingPeriod.start)) {
      errors.push('Reporting period end date must be after start date');
    }
  }

  if (!report.carbonEstimate || report.carbonEstimate.amount <= 0) {
    errors.push('Valid carbon estimate is required');
  }

  if (!report.methodology || report.methodology.trim().length === 0) {
    errors.push('Methodology is required');
  }

  if (!report.dataSources || report.dataSources.length === 0) {
    errors.push('At least one data source is required');
  }

  if (!report.qualityAssurance || report.qualityAssurance.length === 0) {
    errors.push('Quality assurance information is required');
  }

  if (!report.submittedBy || report.submittedBy.trim().length === 0) {
    errors.push('Submitter information is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateCoordinates = (latitude: number, longitude: number): ValidationResult => {
  const errors: string[] = [];

  if (latitude < -90 || latitude > 90) {
    errors.push('Latitude must be between -90 and 90 degrees');
  }

  if (longitude < -180 || longitude > 180) {
    errors.push('Longitude must be between -180 and 180 degrees');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMeasurement = (measurement: any): ValidationResult => {
  const errors: string[] = [];

  if (!measurement.parameter || measurement.parameter.trim().length === 0) {
    errors.push('Measurement parameter is required');
  }

  if (measurement.value === undefined || measurement.value === null) {
    errors.push('Measurement value is required');
  }

  if (typeof measurement.value !== 'number' || isNaN(measurement.value)) {
    errors.push('Measurement value must be a valid number');
  }

  if (!measurement.unit || measurement.unit.trim().length === 0) {
    errors.push('Measurement unit is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateFileUpload = (file: any): ValidationResult => {
  const errors: string[] = [];

  if (!file || !file.uri) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size && file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (file.type && !allowedTypes.includes(file.type)) {
    errors.push('File type not supported');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push('Password is required');
  } else {
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

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  const errors: string[] = [];
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;

  if (!phoneNumber || phoneNumber.trim().length === 0) {
    errors.push('Phone number is required');
  } else if (!phoneRegex.test(phoneNumber)) {
    errors.push('Invalid phone number format');
  } else if (phoneNumber.replace(/\D/g, '').length < 10) {
    errors.push('Phone number must be at least 10 digits');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];

  if (value === undefined || value === null || value === '') {
    errors.push(`${fieldName} is required`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  const errors: string[] = [];

  if (!value || value.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): ValidationResult => {
  const errors: string[] = [];

  if (value && value.length > maxLength) {
    errors.push(`${fieldName} must be no more than ${maxLength} characters long`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateNumericRange = (value: number, min: number, max: number, fieldName: string): ValidationResult => {
  const errors: string[] = [];

  if (value < min || value > max) {
    errors.push(`${fieldName} must be between ${min} and ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

