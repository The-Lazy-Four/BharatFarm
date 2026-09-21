import { getSupabaseClient, getSupabaseAdminClient } from '../../../config/supabase.js';
import { WhatsAppUserRecord, SahayakSessionContext, SupportedWhatsAppLanguage } from '../types/whatsapp.types.js';
import { logger } from '../../../utils/logger.js';

export interface FarmerProfileRecord {
  id: string;
  name: string;
  location: string;
  crop: string;
  land: string;
  season: string;
  phone: string;
}

export class WhatsAppUserService {
  // In-memory demo farmer mapping for SIH demo (Nashik, Purba Medinipur, Ludhiana)
  private static demoFarmers: Map<string, FarmerProfileRecord> = new Map([
    [
      '9876543210',
      {
        id: 'farmer_sih_demo_nashik',
        name: 'Demo Farmer (Nashik)',
        location: 'Nashik, Maharashtra',
        crop: 'Tomato',
        land: '2 Acres (Irrigated)',
        season: 'Kharif',
        phone: '9876543210'
      }
    ],
    [
      '9831200001',
      {
        id: 'farmer_sih_demo_haldia',
        name: 'Souvik Dey',
        location: 'Haldia, West Bengal',
        crop: 'Paddy',
        land: '3.5 Acres (Canal Irrigated)',
        season: 'Kharif',
        phone: '9831200001'
      }
    ],
    [
      '9812345678',
      {
        id: 'farmer_sih_demo_punjab',
        name: 'Gurpreet Singh',
        location: 'Ludhiana, Punjab',
        crop: 'Wheat',
        land: '5 Acres (Tube Well)',
        season: 'Rabi',
        phone: '9812345678'
      }
    ]
  ]);

