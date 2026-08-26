// ============================================================
// Crop Roadmap — Type Definitions
// ============================================================

export interface CropRoadmapRequest {
  crop: string;
  state: string;
  district: string;
  landSize: number;
  landUnit: 'acres' | 'hectares';
  startDate: string; // ISO date string YYYY-MM-DD
  soilType?: string;
  irrigation?: string;
}

export interface RoadmapActivity {
  day: number;
  date: string; // ISO date string
  stage: string;
  title: string;
  task: string;
  inputs: string[];
}

export interface CropRoadmapResponse {
  roadmap: RoadmapActivity[];
}
