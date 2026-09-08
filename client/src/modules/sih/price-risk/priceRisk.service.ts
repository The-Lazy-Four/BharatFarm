import { ApiClient } from '../../../services/apiClient.js';
import type {
  CropRiskRequest,
  CropRiskAnalysis,
  Season,
  FarmerFieldRegistration,
  WhatIfSimulationResult
} from '@bharatfarm/shared';

// ============================================================
// STORAGE KEY
// ============================================================
const FIELD_REGISTRATION_KEY_PREFIX = 'bf_field_registration_';

export class PriceRiskService {

  // ─────────────────────────────────────────────────────────
  // FARMER FIELD REGISTRATION (localStorage — Phase 1)
  // ─────────────────────────────────────────────────────────

  static saveFieldRegistration(userId: string, data: Omit<FarmerFieldRegistration, 'userId' | 'registeredAt'>): FarmerFieldRegistration {
    const registration: FarmerFieldRegistration = {
      ...data,
      userId,
      registeredAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(`${FIELD_REGISTRATION_KEY_PREFIX}${userId}`, JSON.stringify(registration));
    } catch {
      // storage quota error — ignore, still return
    }
    return registration;
  }

  static getFieldRegistration(userId: string): FarmerFieldRegistration | null {
    try {
      const raw = localStorage.getItem(`${FIELD_REGISTRATION_KEY_PREFIX}${userId}`);
      if (raw) return JSON.parse(raw) as FarmerFieldRegistration;

      // Fallback check: Read from FieldMappingPage cache ('bf_field_mappings_cache')
      const mappingRaw = localStorage.getItem('bf_field_mappings_cache');
      if (mappingRaw) {
        const fields = JSON.parse(mappingRaw);
        if (Array.isArray(fields) && fields.length > 0) {
          const f = fields[0];
          const cropClean = f.crop_name ? f.crop_name.split(' ')[0].replace(/[^a-zA-Z]/g, '') : 'Paddy';
          return {
            userId,
            fieldName: f.field_name || 'My Mapped Field',
            crop: cropClean,
            landSizeAcres: f.area_acres || 1.5,
            district: f.location_address?.split(',')?.[0]?.trim() || 'Purba Medinipur',
            state: f.location_address?.split(',')?.[1]?.trim() || 'West Bengal',
            latitude: f.latitude,
            longitude: f.longitude,
            registeredAt: f.created_at || new Date().toISOString()
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  static clearFieldRegistration(userId: string): void {
    try {
      localStorage.removeItem(`${FIELD_REGISTRATION_KEY_PREFIX}${userId}`);
    } catch {}
  }

  static hasRegistered(userId: string): boolean {
    return this.getFieldRegistration(userId) !== null;
  }

  // ─────────────────────────────────────────────────────────
  // GPS GEOLOCATION
  // ─────────────────────────────────────────────────────────

  static async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => {
          switch (err.code) {
            case 1: reject(new Error('Location permission denied. Please allow location access or search manually.')); break;
            case 2: reject(new Error('Location information unavailable. Please search your district manually.')); break;
            case 3: reject(new Error('Location request timed out. Please search manually.')); break;
            default: reject(new Error('Unable to retrieve location.'));
          }
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }

  /**
   * Reverse geocoding using BigDataCloud free API (no key required).
   * Returns district/state at an aggregated level — individual coordinates not exposed.
   */
  static async reverseGeocode(lat: number, lng: number): Promise<{ district: string; state: string; block?: string }> {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(2)}&longitude=${lng.toFixed(2)}&localityLanguage=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      const district = data.localityInfo?.administrative?.find((a: any) => a.adminLevel === 6)?.name
        || data.city || data.locality || 'Unknown District';
      const state = data.principalSubdivision || 'Unknown State';
      return { district, state };
    } catch {
      throw new Error('Reverse geocoding failed. Please search your district manually.');
    }
  }

  // ─────────────────────────────────────────────────────────
  // CROP RISK ANALYSIS API
  // ─────────────────────────────────────────────────────────

  static async analyzeCropRisk(
    location: { district: string; state: string; latitude?: number; longitude?: number },
    crop: string,
    season: Season
  ): Promise<CropRiskAnalysis> {
    const payload: CropRiskRequest = { location, crop, season };
    const res = await ApiClient.post<CropRiskAnalysis>('/crop-risk/analyze', payload);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error?.message || 'Crop risk analysis failed');
  }

  // ─────────────────────────────────────────────────────────
  // WHAT-IF SIMULATION (client-side pure calculation)
  // ─────────────────────────────────────────────────────────

  static simulateWhatIf(base: CropRiskAnalysis, additionalAreaPercent: number): WhatIfSimulationResult {
    const additionalArea = base.supply.currentIntendedAreaHectares * (additionalAreaPercent / 100);
    const newIntendedArea = base.supply.currentIntendedAreaHectares + additionalArea;
    const newSupply = Math.round(newIntendedArea * base.supply.yieldBenchmarkTonnesPerHectare);
    const newRatio = parseFloat((newSupply / base.supply.historicalRequirementTonnes).toFixed(2));
    const newSurplusTonnes = Math.max(0, newSupply - base.supply.historicalRequirementTonnes);
    const newSurplusPercent = parseFloat(((newSurplusTonnes / base.supply.historicalRequirementTonnes) * 100).toFixed(1));

    const newAreaChangePercent = ((newIntendedArea - base.supply.historicalAverageAreaHectares) / base.supply.historicalAverageAreaHectares) * 100;
    const areaScore = Math.min(100, Math.max(0, newAreaChangePercent * 1.5));
    const pressureScore = Math.min(100, Math.max(0, (newRatio - 1) * 200));
    let newProb = areaScore * 0.35 + pressureScore * 0.30 +
      base.historicalPattern.priceDecrementFrequencyPercent * 0.20 +
      (base.historicalPattern.arrivalTrend === 'INCREASING' ? 10 * 0.10 : 0) +
      Math.min(100, base.historicalPattern.priceVolatilityPercent * 2) * 0.05;
    newProb = Math.min(99, Math.max(1, Math.round(newProb)));

    const level = newProb <= 35 ? 'LOW' : newProb <= 55 ? 'MODERATE' : newProb <= 75 ? 'HIGH' : 'VERY_HIGH';

    return {
      additionalAreaPercent,
      newIntendedAreaHectares: Math.round(newIntendedArea),
      newEstimatedSupplyTonnes: newSupply,
      newSupplyPressureRatio: newRatio,
      newSurplusPercent,
      newRiskProbability: newProb,
      newRiskLevel: level as any
    };
  }
}

// ─────────────────────────────────────────────────────────
// KNOWN DISTRICTS FOR SEARCH SUGGESTIONS
// ─────────────────────────────────────────────────────────

export const KNOWN_DISTRICTS: Array<{ district: string; state: string }> = [
  { district: 'Purba Medinipur', state: 'West Bengal' },
  { district: 'Nashik', state: 'Maharashtra' },
  { district: 'Ludhiana', state: 'Punjab' },
  { district: 'Pune', state: 'Maharashtra' },
  { district: 'Satara', state: 'Maharashtra' },
  { district: 'Ahmednagar', state: 'Maharashtra' },
  { district: 'Solapur', state: 'Maharashtra' },
  { district: 'Varanasi', state: 'Uttar Pradesh' },
  { district: 'Agra', state: 'Uttar Pradesh' },
  { district: 'Mathura', state: 'Uttar Pradesh' },
  { district: 'Karnal', state: 'Haryana' },
  { district: 'Hisar', state: 'Haryana' },
  { district: 'Guntur', state: 'Andhra Pradesh' },
  { district: 'Kurnool', state: 'Andhra Pradesh' },
  { district: 'Coimbatore', state: 'Tamil Nadu' },
  { district: 'Salem', state: 'Tamil Nadu' },
  { district: 'Hubballi', state: 'Karnataka' },
  { district: 'Belagavi', state: 'Karnataka' },
  { district: 'Indore', state: 'Madhya Pradesh' },
  { district: 'Jabalpur', state: 'Madhya Pradesh' },
  { district: 'Bikaner', state: 'Rajasthan' },
  { district: 'Sikar', state: 'Rajasthan' },
];

export const AVAILABLE_CROPS: string[] = [
  'Tomato', 'Paddy', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Potato',
  'Mustard', 'Soybean', 'Chilli', 'Onion', 'Garlic', 'Brinjal', 'Cucumber',
  'Bitter Gourd', 'Bottle Gourd', 'Ridge Gourd', 'Peas', 'Coriander',
  'Watermelon', 'Muskmelon', 'Banana', 'Papaya'
];
