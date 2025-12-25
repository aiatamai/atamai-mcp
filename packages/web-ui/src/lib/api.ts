/**
 * API client for Context7 backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'Request failed',
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Auth endpoints
  async register(email: string, password: string) {
    return this.request('/api/v1/auth/register', 'POST', { email, password });
  }

  async login(email: string, password: string) {
    return this.request('/api/v1/auth/login', 'POST', { email, password });
  }

  // Library endpoints
  async searchLibraries(query: string, ecosystem?: string, page: number = 1, limit: number = 20) {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString(),
    });
    if (ecosystem) params.append('ecosystem', ecosystem);
    return this.request('/api/v1/libraries', 'GET', undefined, {
      headers: {
        ...this.getHeaders(),
      },
    });
  }

  async getLibrary(libraryId: string) {
    return this.request(`/api/v1/libraries/${libraryId}`, 'GET');
  }

  async getEcosystems() {
    return this.request('/api/v1/libraries/ecosystems', 'GET');
  }

  // Documentation endpoints
  async getDocumentation(libraryId: string, topic?: string, page: number = 1, mode: 'code' | 'info' = 'code') {
    const params = new URLSearchParams({
      page: page.toString(),
      mode,
    });
    if (topic) params.append('topic', topic);
    return this.request(`/api/v1/docs/${libraryId}`, 'GET');
  }

  async searchDocumentation(query: string) {
    return this.request(`/api/v1/docs/search/${query}`, 'GET');
  }

  // User endpoints
  async getProfile() {
    return this.request('/api/v1/users/profile', 'GET');
  }

  async updateProfile(data: unknown) {
    return this.request('/api/v1/users/profile', 'PUT', data);
  }

  // API Key endpoints
  async generateApiKey(name: string) {
    return this.request('/api/v1/api-keys', 'POST', { name });
  }

  async getApiKeys() {
    return this.request('/api/v1/api-keys', 'GET');
  }

  async revokeApiKey(keyId: string) {
    return this.request(`/api/v1/api-keys/${keyId}`, 'DELETE');
  }

  // Admin endpoints
  async getStats() {
    return this.request('/api/v1/admin/stats', 'GET');
  }

  async getCrawlJobs() {
    return this.request('/api/v1/admin/jobs', 'GET');
  }

  async queueCrawl(libraryId: string, version: string) {
    return this.request('/api/v1/admin/crawl', 'POST', { libraryId, version });
  }
}

export const api = new ApiClient();
