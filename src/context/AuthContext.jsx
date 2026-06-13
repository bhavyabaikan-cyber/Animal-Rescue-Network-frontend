import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (on page load)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/check-auth');
        setUser(res.data.payload);
      } catch (err) {
        // Not authenticated - that's okay
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    setUser(res.data.payload);
    return res.data;
  };

  // Register function (with image upload support)
  const register = async (formData) => {
    await api.post('/auth/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  // Logout function
  const logout = async () => {
    await api.get('/auth/logout');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};