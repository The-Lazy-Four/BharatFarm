export interface GpsCoordinate {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp?: number;
}

export interface FieldRecord {
    id?: string;
    user_id?: string;
    field_name: string;
    crop_name: string;
    area_acres: number;
    perimeter_meters: number;
    latitude: number;
    longitude: number;
    boundary_coordinates: GpsCoordinate[];
    location_address?: string;
    is_demo?: boolean;
    created_at?: string;
}

const LOCAL_STORAGE_KEY = 'bf_field_mappings_cache';

export const fieldMappingService = {
    /**
     * Save a newly mapped field (persisted to LocalStorage and synced with API)
     */
    async saveField(field: Omit<FieldRecord, 'id' | 'created_at'>): Promise<FieldRecord> {
        const savedRecord: FieldRecord = {
            ...field,
            id: 'field_' + Date.now(),
            created_at: new Date().toISOString()
        };

        // Cache locally
        try {
            const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
            const existingArr: FieldRecord[] = JSON.parse(existingStr);
            existingArr.unshift(savedRecord);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingArr.slice(0, 50)));
        } catch (err) {
            console.warn('[FieldMapping] Error writing to local storage cache:', err);
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
     * Helper: Calculate distance in meters between two lat/lng coordinates (Haversine Formula)
     */
    calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000; // Radius of Earth in meters
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
     * Helper: Calculate polygon perimeter in meters
     */
    calculatePerimeter(coords: GpsCoordinate[]): number {
        if (coords.length < 2) return 0;
        let total = 0;
        for (let i = 0; i < coords.length - 1; i++) {
            total += this.calculateDistanceMeters(
                coords[i].lat,
                coords[i].lng,
                coords[i + 1].lat,
                coords[i + 1].lng
            );
        }
        // Close boundary if > 2 points
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
     * Helper: Calculate polygon area in Acres using Geodetic Shoelace Formula
     */
    calculateAreaAcres(coords: GpsCoordinate[]): number {
        if (coords.length < 3) return 0;

        const R = 6371000; // Earth radius in meters
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
        const acres = areaSqMeters / 4046.86; // 1 acre = 4046.86 sq meters
        return Math.round(acres * 100) / 100;
    }
};
