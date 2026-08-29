export interface RoadmapActivity {
  day: number;
  date: string;
  stage: string;
  title: string;
  task: string;
  inputs: string[];
}

export interface CropRoadmapItem {
  id: string;
  userId: string;
  crop: string;
  state: string;
  district: string;
  landSize: number;
  landUnit: 'acres' | 'hectares';
  startDate: string;
  soilType?: string;
  irrigation?: string;
  activities: RoadmapActivity[];
  completedDays: number[];
  createdAt: string;
  isSeeded?: boolean;
}

export interface CropRoadmapResponse {
  id?: string;
  userId?: string;
  crop?: string;
  state?: string;
  district?: string;
  landSize?: number;
  landUnit?: string;
  startDate?: string;
  roadmap: RoadmapActivity[];
  completedDays?: number[];
  weatherAdvisory?: string;
  aiAdvice?: string;
  relevantSchemes?: Array<{ title: string; link: string }>;
  relevantProducts?: Array<{ title: string; price: number }>;
  relevantPools?: Array<{ title: string; discount: string }>;
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

export interface RoadmapAdvisoryRequest {
  roadmapId?: string;
  crop: string;
  stage: string;
  day: number;
  taskTitle: string;
  state: string;
  district: string;
  startDate: string;
  scannerContext?: string;
}
