import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = api.getToken();
    if (token) {
      // Validate token by trying to get dashboard stats
      api.getDashboardStats()
        .then(res => {
          setIsAuthenticated(true);
          const savedUser = localStorage.getItem('auth_user');
          if (savedUser) setUser(JSON.parse(savedUser));
        })
        .catch(() => {
          api.setToken(null);
          localStorage.removeItem('auth_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.login(email, password);
    api.setToken(response.data.token);
    setUser(response.data.user);
    setIsAuthenticated(true);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    return response;
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
