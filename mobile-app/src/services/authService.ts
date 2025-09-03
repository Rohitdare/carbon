import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';
import { STORAGE_KEYS } from '../constants';
import { User, LoginForm, RegisterForm, ApiResponse } from '../types';

class AuthService {
  async login(credentials: LoginForm): Promise<{ user: User; token: string }> {
    const response = await apiService.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials
    );

    if (response.success) {
      const { user, token } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return { user, token };
    } else {
      throw new Error(response.message || 'Login failed');
    }
  }

  async register(userData: RegisterForm): Promise<{ user: User; token: string }> {
    const response = await apiService.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      userData
    );

    if (response.success) {
      const { user, token } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return { user, token };
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear stored data
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiService.post<ApiResponse<{ token: string }>>('/auth/refresh');
    
    if (response.success) {
      const { token } = response.data;
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      return { token };
    } else {
      throw new Error(response.message || 'Token refresh failed');
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>('/auth/profile', userData);
    
    if (response.success) {
      const user = response.data;
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return user;
    } else {
      throw new Error(response.message || 'Profile update failed');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiService.put<ApiResponse<void>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Password change failed');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiService.post<ApiResponse<void>>('/auth/forgot-password', { email });
    
    if (!response.success) {
      throw new Error(response.message || 'Password reset request failed');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiService.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      newPassword,
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Password reset failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    const user = await this.getCurrentUser();
    return !!(token && user);
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await apiService.get<ApiResponse<{ valid: boolean }>>('/auth/verify');
      return response.success && response.data.valid;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;

