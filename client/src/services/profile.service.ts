import { ApiClient } from './apiClient.js';
import { ApiResponse, UserProfile } from '@bharatfarm/shared';

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  state?: string;
  district?: string;
  landSizeAcres?: number;
  primaryCrops?: string[];
  preferredLanguage?: string;
  avatarUrl?: string;
}

export class ProfileService {
  /**
   * Get current authenticated user's Farmer Profile
   */
  static async getProfile(): Promise<ApiResponse<UserProfile>> {
    return ApiClient.get<UserProfile>('/profile');
  }

  /**
   * Update farmer profile details & agricultural context
   */
  static async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> {
    return ApiClient.patch<UserProfile>('/profile', payload);
  }
}
