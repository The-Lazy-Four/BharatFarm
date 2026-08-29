import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware.js';
import { ProfileService } from '../services/profile.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

export class ProfileController {
  private service: ProfileService;

  constructor() {
    this.service = new ProfileService();
  }

  getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 'UNAUTHORIZED', 401);
      }

      const profile = await this.service.getProfile(userId);
      return ApiResponse.success(res, profile, 'Profile retrieved successfully');
    } catch (err: any) {
      if (err.message === 'PROFILE_NOT_FOUND') {
        return ApiResponse.error(res, 'Farmer profile not found', 'NOT_FOUND', 404);
      }
      return ApiResponse.error(res, err.message || 'Failed to retrieve profile', 'SERVER_ERROR', 500);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 'UNAUTHORIZED', 401);
      }

      const { fullName, phone, state, district, landSizeAcres, primaryCrops, preferredLanguage, avatarUrl } = req.body;

      const updates: any = {};
      if (fullName !== undefined) updates.fullName = String(fullName).trim();
      if (phone !== undefined) updates.phone = String(phone).trim();
      if (state !== undefined) updates.state = String(state).trim();
      if (district !== undefined) updates.district = String(district).trim();
      if (landSizeAcres !== undefined) updates.landSizeAcres = Number(landSizeAcres);
      if (primaryCrops !== undefined) {
        updates.primaryCrops = Array.isArray(primaryCrops)
          ? primaryCrops.map((c: any) => String(c).trim()).filter(Boolean)
          : String(primaryCrops).split(',').map((c: string) => c.trim()).filter(Boolean);
      }
      if (preferredLanguage !== undefined) updates.preferredLanguage = String(preferredLanguage).trim();
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl ? String(avatarUrl) : undefined;

      const updatedProfile = await this.service.updateProfile(userId, updates);
      return ApiResponse.success(res, updatedProfile, 'Profile updated successfully');
    } catch (err: any) {
      if (err.message === 'INVALID_LAND_SIZE') {
        return ApiResponse.error(res, 'Land size must be a valid positive number of acres (0 - 10,000)', 'VALIDATION_ERROR', 400);
      }
      if (err.message === 'INVALID_PHONE_NUMBER') {
        return ApiResponse.error(res, 'Phone number format is invalid', 'VALIDATION_ERROR', 400);
      }
      return ApiResponse.error(res, err.message || 'Failed to update profile', 'SERVER_ERROR', 500);
    }
  };
}
