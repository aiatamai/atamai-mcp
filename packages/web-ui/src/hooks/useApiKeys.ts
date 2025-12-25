'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  tier: string;
  rate_limit_rpm: number;
  rate_limit_rpd: number;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
}

export interface ApiKeyState {
  keys: ApiKey[];
  isLoading: boolean;
  error: string | null;
}

export function useApiKeys() {
  const [state, setState] = useState<ApiKeyState>({
    keys: [],
    isLoading: false,
    error: null,
  });

  const fetchKeys = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const response = await api.getApiKeys();

    if (response.data) {
      setState({
        keys: response.data as ApiKey[],
        isLoading: false,
        error: null,
      });
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: response.error || 'Failed to fetch API keys',
      }));
    }
  }, []);

  const generateKey = useCallback(async (name: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const response = await api.generateApiKey(name);

    if (response.data) {
      // Refetch keys after generation
      await fetchKeys();
      return response.data;
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: response.error || 'Failed to generate API key',
      }));
      return null;
    }
  }, [fetchKeys]);

  const revokeKey = useCallback(
    async (keyId: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await api.revokeApiKey(keyId);

      if (response.data) {
        // Remove key from state
        setState((prev) => ({
          ...prev,
          keys: prev.keys.filter((k) => k.id !== keyId),
          isLoading: false,
          error: null,
        }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Failed to revoke API key',
        }));
        return false;
      }
    },
    []
  );

  return {
    ...state,
    fetchKeys,
    generateKey,
    revokeKey,
  };
}
