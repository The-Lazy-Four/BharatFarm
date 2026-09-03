import { ApiClient } from '@core/api/apiClient';
import { ScanResult, ScanRequestParams, ScannerService } from '../types/scanner.types';

export class HttpScannerService implements ScannerService {
  async analyzeImage(params: ScanRequestParams): Promise<ScanResult> {
    const res = await ApiClient.post<ScanResult>('/scanner/analyze', params);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error?.message || 'Failed to analyze crop image');
  }

  async getHistory(): Promise<ScanResult[]> {
    const res = await ApiClient.get<ScanResult[]>('/scanner/history');
    if (res.success && res.data) {
      return res.data;
    }
    return [];
  }

  async deleteScan(id: string): Promise<boolean> {
    const res = await ApiClient.delete<{ success: boolean }>(`/scanner/${id}`);
    return !!res.success;
  }
}

export const scannerApi = new HttpScannerService();


