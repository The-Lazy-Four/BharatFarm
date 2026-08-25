import { ScannerRepository } from '../repositories/scanner.repository.js';
import { ScanRequest, ScanAnalysisResult } from '../types/scanner.types.js';

export class ScannerService {
  private repository: ScannerRepository;

  constructor() {
    this.repository = new ScannerRepository();
  }

  async analyzeLeafImage(request: ScanRequest): Promise<ScanAnalysisResult> {
    return await this.repository.saveAndAnalyzeScan(request);
  }
}
