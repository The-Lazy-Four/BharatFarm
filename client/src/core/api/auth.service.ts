import { ApiClient } from './apiClient.js';
import { AuthSession, ApiResponse } from '@bharatfarm/shared';

export interface RegisterPayload {
  email: string;
  password?: string;
  fullName: string;
  role?: string;
  state?: string;
  district?: string;
  phone?: string;
}

export class AuthService {
  static async login(email: string, password?: string): Promise<ApiResponse<AuthSession>> {
    const res = await ApiClient.post<AuthSession>('/auth/login', { email, password });
    if (res.success && res.data) {
      const token = res.data.accessToken || (res.data as unknown as Record<string, string>).token || null;
      ApiClient.setToken(token);
    }
    return res;
  }

  static async register(payload: RegisterPayload): Promise<ApiResponse<AuthSession>> {
    const res = await ApiClient.post<AuthSession>('/auth/register', payload);
    if (res.success && res.data) {
      const token = res.data.accessToken || (res.data as unknown as Record<string, string>).token || null;
      ApiClient.setToken(token);
    }
    return res;
  }

  static async getCurrentUser(): Promise<ApiResponse<{ user: AuthSession['user'] }>> {
    return ApiClient.get<{ user: AuthSession['user'] }>('/auth/me');
  }

  static logout() {
    ApiClient.setToken(null);
  }
}
