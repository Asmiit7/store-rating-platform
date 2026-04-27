import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

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

  useEffect(() => {
    if (token) {
      // Decode token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check if token is expired
        if (payload.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser({ id: payload.id, email: payload.email, role: payload.role });
          // Restore full user data from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const signup = async (data) => {
    const res = await api.post('/auth/signup', data);
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updatePassword = async (currentPassword, newPassword) => {
    await api.put('/auth/password', { currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
