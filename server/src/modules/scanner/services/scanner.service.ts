import { ScannerRepository } from '../repositories/scanner.repository.js';
import { ScanRequest, ScanAnalysisResult } from '../types/scanner.types.js';

export class ScannerService {
  private repository: ScannerRepository;

  constructor() {
    this.repository = new ScannerRepository();
  }

  async analyzeLeafImage(request: ScanRequest, userId?: string): Promise<ScanAnalysisResult> {
    return await this.repository.saveAndAnalyzeScan(request, userId);
  }

  async getHistory(userId: string): Promise<ScanAnalysisResult[]> {
    return await this.repository.getHistory(userId);
  }

  async deleteScan(scanId: string, userId: string): Promise<boolean> {
    return await this.repository.deleteScan(scanId, userId);
  }
}
