export interface ScanResult {
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

export interface ScannerService {
  analyzeImage(imageBase64: string): Promise<ScanResult>;
}
