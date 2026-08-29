import { describe, it, expect } from 'vitest';
import { SchemesRepository } from '../src/modules/schemes/repositories/schemes.repository.js';
import { SchemesService } from '../src/modules/schemes/services/schemes.service.ts';

describe('Government Schemes Phase 10 Production Suite', () => {
  const repository = new SchemesRepository();
  const service = new SchemesService();

  it('1. lists all available government schemes', async () => {
    const schemes = await service.getSchemes();
    expect(schemes).toBeDefined();
    expect(Array.isArray(schemes)).toBe(true);
    expect(schemes.length).toBeGreaterThan(0);
  });

  it('2. filters schemes by category deterministically', async () => {
    const subsidies = await service.getSchemes({ category: 'subsidy' });
    expect(subsidies.every(s => s.category.toLowerCase() === 'subsidy')).toBe(true);
  });

  it('3. filters schemes by state deterministically (State or Central)', async () => {
    const pbSchemes = await service.getSchemes({ state: 'Punjab' });
    expect(pbSchemes.every(s => s.state === 'Punjab' || s.state === 'Central')).toBe(true);
  });

  it('4. performs natural language search across titles and descriptions', async () => {
    const results = await service.getSchemes({ search: 'kisan' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(s => s.title.toLowerCase().includes('kisan'))).toBe(true);
  });

  it('5. retrieves individual scheme by id', async () => {
    const all = await service.getSchemes();
    const target = all[0];
    const fetched = await service.getSchemeById(target.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(target.id);
  });

  it('6. evaluates scheme eligibility deterministically without requiring mandatory AI', async () => {
    const eligible = await service.checkEligibility({
      landSizeAcres: 2.5,
      state: 'Punjab',
      cropCategory: 'Wheat'
    });
    expect(eligible).toBeDefined();
    expect(Array.isArray(eligible)).toBe(true);
    expect(eligible.length).toBeGreaterThan(0);
  });

  it('7. calculates credit assessment score and loan estimate accurately', async () => {
    const assessment = await service.getLoanAssessment(3.5, 200000);
    expect(assessment).toBeDefined();
    expect(assessment.assessmentScore).toBeGreaterThanOrEqual(650);
    expect(assessment.assessmentScore).toBeLessThanOrEqual(850);
    expect(assessment.maxEstimatedLoanAmount).toBeGreaterThan(0);
    expect(assessment.disclaimer).toBeTruthy();
  });
});
