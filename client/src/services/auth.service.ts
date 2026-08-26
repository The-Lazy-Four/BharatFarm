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
      ApiClient.setToken(res.data.accessToken || (res.data as any).token || null);
    }
    return res;
  }

  static async register(payload: RegisterPayload): Promise<ApiResponse<AuthSession>> {
    const res = await ApiClient.post<AuthSession>('/auth/register', payload);
    if (res.success && res.data) {
      ApiClient.setToken(res.data.accessToken || (res.data as any).token || null);
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
