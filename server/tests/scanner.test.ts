import { describe, it, expect } from 'vitest';
import { ScannerRepository } from '../src/modules/scanner/repositories/scanner.repository.js';
import { ScannerService } from '../src/modules/scanner/services/scanner.service.js';
import { scannerSchema } from '../src/modules/scanner/schemas/scanner.schema.js';

describe('Crop/Leaf Scanner Module Integration Test Suite', () => {
  const repository = new ScannerRepository();
  const service = new ScannerService();
  const testUserId = 'test-scanner-user-123';
  const mockBase64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

  it('validates incoming scan request schemas accurately', () => {
    const invalidFormat = scannerSchema.validate({ imageBase64: 'data:image/gif;base64,123' });
    expect(invalidFormat.error).not.toBeNull();
    expect(invalidFormat.error?.message).toContain('Unsupported image format');

    const validFormat = scannerSchema.validate({ imageBase64: mockBase64Image });
    expect(validFormat.error).toBeNull();
  });

  it('analyzes leaf images and returns structured diagnostic payload', async () => {
    const result = await service.analyzeLeafImage({
      imageBase64: mockBase64Image,
      cropHint: 'Tomato',
      question: 'Is this early blight or late blight?'
    }, testUserId);

    expect(result).toBeDefined();
    expect(result.scanId).toBeDefined();
    expect(result.cropName).toBe('Tomato');
    expect(result.disease).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.disclaimer).toContain('advisory');
  }, 15000);

  it('fetches scan history idempotently for authenticated user', async () => {
    const history = await service.getHistory(testUserId);
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].scanId).toBeDefined();
  });

  it('handles non-plant image detections gracefully', async () => {
    const result = await repository.saveAndAnalyzeScan({
      imageBase64: mockBase64Image,
      cropHint: 'Unknown'
    });

    expect(result.status).toBeDefined();
    expect(result.severity).toBeDefined();
  });

  it('deletes scan history entries securely', async () => {
    const deleted = await service.deleteScan('scan-hist-001', testUserId);
    expect(deleted).toBe(true);
  });
});
