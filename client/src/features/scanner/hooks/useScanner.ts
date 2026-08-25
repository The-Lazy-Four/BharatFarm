import { useState } from 'react';
import { ScanResult } from '../types/scanner.types.js';
import { scannerApi } from '../services/scannerApi.js';

export const useScanner = () => {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanLeaf = async (imageBase64: string) => {
    setIsScanning(true);
    setError(null);
    try {
      const scanData = await scannerApi.analyzeImage(imageBase64);
      setResult(scanData);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsScanning(false);
    }
  };

  return { result, isScanning, error, scanLeaf, reset: () => setResult(null) };
};
