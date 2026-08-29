import { ProfileRepository, UpdateProfileDTO } from '../repositories/profile.repository.js';
import { UserProfile } from '@bharatfarm/shared';

export class ProfileService {
  private repository: ProfileRepository;

  constructor() {
    this.repository = new ProfileRepository();
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.repository.getProfileById(userId);
    if (!profile) {
      throw new Error('PROFILE_NOT_FOUND');
    }
    return profile;
  }

  async updateProfile(userId: string, updates: UpdateProfileDTO): Promise<UserProfile> {
    // Validate land size bounds if provided
    if (updates.landSizeAcres !== undefined && (isNaN(updates.landSizeAcres) || updates.landSizeAcres < 0 || updates.landSizeAcres > 10000)) {
      throw new Error('INVALID_LAND_SIZE');
    }

    // Validate phone number format if provided
    if (updates.phone !== undefined && updates.phone.trim().length > 0) {
      const cleanPhone = updates.phone.trim();
      if (!/^\+?[0-9\s-]{8,15}$/.test(cleanPhone)) {
        throw new Error('INVALID_PHONE_NUMBER');
      }
    }

    return await this.repository.updateProfile(userId, updates);
  }
}
