// ============================================================
// Crop Roadmap — Repository (Persistence + Weather + AI Layer)
// Uses Supabase public.roadmaps table and OpenRouter Central AI Gateway.
// ============================================================

import { CropRoadmapRequest, CropRoadmapResponse, CropRoadmapItem, RoadmapAdvisoryRequest, RoadmapActivity } from '../types/roadmap.types.js';
import { SEEDED_CROP_ROADMAPS, calculateActivityDates } from '../constants/seededRoadmaps.js';
import { getSupabaseAdminClient } from '../../../config/supabase.js';
import { AiClient } from '../../../utils/aiClient.js';
import { AiCache } from '../../../utils/aiCache.js';
import { logger } from '../../../utils/logger.js';
import { buildRoadmapSystemPrompt, buildRoadmapUserPrompt } from '../utils/roadmapPrompt.js';
import { WeatherRepository } from '../../weather/repositories/weather.repository.js';
import { SchemesRepository } from '../../schemes/repositories/schemes.repository.js';
import { MarketplaceRepository } from '../../marketplace/repositories/marketplace.repository.js';
import { GroupBuyingRepository } from '../../groupbuying/repositories/groupBuying.repository.js';

export class RoadmapRepository {
  private weatherRepo: WeatherRepository;
  private schemesRepo: SchemesRepository;
  private marketplaceRepo: MarketplaceRepository;
  private groupBuyingRepo: GroupBuyingRepository;

  constructor() {
    this.weatherRepo = new WeatherRepository();
    this.schemesRepo = new SchemesRepository();
    this.marketplaceRepo = new MarketplaceRepository();
    this.groupBuyingRepo = new GroupBuyingRepository();
  }

