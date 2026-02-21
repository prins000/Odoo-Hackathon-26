import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout, checkSessionExpiry } from '../store/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check session expiry periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(checkSessionExpiry());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [dispatch]);

  const login = async (email, password) => {
    try {
      dispatch(loginStart());
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      });

      const { user, token } = response.data.data;
      
      // Calculate session expiry (24 hours from now)
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 24);

      dispatch(loginSuccess({
        user,
        token,
        sessionExpiry: sessionExpiry.toISOString()
      }));

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch(loginStart());
      const response = await axios.post('http://localhost:3000/api/auth/register', userData);

      const { user, token } = response.data.data;
      
      // Calculate session expiry (24 hours from now)
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 24);

      dispatch(loginSuccess({
        user,
        token,
        sessionExpiry: sessionExpiry.toISOString()
      }));

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logoutUser = () => {
    dispatch(logout());
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const clearError = () => {
    dispatch({ type: 'auth/clearError' });
  };

  const updateUserProfile = async (userData) => {
    try {
      const response = await axios.put('http://localhost:3000/api/auth/profile', userData);
      dispatch({ type: 'auth/updateUser', payload: response.data.data });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: logoutUser,
    clearError,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
