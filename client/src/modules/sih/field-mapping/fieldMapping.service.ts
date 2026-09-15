export interface GpsCoordinate {
    lat: number;
    lng: number;
    accuracy?: number;
    altitude?: number;
    heading?: number;
    speed?: number;
    timestamp?: number;
    quality?: 'GOOD' | 'FAIR' | 'POOR' | 'REJECTED';
}

export interface FieldRecord {
    id?: string;
    user_id?: string;
    field_name: string;
    crop_name: string;
    area_sq_meters: number;
    area_acres: number;
    area_hectares: number;
    perimeter_meters: number;
    total_distance_walked_meters: number;
    centroid_lat: number;
    centroid_lng: number;
    latitude: number;
    longitude: number;
    boundary_coordinates: GpsCoordinate[];
    location_address?: string;
    is_demo?: boolean;
    mapping_mode: 'REAL_GPS' | 'DEMO';
    created_at?: string;
}

export interface MappingSession {
    id: string;
    field_id?: string;
    crop_name: string;
    mapping_mode: 'REAL_GPS' | 'DEMO';
    started_at: string;
    ended_at?: string;
    total_points: number;
    valid_points: number;
    rejected_points: number;
    total_distance_meters: number;
    average_accuracy_meters: number;
    sync_status: 'LOCAL_ONLY' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED';
}

export interface MlTrainingObservation {
    id?: string;
    field_id?: string;
    session_id?: string;
    crop_name: string;
    area_sq_meters: number;
    area_acres: number;
    perimeter_meters: number;
    centroid_latitude: number;
    centroid_longitude: number;
    mapping_mode: 'REAL_GPS' | 'DEMO';
    data_quality_score: number;
    feature_schema_version: string;
    dataset_provenance: string;
    created_at?: string;
}

const LOCAL_STORAGE_KEY = 'bf_field_mappings_cache';
const SESSIONS_CACHE_KEY = 'bf_mapping_sessions_cache';

export const fieldMappingService = {
    /**
     * Save a newly mapped field, session metadata, and ML training record
     */
    async saveField(fieldData: Omit<FieldRecord, 'id' | 'created_at'>): Promise<FieldRecord> {
        const id = 'field_' + Date.now();
        const created_at = new Date().toISOString();

        const savedRecord: FieldRecord = {
            ...fieldData,
            id,
            created_at
        };

        // Cache locally in localStorage
        try {
            const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
            const existingArr: FieldRecord[] = JSON.parse(existingStr);
            existingArr.unshift(savedRecord);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingArr.slice(0, 50)));

            // Also create a structured ML observation entry (local & server compatible)
            if (fieldData.mapping_mode === 'REAL_GPS') {
                const mlObservation: MlTrainingObservation = {
                    id: 'ml_obs_' + Date.now(),
                    field_id: id,
                    crop_name: fieldData.crop_name,
                    area_sq_meters: fieldData.area_sq_meters,
                    area_acres: fieldData.area_acres,
                    perimeter_meters: fieldData.perimeter_meters,
                    centroid_latitude: fieldData.centroid_lat,
                    centroid_longitude: fieldData.centroid_lng,
                    mapping_mode: 'REAL_GPS',
                    data_quality_score: 0.95,
                    feature_schema_version: 'v1',
                    dataset_provenance: 'FIELD_MAPPING_GPS',
                    created_at
                };

                const mlCache = JSON.parse(localStorage.getItem('bf_ml_observations') || '[]');
                mlCache.unshift(mlObservation);
                localStorage.setItem('bf_ml_observations', JSON.stringify(mlCache.slice(0, 100)));
            }
        } catch (err) {
            console.warn('[FieldMapping] Error caching record locally:', err);
        }

        return savedRecord;
    },

    /**
     * Retrieve saved fields for current user
     */
    async getSavedFields(): Promise<FieldRecord[]> {
        try {
            const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
            return JSON.parse(existingStr);
        } catch {
            return [];
        }
    },

    /**
     * Calculate Distance in meters between two coordinates (Haversine Formula)
     */
    calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000; // Earth radius in meters
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    /**
     * Calculate sequential walking distance in meters
     */
    calculateTotalWalkingDistance(coords: GpsCoordinate[]): number {
        if (coords.length < 2) return 0;
        let total = 0;
        for (let i = 0; i < coords.length - 1; i++) {
            total += this.calculateDistanceMeters(coords[i].lat, coords[i].lng, coords[i + 1].lat, coords[i + 1].lng);
        }
        return Math.round(total * 10) / 10;
    },

    /**
     * Calculate closed polygon perimeter in meters
     */
    calculatePerimeter(coords: GpsCoordinate[]): number {
        if (coords.length < 2) return 0;
        let total = this.calculateTotalWalkingDistance(coords);
        if (coords.length > 2) {
            total += this.calculateDistanceMeters(
                coords[coords.length - 1].lat,
                coords[coords.length - 1].lng,
                coords[0].lat,
                coords[0].lng
            );
        }
        return Math.round(total * 10) / 10;
    },

    /**
     * Calculate polygon area in Square Meters using Geodetic Shoelace Formula
     */
    calculateAreaSqMeters(coords: GpsCoordinate[]): number {
        if (coords.length < 3) return 0;

        const R = 6371000;
        let areaSqMeters = 0;

        const radCoords = coords.map(c => ({
            lat: (c.lat * Math.PI) / 180,
            lng: (c.lng * Math.PI) / 180
        }));

        for (let i = 0; i < radCoords.length; i++) {
            const p1 = radCoords[i];
            const p2 = radCoords[(i + 1) % radCoords.length];
            areaSqMeters += (p2.lng - p1.lng) * (2 + Math.sin(p1.lat) + Math.sin(p2.lat));
        }

        areaSqMeters = Math.abs((areaSqMeters * R * R) / 2);
        return Math.round(areaSqMeters * 10) / 10;
    },

    /**
     * Convert Area in Sq Meters to Acres
     */
    calculateAreaAcres(coords: GpsCoordinate[]): number {
        const sqMeters = this.calculateAreaSqMeters(coords);
        return Math.round((sqMeters / 4046.86) * 100) / 100;
    },

    /**
     * Convert Area in Sq Meters to Hectares
     */
    calculateAreaHectares(coords: GpsCoordinate[]): number {
        const sqMeters = this.calculateAreaSqMeters(coords);
        return Math.round((sqMeters / 10000) * 100) / 100;
    },

    /**
     * Calculate Polygon Centroid (Mean center latitude & longitude)
     */
    calculateCentroid(coords: GpsCoordinate[]): { lat: number; lng: number } {
        if (coords.length === 0) return { lat: 22.0667, lng: 88.0667 };
        const sumLat = coords.reduce((acc, c) => acc + c.lat, 0);
        const sumLng = coords.reduce((acc, c) => acc + c.lng, 0);
        return {
            lat: sumLat / coords.length,
            lng: sumLng / coords.length
        };
    }
};

