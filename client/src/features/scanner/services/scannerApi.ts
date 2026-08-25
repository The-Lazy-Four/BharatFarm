import { ApiClient } from '../../../services/apiClient.js';
import { ScanResult, ScannerService } from '../types/scanner.types.js';

export class MockScannerService implements ScannerService {
  async analyzeImage(imageBase64: string): Promise<ScanResult> {
    const res = await ApiClient.post<ScanResult>('/scanner/analyze', { imageBase64 });
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error?.message || 'Failed to analyze crop image');
  }
}

export const scannerApi = new MockScannerService();
