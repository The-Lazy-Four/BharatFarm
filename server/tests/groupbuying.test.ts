import { describe, it, expect, beforeEach } from 'vitest';
import { GroupBuyingRepository } from '../src/modules/groupbuying/repositories/groupBuying.repository.js';
import { GroupBuyingService } from '../src/modules/groupbuying/services/groupBuying.service.js';
import { config } from '../src/config/env.js';

describe('Group Buying Phase 12 Production Suite', () => {
  let repository: GroupBuyingRepository;
  let service: GroupBuyingService;
  const testUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  beforeEach(() => {
    (config as any).useMockData = true;
    repository = new GroupBuyingRepository();
    service = new GroupBuyingService();
  });

  it('1. lists all active group buying pools and validates seeded dataset', async () => {
    const pools = await service.getAllPools();
    expect(pools).toBeDefined();
    expect(Array.isArray(pools)).toBe(true);
    expect(pools.length).toBeGreaterThan(0);
  });

  it('2. filters group buying pools by category', async () => {
    const fertilizers = await service.getAllPools({ category: 'fertilizer' });
    expect(fertilizers.every(p => p.category === 'fertilizer')).toBe(true);
  });

  it('3. performs keyword search against pool item title and location', async () => {
    const results = await service.getAllPools({ search: 'NPK' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(p => p.itemTitle.includes('NPK'))).toBe(true);
  });

  it('4. retrieves pool detail by valid ID', async () => {
    const pools = await service.getAllPools();
    const target = pools[0];
    const pool = await service.getPoolById(target.id);
    expect(pool).toBeDefined();
    expect(pool?.id).toBe(target.id);
  });

  it('5. creates a new group buying pool', async () => {
    const newPool = await service.createPool(
      {
        itemTitle: 'Test Neem Coated Fertilizer Lot',
        category: 'fertilizer',
        originalPricePerUnit: 1200,
        discountedPricePerUnit: 950,
        targetQuantity: 50,
        deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
        location: 'Karnal Region, Haryana'
      },
      testUserId
    );

    expect(newPool).toBeDefined();
    expect(newPool.id).toBeTruthy();
    expect(newPool.status).toBe('OPEN');
    expect(newPool.currentQuantity).toBe(0);
  });

  it('6. joins pool atomically and increments quantity and participant count', async () => {
    const newPool = await service.createPool(
      {
        itemTitle: 'Atomic Join Fertilizer Pool',
        category: 'fertilizer',
        originalPricePerUnit: 1500,
        discountedPricePerUnit: 1100,
        targetQuantity: 100,
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        location: 'Ludhiana, Punjab'
      },
      testUserId
    );

    const result = await service.joinGroupBuy(newPool.id, 10, testUserId);
    expect(result.error).toBeUndefined();
    expect(result.pool).toBeDefined();
    expect(result.pool?.currentQuantity).toBe(10);
    expect(result.pool?.participantCount).toBe(1);
  });

  it('7. transitions pool status to THRESHOLD_REACHED when target quantity is met', async () => {
    const newPool = await service.createPool(
      {
        itemTitle: 'Threshold Test Seed Pool',
        category: 'seeds',
        originalPricePerUnit: 2000,
        discountedPricePerUnit: 1500,
        targetQuantity: 20,
        deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
        location: 'Indore, MP'
      },
      testUserId
    );

    const result = await service.joinGroupBuy(newPool.id, 20, testUserId);
    expect(result.pool?.status).toBe('THRESHOLD_REACHED');
  });

  it('8. rejects joining non-positive quantities or non-OPEN pools', async () => {
    const pools = await service.getAllPools();
    const openPool = pools.find(p => p.status === 'OPEN') || pools[0];

    const invalidResult = await service.joinGroupBuy(openPool.id, 0, testUserId);
    expect(invalidResult.error).toContain('Quantity must be a positive integer');

    const completedPool = pools.find(p => p.status === 'COMPLETED');
    if (completedPool) {
      const closedResult = await service.joinGroupBuy(completedPool.id, 5, testUserId);
      expect(closedResult.error).toContain('This pool is no longer open');
    }
  });

  it('9. retrieves user joined purchases dashboard history', async () => {
    const newPool = await service.createPool(
      {
        itemTitle: 'User Purchase History Item',
        category: 'machinery',
        originalPricePerUnit: 5000,
        discountedPricePerUnit: 4000,
        targetQuantity: 5,
        deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
        location: 'Rajkot, Gujarat'
      },
      testUserId
    );

    await service.joinGroupBuy(newPool.id, 2, testUserId);
    const joined = await service.getMyJoinedPools(testUserId);
    expect(joined).toBeDefined();
    expect(joined.length).toBeGreaterThan(0);
    expect(joined.some(j => j.pool.id === newPool.id && j.myQuantity === 2)).toBe(true);
  });
});
