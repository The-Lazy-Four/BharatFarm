import { ApiResponse } from '@bharatfarm/shared';

const getBaseUrl = (): string => {
  const envApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (envApiUrl) {
    const trimmed = String(envApiUrl).trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
};

const BASE_URL = getBaseUrl();

export class ApiClient {
  private static token: string | null = localStorage.getItem('auth_token');

  static setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }

  private static getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  static async get<T>(path: string): Promise<ApiResponse<T>> {
    const fullUrl = `${BASE_URL}${path}`;
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return {
          success: false,
          error: { code: `HTTP_${response.status}`, message: `GET ${fullUrl} failed with status ${response.status}: ${text}` }
        };
      }
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: `GET ${fullUrl} network failure: ${error?.message || 'Failed to connect to server'}` }
      };
    }
  }

  static async post<T>(path: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: error.message || 'Failed to connect to server' }
      };
    }
  }

  static async patch<T>(path: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: error.message || 'Failed to connect to server' }
      };
    }
  }

  static async delete<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: error.message || 'Failed to connect to server' }
      };
    }
  }
}
