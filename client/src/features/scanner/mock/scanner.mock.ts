import { ScanResult } from '../types/scanner.types.js';

export const MOCK_SCAN_RESULT: ScanResult = {
  scanId: 'scan-mock-101',
  status: 'success',
  disease: 'Northern Leaf Blight (Development Mock)',
  confidence: 0.94,
  cropName: 'Maize',
  severity: 'medium',
  recommendations: [
    'Apply Mancozeb or Chlorothalonil fungicide.',
    'Avoid overhead sprinkler irrigation.'
  ],
  preventativeMeasures: [
    'Rotate crops with legumes next season.',
    'Plant resistant hybrid seeds.'
  ],
  scannedAt: new Date().toLocaleDateString()
};
