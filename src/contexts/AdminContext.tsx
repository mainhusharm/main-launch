import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../api';

interface AdminUser {
  username: string;
  isAuthenticated: boolean;
  loginTime?: Date;
}

interface AdminContextType {
  admin: AdminUser | null;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const validateToken = async (token: string) => {
    try {
      const response = await api.post('/admin/validate-token');
      return response.status === 200;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('admin_token');
      const username = localStorage.getItem('admin_username');
      if (token && username) {
        const isValid = await validateToken(token);
        if (isValid) {
          setAdmin({
            username: username,
            isAuthenticated: true,
          });
        } else {
          logout();
        }
      }
    };
    checkToken();
  }, []);

  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    try {
      const response = await api.post('/admin/login', credentials);

      if (response.status === 200) {
        const { access_token } = response.data;
        localStorage.setItem('admin_token', access_token);
        localStorage.setItem('admin_username', credentials.username);
        setAdmin({
          username: credentials.username,
          isAuthenticated: true,
          loginTime: new Date(),
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
