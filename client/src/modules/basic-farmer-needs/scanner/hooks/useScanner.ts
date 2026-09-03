import { useState, useCallback, useEffect } from 'react';
import { ScanResult, ScanRequestParams } from '../types/scanner.types';
import { scannerApi } from '../services/scannerApi';

export const useScanner = () => {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const data = await scannerApi.getHistory();
      setHistory(data);
    } catch {
      // non-fatal history fetch
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const scanLeaf = async (params: ScanRequestParams | string) => {
    setIsScanning(true);
    setError(null);
    try {
      const requestPayload: ScanRequestParams = typeof params === 'string' ? { imageBase64: params } : params;
      const scanData = await scannerApi.analyzeImage(requestPayload);
      setResult(scanData);
      if (scanData.status === 'success') {
        setHistory(prev => [scanData, ...prev.filter(h => h.scanId !== scanData.scanId)]);
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsScanning(false);
    }
  };

  const deleteScan = async (scanId: string) => {
    try {
      await scannerApi.deleteScan(scanId);
      setHistory(prev => prev.filter(item => item.scanId !== scanId));
      if (result?.scanId === scanId) {
        setResult(null);
      }
    } catch (err: any) {
      setError('Failed to delete scan entry');
    }
  };

  return {
    result,
    history,
    isScanning,
    isLoadingHistory,
    error,
    scanLeaf,
    deleteScan,
    fetchHistory,
    reset: () => setResult(null)
  };
};