  // In-memory fallback cache for offline development / mock mode
  private static memoryUsers: Map<string, WhatsAppUserRecord> = new Map([
    [
      '919831200001',
      {
        id: 'usr_wa_demo_1',
        phoneNumber: '919831200001',
        farmerId: 'farmer_sih_demo_haldia',
        name: 'Souvik Dey',
        language: 'bn',
        locationLat: 22.0667,
        locationLng: 88.0667,
        locationName: 'Haldia, West Bengal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    [
      'demo-user',
      {
        id: 'usr_wa_demo_judge',
        phoneNumber: 'demo-user',
        farmerId: null,
        name: 'Judge / Evaluator',
        language: 'en',
        locationLat: 19.9975,
        locationLng: 73.7898,
        locationName: 'Nashik, Maharashtra',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  ]);

  private static memorySessions: Map<string, SahayakSessionContext> = new Map();

  /**
   * Find farmer by registered phone number (Checks SIH demo repository first, then Supabase)
   */
  static findFarmerByPhone(clean10Phone: string): FarmerProfileRecord | null {
    if (this.demoFarmers.has(clean10Phone)) {
      return this.demoFarmers.get(clean10Phone)!;
    }
    return null;
  }

  /**
   * Find or create lightweight WhatsApp user record
   */
  static async getOrCreateUser(
    rawPhone: string,
    profileName?: string
  ): Promise<WhatsAppUserRecord> {
    const cleanPhone = (rawPhone || '').replace(/[^0-9a-zA-Z_-]/g, '');
    const supabase = getSupabaseAdminClient() || getSupabaseClient();

    // Try Supabase first if available
    if (supabase) {
      try {
        const { data: existingUser, error: findError } = await supabase
          .from('whatsapp_users')
          .select('*')
          .eq('phone_number', cleanPhone)
          .maybeSingle();

        if (!findError && existingUser) {
          return {
            id: existingUser.id,
            phoneNumber: existingUser.phone_number,
            farmerId: existingUser.farmer_id,
            name: existingUser.name,
            language: existingUser.language || 'en',
            locationLat: existingUser.location_lat ? Number(existingUser.location_lat) : null,
            locationLng: existingUser.location_lng ? Number(existingUser.location_lng) : null,
            locationName: existingUser.location_name,
            createdAt: existingUser.created_at,
            updatedAt: existingUser.updated_at
          };
        }

        // Check if there is an existing farmer profile with this phone number to auto-link
        let autoFarmerId: string | null = null;
        let farmerLocation: { state?: string; district?: string } = {};

        const { data: matchedProfile } = await supabase
          .from('profiles')
          .select('id, full_name, state, district, phone')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (matchedProfile) {
          autoFarmerId = matchedProfile.id;
          farmerLocation = { state: matchedProfile.state, district: matchedProfile.district };
        }

        const newUserPayload = {
          phone_number: cleanPhone,
          farmer_id: autoFarmerId,
          name: profileName || matchedProfile?.full_name || 'Farmer',
          language: 'en',
          location_name: farmerLocation.district ? `${farmerLocation.district}, ${farmerLocation.state}` : 'Nashik, Maharashtra',
          location_lat: 19.9975,
          location_lng: 73.7898
        };

        const { data: createdUser, error: insertError } = await supabase
          .from('whatsapp_users')
          .insert(newUserPayload)
          .select()
          .single();

        if (!insertError && createdUser) {
          return {
            id: createdUser.id,
            phoneNumber: createdUser.phone_number,
            farmerId: createdUser.farmer_id,
            name: createdUser.name,
            language: createdUser.language,
            locationLat: createdUser.location_lat ? Number(createdUser.location_lat) : null,
            locationLng: createdUser.location_lng ? Number(createdUser.location_lng) : null,
            locationName: createdUser.location_name,
            createdAt: createdUser.created_at,
            updatedAt: createdUser.updated_at
          };
        }
      } catch (err: any) {
        logger.warn(`[WhatsAppUserService] Supabase query fallback to memory: ${err.message}`);
      }
    }

    // In-memory fallback
    if (!this.memoryUsers.has(cleanPhone)) {
      const created: WhatsAppUserRecord = {
        id: `wa_user_${Date.now()}`,
        phoneNumber: cleanPhone,
        farmerId: null,
        name: profileName || 'Farmer',
        language: 'en',
        locationLat: 19.9975,
        locationLng: 73.7898,
        locationName: 'Nashik, Maharashtra',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.memoryUsers.set(cleanPhone, created);
    }

    return this.memoryUsers.get(cleanPhone)!;
  }

  /**
   * Update user's live location context (e.g. from WhatsApp location pin)
   */
  static async updateLocation(
    userId: string,
    lat: number,
    lng: number,
    locationName?: string
  ): Promise<void> {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('whatsapp_users')
          .update({
            location_lat: lat,
            location_lng: lng,
            location_name: locationName || 'Pinned Location',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      } catch (err: any) {
        logger.warn(`[WhatsAppUserService] Failed to update location in Supabase: ${err.message}`);
      }
    }

    // Also update in memory
    for (const [phone, user] of this.memoryUsers.entries()) {
      if (user.id === userId) {
        user.locationLat = lat;
        user.locationLng = lng;
        if (locationName) user.locationName = locationName;
        user.updatedAt = new Date().toISOString();
        this.memoryUsers.set(phone, user);
        break;
      }
    }
  }

  /**
   * Update preferred communication language
   */
  static async updateLanguage(userId: string, language: string): Promise<void> {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('whatsapp_users')
          .update({ language, updated_at: new Date().toISOString() })
          .eq('id', userId);
      } catch (err: any) {
        logger.warn(`[WhatsAppUserService] Failed to update language: ${err.message}`);
      }
    }

    for (const [phone, user] of this.memoryUsers.entries()) {
      if (user.id === userId) {
        user.language = language;
        user.updatedAt = new Date().toISOString();
        this.memoryUsers.set(phone, user);
        break;
      }
    }
  }

  /**
   * Link WhatsApp user to an existing BharatFarm Profile
   */
  static async linkToFarmerProfile(userId: string, farmerId: string): Promise<boolean> {
    const supabase = getSupabaseAdminClient() || getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('whatsapp_users')
          .update({ farmer_id: farmerId, updated_at: new Date().toISOString() })
          .eq('id', userId);
        if (error) return false;
      } catch {
        return false;
      }
    }

    for (const [phone, user] of this.memoryUsers.entries()) {
      if (user.id === userId) {
        user.farmerId = farmerId;
        user.updatedAt = new Date().toISOString();
        this.memoryUsers.set(phone, user);
        return true;
      }
    }
    return true;
  }

  /**
   * Session Context Tracker with State Machine defaults
   */
  static getSession(whatsappUserId: string): SahayakSessionContext {
    if (!this.memorySessions.has(whatsappUserId)) {
      this.memorySessions.set(whatsappUserId, {
        whatsappUserId,
        state: 'START',
        language: 'hi',
        accountStatus: 'UNKNOWN',
        navigationHistory: ['START'],
        lastActiveAt: new Date().toISOString()
      });
    }
    return this.memorySessions.get(whatsappUserId)!;
  }

  static updateSession(whatsappUserId: string, updates: Partial<SahayakSessionContext>): void {
    const session = this.getSession(whatsappUserId);
    Object.assign(session, updates, { lastActiveAt: new Date().toISOString() });
    this.memorySessions.set(whatsappUserId, session);
  }

  static resetSession(whatsappUserId: string): SahayakSessionContext {
    const session: SahayakSessionContext = {
      whatsappUserId,
      state: 'START',
      language: 'hi',
      accountStatus: 'UNKNOWN',
      navigationHistory: ['START'],
      lastActiveAt: new Date().toISOString()
    };
    this.memorySessions.set(whatsappUserId, session);
    return session;
  }
}
