import { UserProfile } from '@bharatfarm/shared';
import { getSupabaseAdminClient, getSupabaseClient } from '../../../config/supabase.js';
import { config } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

export interface UpdateProfileDTO {
  fullName?: string;
  phone?: string;
  state?: string;
  district?: string;
  landSizeAcres?: number;
  primaryCrops?: string[];
  preferredLanguage?: string;
  avatarUrl?: string;
}

// In-memory cache store for mock mode or fallback
const mockProfiles = new Map<string, UserProfile>();

export class ProfileRepository {
  /**
   * Helper to format raw Supabase profile row into shared UserProfile contract
   */
  private mapRowToProfile(row: any): UserProfile {
    const rawCrops = row.primary_crops;
    let cropsArray: string[] = ['Wheat', 'Rice'];
    if (Array.isArray(rawCrops)) {
      cropsArray = rawCrops;
    } else if (typeof rawCrops === 'string') {
      try {
        cropsArray = JSON.parse(rawCrops);
      } catch {
        cropsArray = rawCrops.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    return {
      id: row.id,
      fullName: row.full_name || 'Ramesh Patel',
      email: row.email || 'farmer@bharatfarm.org',
      role: row.role || 'farmer',
      avatarUrl: row.avatar_url || undefined,
      phoneNumber: row.phone || undefined,
      state: row.state || 'Punjab',
      district: row.district || 'Ludhiana',
      location: {
        state: row.state || 'Punjab',
        district: row.district || 'Ludhiana',
        pincode: row.pincode || '141001'
      },
      landSizeAcres: row.land_size_acres != null ? Number(row.land_size_acres) : 5.0,
      primaryCrops: cropsArray,
      preferredLanguage: row.preferred_language || 'en',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString()
    };
  }

  /**
   * Fetch profile by User ID
   */
  async getProfileById(userId: string): Promise<UserProfile | null> {
    if (config.useMockData) {
      if (mockProfiles.has(userId)) {
        return mockProfiles.get(userId)!;
      }
      const defaultMock: UserProfile = {
        id: userId,
        fullName: 'Ramesh Patel',
        email: 'farmer@bharatfarm.org',
        role: 'farmer',
        phoneNumber: '+91 9831200001',
        state: 'Punjab',
        district: 'Ludhiana',
        location: {
          state: 'Punjab',
          district: 'Ludhiana',
          pincode: '141001'
        },
        landSizeAcres: 5.0,
        primaryCrops: ['Wheat', 'Rice'],
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockProfiles.set(userId, defaultMock);
      return defaultMock;
    }

    const supabaseAdmin = getSupabaseAdminClient();
    if (!supabaseAdmin) {
      throw new Error('Supabase client unavailable');
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error(`[ProfileRepository] Error fetching profile for user ${userId}: ${error.message}`);
      throw error;
    }

    return this.mapRowToProfile(data);
  }

  /**
   * Update profile by User ID with strict validation
   */
  async updateProfile(userId: string, updates: UpdateProfileDTO): Promise<UserProfile> {
    if (config.useMockData) {
      const existing = await this.getProfileById(userId);
      const updated: UserProfile = {
        ...existing!,
        fullName: updates.fullName !== undefined ? updates.fullName : existing!.fullName,
        phoneNumber: updates.phone !== undefined ? updates.phone : existing!.phoneNumber,
        state: updates.state !== undefined ? updates.state : existing!.state,
        district: updates.district !== undefined ? updates.district : existing!.district,
        location: {
          state: updates.state !== undefined ? updates.state : existing!.location?.state || 'Punjab',
          district: updates.district !== undefined ? updates.district : existing!.location?.district || 'Ludhiana',
          pincode: existing!.location?.pincode || '141001'
        },
        landSizeAcres: updates.landSizeAcres !== undefined ? updates.landSizeAcres : existing!.landSizeAcres,
        primaryCrops: updates.primaryCrops !== undefined ? updates.primaryCrops : existing!.primaryCrops,
        preferredLanguage: updates.preferredLanguage !== undefined ? updates.preferredLanguage : existing!.preferredLanguage,
        avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : existing!.avatarUrl,
        updatedAt: new Date().toISOString()
      };
      mockProfiles.set(userId, updated);
      return updated;
    }

    const supabaseAdmin = getSupabaseAdminClient();
    if (!supabaseAdmin) {
      throw new Error('Supabase client unavailable');
    }

    // Build update object matching Supabase public.profiles columns
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.district !== undefined) dbUpdates.district = updates.district;
    if (updates.landSizeAcres !== undefined) dbUpdates.land_size_acres = updates.landSizeAcres;
    if (updates.primaryCrops !== undefined) dbUpdates.primary_crops = updates.primaryCrops;
    if (updates.preferredLanguage !== undefined) dbUpdates.preferred_language = updates.preferredLanguage;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error(`[ProfileRepository] Error updating profile for user ${userId}: ${error.message}`);
      throw error;
    }

    return this.mapRowToProfile(data);
  }
}
