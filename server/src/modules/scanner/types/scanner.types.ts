export interface ScanAnalysisResult {
  scanId: string;
  status: 'success' | 'failed';
  disease: string;
  confidence: number;
  cropName: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  recommendations: string[];
  preventativeMeasures: string[];
  scannedAt: string;
}

export interface ScanRequest {
  imageBase64?: string;
  imageUrl?: string;
  cropHint?: string;
}
