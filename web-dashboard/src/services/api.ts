import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const AI_ML_API_URL = process.env.REACT_APP_AI_ML_API_URL || 'http://localhost:8000/api/v1';

// Create axios instances
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const aiMlClient: AxiosInstance = axios.create({
  baseURL: AI_ML_API_URL,
  timeout: 60000, // Longer timeout for AI/ML operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

aiMlClient.interceptors.request.use(
  (config) => {
    const apiKey = process.env.REACT_APP_AI_ML_API_KEY || 'your-api-key-here';
    config.headers.Authorization = `Bearer ${apiKey}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
const handleResponseError = (error: AxiosError) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        break;
      case 403:
        toast.error('Access denied. You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 422:
        // Validation errors
        if (data && typeof data === 'object' && 'errors' in data) {
          const errors = (data as any).errors;
          Object.values(errors).forEach((error: any) => {
            if (Array.isArray(error)) {
              error.forEach((msg: string) => toast.error(msg));
            } else {
              toast.error(error);
            }
          });
        } else {
          toast.error('Validation failed. Please check your input.');
        }
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error('An unexpected error occurred.');
    }
  } else if (error.request) {
    toast.error('Network error. Please check your connection.');
  } else {
    toast.error('An unexpected error occurred.');
  }
  
  return Promise.reject(error);
};

apiClient.interceptors.response.use(
  (response) => response,
  handleResponseError
);

aiMlClient.interceptors.response.use(
  (response) => response,
  handleResponseError
);

// Generic API methods
export const api = {
  get: <T>(url: string, params?: any): Promise<AxiosResponse<T>> =>
    apiClient.get(url, { params }),
  
  post: <T>(url: string, data?: any): Promise<AxiosResponse<T>> =>
    apiClient.post(url, data),
  
  put: <T>(url: string, data?: any): Promise<AxiosResponse<T>> =>
    apiClient.put(url, data),
  
  patch: <T>(url: string, data?: any): Promise<AxiosResponse<T>> =>
    apiClient.patch(url, data),
  
  delete: <T>(url: string): Promise<AxiosResponse<T>> =>
    apiClient.delete(url),
};

// AI/ML API methods
export const aiMlApi = {
  get: <T>(url: string, params?: any): Promise<AxiosResponse<T>> =>
    aiMlClient.get(url, { params }),
  
  post: <T>(url: string, data?: any): Promise<AxiosResponse<T>> =>
    aiMlClient.post(url, data),
  
  put: <T>(url: string, data?: any): Promise<AxiosResponse<T>> =>
    aiMlClient.put(url, data),
  
  patch: <T>(url: string, data?: any): Promise<AxiosResponse<T>> =>
    aiMlClient.patch(url, data),
  
  delete: <T>(url: string): Promise<AxiosResponse<T>> =>
    aiMlClient.delete(url),
};

export default api;

