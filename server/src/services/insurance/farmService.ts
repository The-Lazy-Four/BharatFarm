import { logger } from '../../utils/logger.js';

export interface FarmRecord {
  farmId: string;
  fieldName: string;
  crop: string;
  farmAreaAcres: number;
  farmAreaHectares: number;
  location: {
    district: string;
    state: string;
    block?: string;
    latitude: number;
    longitude: number;
  };
  boundaryCoordinates: Array<{ lat: number; lng: number }>;
  satelliteImage: string;
  ndviScore: number;
  registeredAt: string;
}

export interface SatelliteObservation {
  date: string;
  ndvi: number;
  condition: string;
  image: string;
  notes: string;
}

export interface SatelliteEvidence {
  satelliteId: string;
  lastPassTimestamp: string;
  satelliteImage: string;
  ndviScore: number;
  vegetationCondition: string;
  cloudCoverPercent: number;
  resolutionMeters: number;
  beforePass: SatelliteObservation;
  afterPass: SatelliteObservation;
}

// In-memory demo registered farms database
const DEMO_FARMS: Record<string, FarmRecord> = {
  'FARM-402': {
    farmId: 'FARM-402',
    fieldName: 'Field ID #402 - Sector B (North Paddy Field)',
    crop: 'Paddy',
    farmAreaAcres: 5.2,
    farmAreaHectares: 2.10,
    location: {
      district: 'Purba Medinipur',
      state: 'West Bengal',
      block: 'Haldia',
      latitude: 22.0667,
      longitude: 88.0667
    },
    boundaryCoordinates: [
      { lat: 22.0667, lng: 88.0667 },
      { lat: 22.0675, lng: 88.0678 },
      { lat: 22.0682, lng: 88.0669 },
      { lat: 22.0672, lng: 88.0658 }
    ],
    satelliteImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    ndviScore: 0.72,
    registeredAt: '2026-01-15T08:30:00.000Z'
  },
  'FARM001': {
    farmId: 'FARM001',
    fieldName: 'Field ID #402 - Sector B (North Paddy Field)',
    crop: 'Paddy',
    farmAreaAcres: 5.2,
    farmAreaHectares: 2.10,
    location: {
      district: 'Purba Medinipur',
      state: 'West Bengal',
      block: 'Haldia',
      latitude: 22.0667,
      longitude: 88.0667
    },
    boundaryCoordinates: [
      { lat: 22.0667, lng: 88.0667 },
      { lat: 22.0675, lng: 88.0678 },
      { lat: 22.0682, lng: 88.0669 },
      { lat: 22.0672, lng: 88.0658 }
    ],
    satelliteImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    ndviScore: 0.72,
    registeredAt: '2026-01-15T08:30:00.000Z'
  },
  'FIELD402': {
    farmId: 'FIELD402',
    fieldName: 'Field ID #402 - Sector B (North Paddy Field)',
    crop: 'Paddy',
    farmAreaAcres: 5.2,
    farmAreaHectares: 2.10,
    location: {
      district: 'Purba Medinipur',
      state: 'West Bengal',
      block: 'Haldia',
      latitude: 22.0667,
      longitude: 88.0667
    },
    boundaryCoordinates: [
      { lat: 22.0667, lng: 88.0667 },
      { lat: 22.0675, lng: 88.0678 },
      { lat: 22.0682, lng: 88.0669 },
      { lat: 22.0672, lng: 88.0658 }
    ],
    satelliteImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    ndviScore: 0.72,
    registeredAt: '2026-01-15T08:30:00.000Z'
  }
};

export class FarmService {
  /**
   * Retrieve registered farm metadata by Farm ID.
   */
  static async getFarm(farmId: string): Promise<FarmRecord | null> {
    if (!farmId) return null;
    const normalizedId = farmId.trim().toUpperCase();

    if (DEMO_FARMS[normalizedId]) {
      return DEMO_FARMS[normalizedId];
    }
    if (DEMO_FARMS[farmId]) {
      return DEMO_FARMS[farmId];
    }

    logger.info(`[FarmService] Creating dynamic farm record for registered farmId: ${farmId}`);
    return {
      farmId,
      fieldName: `Registered Field (${farmId})`,
      crop: 'Paddy',
      farmAreaAcres: 5.2,
      farmAreaHectares: 2.10,
      location: {
        district: 'Purba Medinipur',
        state: 'West Bengal',
        block: 'Haldia',
        latitude: 22.0667,
        longitude: 88.0667
      },
      boundaryCoordinates: [
        { lat: 22.0667, lng: 88.0667 },
        { lat: 22.0675, lng: 88.0678 }
      ],
      satelliteImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      ndviScore: 0.72,
      registeredAt: new Date().toISOString()
    };
  }

  /**
   * Retrieve satellite evidence associated with the farm.
   */
  static async getSatelliteEvidence(farmId: string): Promise<SatelliteEvidence | null> {
    const farm = await this.getFarm(farmId);
    if (!farm) return null;

    return {
      satelliteId: 'SENTINEL-2B / ISRO-EOS-04',
      lastPassTimestamp: '2026-09-14 10:42 AM IST',
      satelliteImage: farm.satelliteImage,
      ndviScore: farm.ndviScore,
      vegetationCondition: 'SIGNIFICANT_DECLINE_WATERLOGGING',
      cloudCoverPercent: 2.1,
      resolutionMeters: 10,
      beforePass: {
        date: '2026-09-05',
        ndvi: 0.74,
        condition: 'Healthy Dense Crop Canopy',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        notes: 'Pre-event Sentinel-2 scan shows vibrant vegetation & healthy crop index'
      },
      afterPass: {
        date: '2026-09-14',
        ndvi: 0.28,
        condition: 'Visible Waterlogging & Canopy Loss',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        notes: 'Post-event Sentinel-2 scan detects extensive inundation across 68% of plot boundary'
      }
    };
  }
}
