import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/user', {
        skipAuthRedirect: true,
        timeout: 7000
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const logout = useCallback(async () => {
    try {
      await api.get('/auth/logout');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const googleLogin = useCallback(() => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  }, []);

  const loginWithEmail = useCallback(async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password }, { skipAuthRedirect: true });
    setUser(response.data);
    return response.data;
  }, []);

  const signupWithEmail = useCallback(async ({ name, email, password }) => {
    const response = await api.post('/auth/signup', { name, email, password }, { skipAuthRedirect: true });
    setUser(response.data);
    return response.data;
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser || null);
  }, []);

  const value = {
    user,
    loading,
    logout,
    googleLogin,
    loginWithEmail,
    signupWithEmail,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
