import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { login, register, logout } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const loginUser = async (credentials: { email: string; password: string }) => {
    return dispatch(login(credentials)).unwrap();
  };

  const registerUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    organization: string;
    phone: string;
    country: string;
  }) => {
    return dispatch(register(userData)).unwrap();
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return user?.role && roles.includes(user.role);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isGovernment = () => {
    return user?.role === 'government';
  };

  const isNGO = () => {
    return user?.role === 'ngo';
  };

  const isResearcher = () => {
    return user?.role === 'researcher';
  };

  const isFieldWorker = () => {
    return user?.role === 'field_worker';
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginUser,
    registerUser,
    logoutUser,
    hasRole,
    hasAnyRole,
    isAdmin,
    isGovernment,
    isNGO,
    isResearcher,
    isFieldWorker
  };
};

