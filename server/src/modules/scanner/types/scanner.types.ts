export interface ScanAnalysisResult {
  scanId: string;
  status: 'success' | 'failed' | 'not_a_plant' | 'ai_unavailable';
  disease: string;
  confidence: number;
  cropName: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  symptoms?: string[];
  recommendations: string[];
  preventativeMeasures: string[];
  disclaimer: string;
  scannedAt: string;
  imageStoragePath?: string;
  weatherWarning?: string;
  roadmapStage?: string;
  aiUnavailable?: boolean;
}

export interface ScanRequest {
  imageBase64?: string;
  imageUrl?: string;
  cropHint?: string;
  district?: string;
  state?: string;
  question?: string;
}
