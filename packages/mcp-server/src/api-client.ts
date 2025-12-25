import axios, { AxiosInstance, AxiosError } from 'axios';

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.BACKEND_API_URL || 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });
  }

  setApiKey(apiKey: string) {
    this.client.defaults.headers.common['x-api-key'] = apiKey;
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async searchLibraries(query: string, ecosystem?: string) {
    try {
      const params: any = { query };
      if (ecosystem) {
        params.ecosystem = ecosystem;
      }

      const response = await this.client.get('/api/v1/libraries', { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getLibrary(id: string) {
    try {
      const response = await this.client.get(`/api/v1/libraries/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDocumentation(libraryId: string, topic?: string, page: number = 1, mode: 'code' | 'info' = 'code') {
    try {
      const params: any = { page, mode };
      if (topic) {
        params.topic = topic;
      }

      const response = await this.client.get(`/api/v1/docs/${libraryId}`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchDocumentation(query: string) {
    try {
      const response = await this.client.get(`/api/v1/docs/search/${query}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async validateApiKey(apiKey: string) {
    try {
      this.setApiKey(apiKey);
      const response = await this.client.get('/api/v1/auth/validate');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(`API Error: ${axiosError.message}`);
      if (axiosError.response) {
        console.error(`Status: ${axiosError.response.status}`);
        console.error(`Data:`, axiosError.response.data);
      }
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
}
