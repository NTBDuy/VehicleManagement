import { BaseApiClient } from '@/services/baseApiClient';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthService } from 'services/authService';
import { LoginRequest } from 'types/LoginRequest';
import { showToast } from 'utils/toast';
import { useQueryClient } from '@tanstack/react-query';

import User from 'types/User';
import { LoginResponse } from '@/types/LoginResponse';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  setUser: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuthStatus();
    BaseApiClient.setUnauthorizedHandler(() => {
      handleUnauthorized();
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedUser = await AuthService.getUser();
      const isAuth = await AuthService.isAuthenticated();

      if (isAuth && savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnauthorized = async () => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error during forced logout:', error);
      setUser(null);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await AuthService.login(credentials);

      if ('success' in response && response.success === false) {
        switch (response.statusCode) {
          case 423:
            showToast.error(t('common.error.accountLocked'));
            break;
          case 401:
            showToast.error(t('common.error.invalidCredentials'));
            break;
          case 410:
            showToast.error(t('common.error.410Request'));
            break;
          case 400:
            showToast.error(t('common.error.badRequest'));
            break;
          default:
            showToast.error(t('common.error.title'), t('common.error.generic'));
            break;
        }
        return;
      }

      const loginData = response as LoginResponse;

      showToast.success(`${t('common.success.login', { user: loginData.user.fullName })}!`);
      setUser(loginData.user);
    } catch (error) {
      console.error('Login error:', error);
      showToast.error(t('common.error.title'), t('common.error.network'));
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      showToast.success(t('common.success.logout'));
      await Promise.all([
        queryClient.removeQueries({ queryKey: ['history'] }),
        queryClient.removeQueries({ queryKey: ['notifications'] }),
      ]);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      showToast.error(`${t('common.error.title')}`, `${t('common.error.generic')}`);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: user !== null,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
