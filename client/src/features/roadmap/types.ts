export interface RoadmapActivity {
  day: number;
  date: string;
  stage: string;
  title: string;
  task: string;
  inputs: string[];
}

export interface CropRoadmapResponse {
  roadmap: RoadmapActivity[];
}

export interface CropRoadmapRequest {
  crop: string;
  state: string;
  district: string;
  landSize: number;
  landUnit: 'acres' | 'hectares';
  startDate: string;
  soilType?: string;
  irrigation?: string;
}
