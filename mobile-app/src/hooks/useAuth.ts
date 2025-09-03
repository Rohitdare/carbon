import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { login, logout, register, updateProfile, changePassword } from '../store/slices/authSlice';
import { User, LoginCredentials, RegisterData, UpdateProfileData, ChangePasswordData } from '../types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleRegister = useCallback(async (userData: RegisterData) => {
    try {
      const result = await dispatch(register(userData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleUpdateProfile = useCallback(async (profileData: UpdateProfileData) => {
    try {
      const result = await dispatch(updateProfile(profileData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleChangePassword = useCallback(async (passwordData: ChangePasswordData) => {
    try {
      const result = await dispatch(changePassword(passwordData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
  };
};

