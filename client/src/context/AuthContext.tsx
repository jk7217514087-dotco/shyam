import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  quickLoginAsDemo: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('smartbin_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('smartbin_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      localStorage.removeItem('smartbin_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const data = await api.login(credentials);
      if (data.success && data.token) {
        localStorage.setItem('smartbin_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  const quickLoginAsDemo = async (email: string, password: string): Promise<boolean> => {
    const res = await login({ email, password });
    return res.success;
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    try {
      const res = await api.register(data);
      if (res.success && res.token) {
        localStorage.setItem('smartbin_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('smartbin_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        quickLoginAsDemo,
        register,
        logout,
        refreshUser,
      }}
    >
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
