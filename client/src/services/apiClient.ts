import { ApiResponse } from '@bharatfarm/shared';

const BASE_URL = '/api';
const IS_DEVELOPMENT = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

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

  private static logInvalidResponse(response: Response, text: string) {
    if (IS_DEVELOPMENT) {
      console.warn('[ApiClient] Unexpected API response', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        bodyLength: text.length
      });
    }
  }

  private static async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let text = '';
    try {
      text = await response.text();
    } catch {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: 'Failed to read response from server.' }
      };
    }

    const body = text.trim();
    const contentType = response.headers.get('content-type') || '';
    const isJsonResponse = contentType.toLowerCase().includes('application/json');
    let data: ApiResponse<T> | undefined;

    if (body && isJsonResponse) {
      try {
        data = JSON.parse(body) as ApiResponse<T>;
      } catch {
        this.logInvalidResponse(response, text);
        return {
          success: false,
          error: { code: 'PARSE_ERROR', message: 'Server returned an invalid JSON response.' }
        };
      }
    }

    if (!response.ok) {
      // Preserve the backend's structured error contract when it is valid.
      if (data && data.success === false && data.error && typeof data.error.message === 'string') {
        return data;
      }
      this.logInvalidResponse(response, text);
      return {
        success: false,
        error: { code: 'HTTP_ERROR', message: 'The server could not complete this request.' }
      };
    }

    // All successful BharatFarm API endpoints use the ApiResponse JSON envelope.
    if (!body || !isJsonResponse || !data || typeof data.success !== 'boolean') {
      this.logInvalidResponse(response, text);
      return {
        success: false,
        error: { code: 'INVALID_RESPONSE', message: 'Server returned an empty or invalid response.' }
      };
    }

    return data;
  }

  static async get<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: error.message || 'Failed to connect to server' }
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
      return await this.handleResponse<T>(response);
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
      return await this.handleResponse<T>(response);
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
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: error.message || 'Failed to connect to server' }
      };
    }
  }
}
