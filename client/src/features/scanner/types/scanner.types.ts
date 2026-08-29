export interface ScanResult {
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

export interface ScanRequestParams {
  imageBase64?: string;
  imageUrl?: string;
  cropHint?: string;
  district?: string;
  state?: string;
  question?: string;
}

export interface ScannerService {
  analyzeImage(params: ScanRequestParams): Promise<ScanResult>;
  getHistory(): Promise<ScanResult[]>;
  deleteScan(id: string): Promise<boolean>;
}
