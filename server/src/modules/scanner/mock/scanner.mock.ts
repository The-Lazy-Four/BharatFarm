import { ScanAnalysisResult } from '../types/scanner.types.js';
import { SCANNER_CONSTANTS } from '../constants/scanner.constants.js';

export const MOCK_SCAN_RESULT: ScanAnalysisResult = {
  scanId: 'scan-mock-001',
  status: 'success',
  disease: SCANNER_CONSTANTS.MOCK_DISEASE_NAME,
  confidence: 0.92,
  cropName: 'Tomato',
  severity: 'medium',
  symptoms: [
    'Concentric dark brown spots on lower leaves',
    'Yellowing surrounding circular leaf lesions',
    'Minor stem lesions near lower node'
  ],
  recommendations: [
    'Apply copper-based fungicide every 7-10 days following manufacturer label.',
    'Remove infected lower leaves to minimize spore transmission.',
    'Ensure proper spacing between plants for adequate ventilation.'
  ],
  preventativeMeasures: [
    'Practice 3-year crop rotation with non-solanaceous crops.',
    'Use drip irrigation to prevent foliage wetting.'
  ],
  disclaimer: 'Based on uploaded image. Diagnosis is advisory. Please consult a qualified local agricultural extension officer for severe or persistent conditions.',
  scannedAt: new Date().toISOString()
};
