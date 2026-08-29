import { describe, it, expect, beforeEach } from 'vitest';
import { ProfileService } from '../src/modules/profile/services/profile.service.js';
import { ProfileRepository } from '../src/modules/profile/repositories/profile.repository.js';
import { config } from '../src/config/env.js';

describe('Phase 14: Farmer Profile & Farm Context Core Logic Suite', () => {
  let service: ProfileService;

  beforeEach(() => {
    (config as any).useMockData = true;
    service = new ProfileService();
  });

  it('1. Fetches default profile for mock user correctly', async () => {
    const profile = await service.getProfile('mock-user-123');
    expect(profile).toBeDefined();
    expect(profile.id).toBe('mock-user-123');
    expect(profile.fullName).toBe('Ramesh Patel');
    expect(profile.landSizeAcres).toBe(5.0);
    expect(profile.primaryCrops).toContain('Wheat');
    expect(profile.state).toBe('Punjab');
    expect(profile.district).toBe('Ludhiana');
  });

  it('2. Rejects update with negative land size acres', async () => {
    await expect(
      service.updateProfile('mock-user-123', { landSizeAcres: -5.0 })
    ).rejects.toThrow('INVALID_LAND_SIZE');
  });

  it('3. Rejects update with malformed phone number', async () => {
    await expect(
      service.updateProfile('mock-user-123', { phone: 'not-a-phone-number' })
    ).rejects.toThrow('INVALID_PHONE_NUMBER');
  });

  it('4. Successfully updates farmer profile and agricultural context', async () => {
    const updated = await service.updateProfile('mock-user-123', {
      fullName: 'Gurpreet Singh',
      phone: '+91 9876543210',
      state: 'Punjab',
      district: 'Amritsar',
      landSizeAcres: 15.5,
      primaryCrops: ['Wheat', 'Mustard', 'Cotton'],
      preferredLanguage: 'hi'
    });

    expect(updated.fullName).toBe('Gurpreet Singh');
    expect(updated.phoneNumber).toBe('+91 9876543210');
    expect(updated.state).toBe('Punjab');
    expect(updated.district).toBe('Amritsar');
    expect(updated.landSizeAcres).toBe(15.5);
    expect(updated.primaryCrops).toEqual(['Wheat', 'Mustard', 'Cotton']);
    expect(updated.preferredLanguage).toBe('hi');
  });

  it('5. Verifies profile updates persist on subsequent fetches', async () => {
    await service.updateProfile('mock-user-123', {
      fullName: 'Harjit Singh',
      landSizeAcres: 20.0
    });

    const retrieved = await service.getProfile('mock-user-123');
    expect(retrieved.fullName).toBe('Harjit Singh');
    expect(retrieved.landSizeAcres).toBe(20.0);
  });
});
