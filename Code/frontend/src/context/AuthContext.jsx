import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/v1/users/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user:', err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (username, password) => {
    const res = await axios.post('/api/v1/auth/login', { username, password });
    const { accessToken, refreshToken, ...userData } = res.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
    setUser(userData);
    return res.data;
  };

  const register = async (data) => {
    const res = await axios.post('/api/v1/auth/register', data);
    const { accessToken, refreshToken, ...userData } = res.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
