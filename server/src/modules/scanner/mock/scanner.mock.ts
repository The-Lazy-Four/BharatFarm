import { ScanAnalysisResult } from '../types/scanner.types.js';
import { SCANNER_CONSTANTS } from '../constants/scanner.constants.js';

export const MOCK_SCAN_RESULT: ScanAnalysisResult = {
  scanId: 'scan-mock-001',
  status: 'success',
  disease: SCANNER_CONSTANTS.MOCK_DISEASE_NAME,
  confidence: 0.92,
  cropName: 'Tomato',
  severity: 'medium',
  recommendations: [
    'Apply copper-based fungicide every 7-10 days.',
    'Remove infected lower leaves to minimize spore transmission.',
    'Ensure proper spacing for ventilation.'
  ],
  preventativeMeasures: [
    'Use crop rotation with non-solanaceous crops.',
    'Drip irrigate to avoid wet foliage.'
  ],
  scannedAt: new Date().toISOString()
};