  /**
   * List all roadmaps for a user, combining user roadmaps from Supabase with seeded demo roadmaps.
   */
  async listRoadmaps(userId: string): Promise<CropRoadmapItem[]> {
    const userRoadmaps: CropRoadmapItem[] = [];
    const supabase = getSupabaseAdminClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          for (const item of data) {
            userRoadmaps.push(this.mapDbToItem(item));
          }
        }
      } catch (err) {
        logger.error('[Roadmap] Error querying Supabase roadmaps:', err);
      }
    }

    // Generate seeded demo roadmaps for crops user hasn't created yet
    const seededRoadmaps = this.getSeededRoadmapsForDemo(userId, userRoadmaps.map(r => r.crop));

    return [...userRoadmaps, ...seededRoadmaps];
  }

  /**
   * Get a specific roadmap by ID (or seeded ID).
   */
  async getRoadmapById(id: string, userId: string): Promise<CropRoadmapItem | null> {
    if (id.startsWith('seeded-')) {
      const cropName = id.replace('seeded-', '');
      const seeded = this.generateSingleSeededRoadmap(userId, cropName, new Date().toISOString().split('T')[0]);
      return seeded;
    }

    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          return this.mapDbToItem(data);
        }
      } catch (err) {
        logger.error(`[Roadmap] Error fetching roadmap ${id}:`, err);
      }
    }

    return null;
  }

  /**
   * Generate or retrieve a roadmap, persisting to Supabase when authenticated.
   */
  async generateRoadmap(request: CropRoadmapRequest, userId?: string): Promise<CropRoadmapResponse> {
    const cropName = request.crop.trim();
    let activities: RoadmapActivity[] = [];

    // 1. Try AI Gateway generation first if available
    try {
      const systemPrompt = buildRoadmapSystemPrompt();
      const userPrompt = buildRoadmapUserPrompt(request);

      const cacheKey = AiCache.createFingerprint('roadmap', { crop: request.crop, state: request.state, district: request.district, soil: request.soilType });
      const cachedResponse = AiCache.get<CropRoadmapResponse>(cacheKey);

      if (cachedResponse) {
        logger.info(`[Roadmap] Returning cached AI roadmap for ${request.crop}`);
        activities = cachedResponse.roadmap;
      } else if (AiClient.isConfigured()) {
        const content = await AiClient.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], { maxTokens: 1500 });

        if (content) {
          const parsed = AiClient.parseJsonResponse<CropRoadmapResponse>(content);
          if (parsed && Array.isArray(parsed.roadmap) && parsed.roadmap.length > 0) {
            activities = parsed.roadmap;
            AiCache.set(cacheKey, { roadmap: activities }, 86400); // 24hr cache
          }
        }
      }
    } catch (err) {
      logger.warn('[Roadmap] OpenRouter AI generation unavailable, using deterministic seeded template:', err);
    }

    // 2. Fallback to rich deterministic seeded roadmap template if AI failed
    if (activities.length === 0) {
      const template = SEEDED_CROP_ROADMAPS[cropName] || SEEDED_CROP_ROADMAPS['Rice'];
      const calculatedDates = calculateActivityDates(request.startDate, template.map(t => t.day));

      activities = template.map((item, idx) => ({
        ...item,
        date: calculatedDates[idx]
      }));
    }

    // 3. Attach Live Weather & Platform Context (Schemes, Products, Pools)
    const weatherAdvisory = await this.getWeatherAdvisory(request.district, request.state);
    const platformContext = await this.getPlatformContext(cropName);

    let savedId: string | undefined;

    // 4. Real Persistence in Supabase if userId is valid
    const supabase = getSupabaseAdminClient();
    if (userId && supabase) {
      try {
        const completedDays: number[] = [];
        const { data, error } = await supabase
          .from('roadmaps')
          .insert({
            user_id: userId,
            crop: request.crop,
            state: request.state,
            district: request.district,
            land_size: request.landSize,
            land_unit: request.landUnit,
            start_date: request.startDate,
            soil_type: request.soilType || null,
            irrigation: request.irrigation || null,
            activities,
            completed_days: completedDays
          })
          .select('id')
          .single();

        if (!error && data) {
          savedId = data.id;
          logger.info(`[Roadmap] Saved roadmap to Supabase with ID: ${savedId}`);
        } else if (error) {
          logger.warn('[Roadmap] Supabase insert warning (schema fallback):', error.message);
        }
      } catch (err) {
        logger.error('[Roadmap] Failed to persist roadmap to Supabase:', err);
      }
    }

    return {
      id: savedId || `seeded-${cropName}`,
      userId,
      crop: request.crop,
      state: request.state,
      district: request.district,
      landSize: request.landSize,
      landUnit: request.landUnit,
      startDate: request.startDate,
      roadmap: activities,
      completedDays: [],
      weatherAdvisory,
      ...platformContext
    };
  }

  /**
   * Update roadmap completed days / progress.
   */
  async updateProgress(id: string, userId: string, completedDays: number[]): Promise<boolean> {
    if (id.startsWith('seeded-')) {
      return true; // Virtual seeded roadmap success
    }

    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('roadmaps')
          .update({ completed_days: completedDays })
          .eq('id', id)
          .eq('user_id', userId);

        if (!error) return true;
        logger.error(`[Roadmap] Error updating progress for ${id}:`, error);
      } catch (err) {
        logger.error('[Roadmap] Exception updating progress:', err);
      }
    }

    return false;
  }

  /**
   * Delete a user roadmap.
   */
  async deleteRoadmap(id: string, userId: string): Promise<boolean> {
    if (id.startsWith('seeded-')) {
      return true;
    }

    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('roadmaps')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (!error) return true;
      } catch (err) {
        logger.error(`[Roadmap] Failed to delete roadmap ${id}:`, err);
      }
    }

    return false;
  }

  /**
   * Explicit On-Demand AI Advisory for a roadmap stage / task.
   */
  async getStageAdvisory(request: RoadmapAdvisoryRequest, userId?: string): Promise<{ advisory: string; weatherWarning?: string }> {
    let weather: any = null;
    try {
      weather = await this.weatherRepo.getWeather({ location: request.district || request.state || 'Ludhiana' });
    } catch (err) {
      // ignore
    }
    const weatherText = weather ? `Current Weather: ${weather.condition}, Temp: ${weather.temperatureCelsius}°C, Rain Prob: ${weather.rainfallProbability}%` : 'Weather normal.';

    const cacheKey = AiCache.createFingerprint('roadmap-advisory', request);
    const cached = AiCache.get<{ advisory: string; weatherWarning?: string }>(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `Crop: ${request.crop}, Stage: ${request.stage}, Day ${request.day}. Task: "${request.taskTitle}".\nLocation: ${request.district}, ${request.state}.\n${weatherText}\n${request.scannerContext ? 'Scanner notes: ' + request.scannerContext : ''}\nProvide a concise 2-sentence farmer advisory explaining best practices for this task under current weather conditions.`;

      let advisory = `Ensure proper soil moisture before starting ${request.taskTitle}. Check local rain forecast.`;
      if (AiClient.isConfigured()) {
        advisory = await AiClient.chat([{ role: 'user', content: prompt }], { maxTokens: 200 });
      }

      const result = {
        advisory,
        weatherWarning: weather?.forecast?.precipitationProbability && weather.forecast.precipitationProbability > 60 ? `⚠️ Rain probability is ${weather.forecast.precipitationProbability}%. Consider delaying spraying or heavy watering.` : undefined
      };

      AiCache.set(cacheKey, result, 7200);
      return result;
    } catch (err) {
      return {
        advisory: `For ${request.crop} (${request.stage}), complete the "${request.taskTitle}" step according to local agricultural extension guidelines.`,
        weatherWarning: weather?.forecast?.precipitationProbability && weather.forecast.precipitationProbability > 50 ? '⚠️ Rain forecast today. Inspect soil conditions.' : undefined
      };
    }
  }

  // ── Helper Methods ──────────────────────────────────────────

  private mapDbToItem(data: any): CropRoadmapItem {
    return {
      id: data.id,
      userId: data.user_id,
      crop: data.crop,
      state: data.state,
      district: data.district,
      landSize: Number(data.land_size || 1),
      landUnit: data.land_unit || 'acres',
      startDate: data.start_date,
      soilType: data.soil_type,
      irrigation: data.irrigation,
      activities: Array.isArray(data.activities) ? data.activities : [],
      completedDays: Array.isArray(data.completed_days) ? data.completed_days : [],
      createdAt: data.created_at,
      isSeeded: false
    };
  }

  private getSeededRoadmapsForDemo(userId: string, existingCrops: string[]): CropRoadmapItem[] {
    const todayStr = new Date().toISOString().split('T')[0];
    const seededList: CropRoadmapItem[] = [];

    for (const [cropName] of Object.entries(SEEDED_CROP_ROADMAPS)) {
      if (!existingCrops.includes(cropName)) {
        seededList.push(this.generateSingleSeededRoadmap(userId, cropName, todayStr));
      }
    }

    return seededList;
  }

  private generateSingleSeededRoadmap(userId: string, cropName: string, startDate: string): CropRoadmapItem {
    const template = SEEDED_CROP_ROADMAPS[cropName] || SEEDED_CROP_ROADMAPS['Rice'];
    const calculatedDates = calculateActivityDates(startDate, template.map(t => t.day));

    const activities = template.map((item, idx) => ({
      ...item,
      date: calculatedDates[idx]
    }));

    return {
      id: `seeded-${cropName}`,
      userId,
      crop: cropName,
      state: 'Punjab',
      district: 'Ludhiana',
      landSize: 2.5,
      landUnit: 'acres',
      startDate,
      soilType: 'Alluvial',
      irrigation: 'Canal',
      activities,
      completedDays: [1, 5],
      createdAt: new Date().toISOString(),
      isSeeded: true
    };
  }

  private async getWeatherAdvisory(district: string, state: string): Promise<string> {
    try {
      const weather = await this.weatherRepo.getWeather({ location: `${district}, ${state}` });
      if (!weather) return 'Weather conditions normal for cultivation.';
      return `Current weather in ${district}: ${weather.temperatureCelsius}°C, ${weather.condition}. Rain probability: ${weather.rainfallProbability}%.`;
    } catch {
      return 'Weather monitoring active.';
    }
  }

  private async getPlatformContext(crop: string) {
    try {
      const schemesData = await this.schemesRepo.findAll();
      const relevantSchemes = schemesData
        .filter((s: any) => s.title.toLowerCase().includes('pm') || s.title.toLowerCase().includes('crop') || s.category.toLowerCase().includes('subsidy'))
        .slice(0, 2)
        .map((s: any) => ({ title: s.title, link: s.officialUrl || '/schemes' }));

      const productsData = await this.marketplaceRepo.findAll({});
      const relevantProducts = productsData
        .filter((p: any) => p.category === 'Fertilizers' || p.category === 'Seeds')
        .slice(0, 2)
        .map((p: any) => ({ title: p.title, price: p.price }));

      const poolsData = await this.groupBuyingRepo.findAll({});
      const relevantPools = poolsData
        .slice(0, 2)
        .map((p: any) => ({ title: p.itemTitle, discount: `Group Buying Available` }));

      return { relevantSchemes, relevantProducts, relevantPools };
    } catch (err) {
      return {};
    }
  }
}
