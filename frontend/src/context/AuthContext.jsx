import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nuru_token');
      const storedUser = localStorage.getItem('nuru_user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const { data } = await authApi.getMe();
          setUser(data.user);
        } catch {
          localStorage.removeItem('nuru_token');
          localStorage.removeItem('nuru_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const { data } = await authApi.loginUser(credentials);
    localStorage.setItem('nuru_token', data.token);
    localStorage.setItem('nuru_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authApi.registerUser(formData);
    localStorage.setItem('nuru_token', data.token);
    localStorage.setItem('nuru_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('nuru_token');
    localStorage.removeItem('nuru_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
