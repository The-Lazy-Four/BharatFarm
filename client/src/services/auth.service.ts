import { ApiClient } from './apiClient.js';
import { AuthSession } from '@bharatfarm/shared';

export class AuthService {
  static async login(email: string): Promise<AuthSession | null> {
    const res = await ApiClient.post<AuthSession>('/auth/login', { email });
    if (res.success && res.data) {
      ApiClient.setToken(res.data.accessToken || 'mock-token');
      return res.data;
    }
    return null;
  }

  static logout() {
    ApiClient.setToken(null);
  }
}
