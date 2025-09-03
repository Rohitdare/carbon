import { api } from './api';
import { User, LoginRequest, RegisterRequest, AuthState } from '@/types';

export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<AuthState> {
    const response = await api.post<{ user: User; token: string }>('/auth/login', credentials);
    const { user, token } = response.data;
    
    // Store token and user data
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    };
  }

  // Register new user
  static async register(userData: RegisterRequest): Promise<AuthState> {
    const response = await api.post<{ user: User; token: string }>('/auth/register', userData);
    const { user, token } = response.data;
    
    // Store token and user data
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    };
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  // Refresh token
  static async refreshToken(): Promise<string> {
    const response = await api.post<{ token: string }>('/auth/refresh');
    const { token } = response.data;
    
    localStorage.setItem('authToken', token);
    return token;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get stored user data
  static getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    return null;
  }

  // Get stored token
  static getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Initialize auth state from storage
  static initializeAuthState(): AuthState {
    const user = this.getStoredUser();
    const token = this.getStoredToken();
    
    return {
      user,
      token,
      isAuthenticated: !!(user && token),
      isLoading: false,
    };
  }

  // Update user profile
  static async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', userData);
    const updatedUser = response.data;
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  // Reset password
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  // Verify email
  static async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  }

  // Resend verification email
  static async resendVerificationEmail(): Promise<void> {
    await api.post('/auth/resend-verification');
  }
}

