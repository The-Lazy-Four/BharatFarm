import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScannerRepository } from '../src/modules/scanner/repositories/scanner.repository.js';
import { ScannerService } from '../src/modules/scanner/services/scanner.service.js';
import { scannerSchema } from '../src/modules/scanner/schemas/scanner.schema.js';
import { AiClient } from '../src/utils/aiClient.js';
import { config } from '../src/config/env.js';

describe('Phase 14.1 — Crop/Leaf Scanner Complete Test Suite', () => {
  let repository: ScannerRepository;
  let service: ScannerService;
  const testUserId = 'test-scanner-user-123';
  const mockBase64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

  beforeEach(() => {
    vi.restoreAllMocks();
    repository = new ScannerRepository();
    service = new ScannerService();
    (config as any).useMockData = false;
    (config as any).openRouterApiKey = 'sk-mock-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. schema validation accurately rejects invalid formats and accepts valid base64', () => {
    const invalidFormat = scannerSchema.validate({ imageBase64: 'data:image/gif;base64,123' });
    expect(invalidFormat.error).not.toBeNull();
    expect(invalidFormat.error?.message).toContain('Unsupported image format');

    const validFormat = scannerSchema.validate({ imageBase64: mockBase64Image });
    expect(validFormat.error).toBeNull();
  });

  it('2. successful AI vision analysis returns structured diagnostic payload', async () => {
    const mockAiJsonResponse = JSON.stringify({
      status: 'diseased',
      name: 'Early Blight',
      confidence: 0.92,
      severity: 'medium',
      symptoms: ['Concentric dark spots on lower leaves', 'Yellowing foliage'],
      immediateActions: ['Apply copper-based fungicide according to package label'],
      prevention: ['Rotate crops every season'],
      disclaimer: 'Advisory guidance only.'
    });

    vi.spyOn(AiClient, 'chat').mockResolvedValue(mockAiJsonResponse);

    const result = await service.analyzeLeafImage({
      imageBase64: mockBase64Image,
      cropHint: 'Tomato',
      question: 'Is this early blight?'
    }, testUserId);

    expect(result).toBeDefined();
    expect(result.status).toBe('success');
    expect(result.cropName).toBe('Tomato');
    expect(result.disease).toBe('Early Blight');
    expect(result.confidence).toBe(0.92);
    expect(result.severity).toBe('medium');
    expect(result.symptoms).toContain('Yellowing foliage');
  });

  it('3. handles HTTP 402 Payment Required by returning safe ai_unavailable response', async () => {
    vi.spyOn(AiClient, 'chat').mockRejectedValue(new Error('OpenRouter API error (Status 402)'));

    const result = await service.analyzeLeafImage({
      imageBase64: mockBase64Image,
      cropHint: 'Tomato'
    }, testUserId);

    expect(result).toBeDefined();
    expect(result.status).toBe('ai_unavailable');
    expect(result.disease).toBe('AI Diagnosis Temporarily Unavailable');
    expect(result.confidence).toBe(0);
    expect(result.aiUnavailable).toBe(true);
    expect(result.disclaimer).toContain('No disease diagnosis was generated');
  });

  it('4. handles HTTP 401 Unauthorized securely without throwing or leaking credentials', async () => {
    vi.spyOn(AiClient, 'chat').mockRejectedValue(new Error('OpenRouter API error (Status 401)'));

    const result = await service.analyzeLeafImage({
      imageBase64: mockBase64Image,
      cropHint: 'Rice'
    }, testUserId);

    expect(result.status).toBe('ai_unavailable');
    expect(result.disease).toBe('AI Diagnosis Temporarily Unavailable');
  });

  it('5. handles HTTP 429 Rate Limit gracefully', async () => {
    vi.spyOn(AiClient, 'chat').mockRejectedValue(new Error('OpenRouter API error (Status 429)'));

    const result = await service.analyzeLeafImage({
      imageBase64: mockBase64Image,
      cropHint: 'Wheat'
    }, testUserId);

    expect(result.status).toBe('ai_unavailable');
    expect(result.disease).toBe('AI Diagnosis Temporarily Unavailable');
  });

  it('6. handles AI request timeout or network error', async () => {
    vi.spyOn(AiClient, 'chat').mockRejectedValue(new Error('AI request timed out after 45s'));

    const result = await service.analyzeLeafImage({
      imageBase64: mockBase64Image,
      cropHint: 'Cotton'
    }, testUserId);

    expect(result.status).toBe('ai_unavailable');
    expect(result.disease).toBe('AI Diagnosis Temporarily Unavailable');
  });

  it('7. handles malformed JSON response from AI provider', async () => {
    vi.spyOn(AiClient, 'chat').mockResolvedValue('Invalid JSON response content from AI provider');

    const result = await service.analyzeLeafImage({
      imageBase64: mockBase64Image,
      cropHint: 'Potato'
    }, testUserId);

    expect(result.status).toBe('ai_unavailable');
    expect(result.disease).toBe('AI Diagnosis Temporarily Unavailable');
  });

  it('8. detects non-plant images and sets status to not_a_plant', async () => {
    const mockNotPlantResponse = JSON.stringify({
      status: 'not_a_plant',
      name: 'Not a Plant Leaf',
      confidence: 0,
      severity: 'none',
      symptoms: [],
      immediateActions: [],
      prevention: [],
      disclaimer: 'The uploaded image does not contain a plant leaf.'
    });

    vi.spyOn(AiClient, 'chat').mockResolvedValue(mockNotPlantResponse);

    const result = await repository.saveAndAnalyzeScan({
      imageBase64: mockBase64Image,
      cropHint: 'Unknown'
    });

    expect(result.status).toBe('not_a_plant');
    expect(result.disease).toBe('Not a Plant Leaf');
    expect(result.confidence).toBe(0);
  });

  it('9. fetches scan history for authenticated user', async () => {
    const history = await service.getHistory(testUserId);
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].scanId).toBeDefined();
  });

  it('10. deletes scan history entries securely', async () => {
    const deleted = await service.deleteScan('scan-hist-001', testUserId);
    expect(deleted).toBe(true);
  });

  it('11. returns deterministic mock response when USE_MOCK_DATA=true without calling external AI', async () => {
    (config as any).useMockData = true;
    const aiSpy = vi.spyOn(AiClient, 'chat');

    const result = await service.analyzeLeafImage({
      imageBase64: mockBase64Image,
      cropHint: 'Maize'
    }, testUserId);

    expect(aiSpy).not.toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.status).toBe('success');
    expect(result.cropName).toBe('Maize');
    expect(result.disease).toBeDefined();
  });
});
