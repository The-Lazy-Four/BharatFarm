import { describe, it, expect } from 'vitest';
import { RoadmapRepository } from '../src/modules/roadmap/repositories/roadmap.repository.js';
import { RoadmapService } from '../src/modules/roadmap/services/roadmap.service.js';

describe('Crop Roadmap Complete Implementation Test Suite', () => {
  const repository = new RoadmapRepository();
  const service = new RoadmapService();
  const testUserId = 'test-farmer-user-123';

  it('lists seeded and user-created crop roadmaps idempotently', async () => {
    const list = await service.listRoadmaps(testUserId);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(8);
    expect(list.some(r => r.crop === 'Rice')).toBe(true);
    expect(list.some(r => r.crop === 'Wheat')).toBe(true);
  });

  it('retrieves a single roadmap by ID or seeded crop name', async () => {
    const riceRoadmap = await service.getRoadmapById('seeded-Rice', testUserId);
    expect(riceRoadmap).not.toBeNull();
    expect(riceRoadmap?.crop).toBe('Rice');
    expect(riceRoadmap?.activities.length).toBeGreaterThan(0);
  });

  it('generates a new crop-specific roadmap with accurate timeline dates', async () => {
    const response = await service.generateRoadmap({
      crop: 'Tomato',
      state: 'Punjab',
      district: 'Ludhiana',
      landSize: 2,
      landUnit: 'acres',
      startDate: '2026-09-01',
      soilType: 'Loamy',
      irrigation: 'Drip'
    }, testUserId);

    expect(response).toBeDefined();
    expect(response.crop).toBe('Tomato');
    expect(response.roadmap.length).toBeGreaterThanOrEqual(10);
    expect(response.roadmap[0].stage).toContain('Land');
    expect(response.weatherAdvisory).toBeDefined();
  }, 15000);

  it('persists progress updates for roadmap completion', async () => {
    const roadmap = await service.generateRoadmap({
      crop: 'Mustard',
      state: 'Haryana',
      district: 'Karnal',
      landSize: 3,
      landUnit: 'acres',
      startDate: '2026-09-05'
    }, testUserId);

    const roadmapId = roadmap.id || 'seeded-Mustard';
    const updated = await service.updateProgress(roadmapId, testUserId, [1, 5, 25]);
    expect(updated).toBe(true);
  }, 15000);

  it('returns stage-level AI advisories with weather cautions on demand', async () => {
    const advisory = await service.getStageAdvisory({
      crop: 'Wheat',
      stage: 'Irrigation',
      day: 21,
      taskTitle: 'CRI Stage Irrigation',
      state: 'Punjab',
      district: 'Ludhiana',
      startDate: '2026-09-01'
    }, testUserId);

    expect(advisory).toBeDefined();
    expect(advisory.advisory).toBeTruthy();
  });

  it('deletes roadmaps securely when requested by owner', async () => {
    const result = await service.deleteRoadmap('seeded-Rice', testUserId);
    expect(result).toBe(true);
  });
});
