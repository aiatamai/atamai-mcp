'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        api.setToken(token);
        const response = await api.getProfile();
        if (response.data) {
          setState({
            user: response.data as User,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Token is invalid
          api.clearToken();
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired',
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadUser();
  }, []);

  const register = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await api.request('/api/v1/auth/register', 'POST', {
        email,
        password,
      });

      if (response.data) {
        const data = response.data as any;
        api.setToken(data.access_token);
        setState({
          user: {
            id: data.id,
            email: data.email,
            tier: data.tier,
            created_at: new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Registration failed',
        }));
        return false;
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await api.request('/api/v1/auth/login', 'POST', {
        email,
        password,
      });

      if (response.data) {
        const data = response.data as any;
        api.setToken(data.access_token);
        setState({
          user: {
            id: data.id,
            email: data.email,
            tier: data.tier,
            created_at: new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Login failed',
        }));
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    api.clearToken();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    register,
    login,
    logout,
  };
}
