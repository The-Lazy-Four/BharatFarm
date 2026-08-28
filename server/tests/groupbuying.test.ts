import { describe, it, expect, beforeEach } from 'vitest';
import { GroupBuyingRepository } from '../src/modules/groupbuying/repositories/groupBuying.repository.js';
import { config } from '../src/config/env.js';

describe('Group Buying Backend Module & Concurrency Security', () => {
  beforeEach(() => {
    (config as any).useMockData = true;
  });

  it('1. Lists all active group buying pools', async () => {
    const repository = new GroupBuyingRepository();
    const pools = await repository.findAll();
    expect(Array.isArray(pools)).toBe(true);
    expect(pools.length).toBeGreaterThan(0);
  });

  it('2. Retrieves single pool details by ID', async () => {
    const repository = new GroupBuyingRepository();
    const pools = await repository.findAll();
    const firstPool = pools[0];

    const pool = await repository.findById(firstPool.id);
    expect(pool).not.toBeNull();
    expect(pool?.id).toBe(firstPool.id);
  });

  it('3. Allows authenticated farmer to join open pool with valid quantity', async () => {
    const repository = new GroupBuyingRepository();
    const pools = await repository.findAll();
    const openPool = pools.find(p => p.status === 'OPEN');
    expect(openPool).toBeDefined();

    const initialQty = openPool!.currentQuantity;
    const { pool, error } = await repository.joinPool(openPool!.id, 5, '00000000-0000-0000-0000-000000000001');

    expect(error).toBeUndefined();
    expect(pool).not.toBeNull();
    expect(pool?.currentQuantity).toBe(initialQty + 5);
  });

  it('4. Rejects joining with zero or negative quantity', async () => {
    const repository = new GroupBuyingRepository();
    const pools = await repository.findAll();
    const openPool = pools.find(p => p.status === 'OPEN')!;

    const { pool, error } = await repository.joinPool(openPool.id, -2, '00000000-0000-0000-0000-000000000001');
    expect(error).toBe('Quantity must be a positive integer.');
    expect(pool).toBeNull();
  });

  it('5. Rejects joining completed/threshold_reached pool', async () => {
    const repository = new GroupBuyingRepository();
    const pools = await repository.findAll();
    const closedPool = pools.find(p => p.status === 'THRESHOLD_REACHED' || p.status === 'COMPLETED');
    expect(closedPool).toBeDefined();

    const { pool, error } = await repository.joinPool(closedPool!.id, 2, '00000000-0000-0000-0000-000000000001');
    expect(error).toContain('This pool is no longer open');
    expect(pool?.status).not.toBe('OPEN');
  });

  it('6. Rejects joining expired pool', async () => {
    const repository = new GroupBuyingRepository();
    const expiredPool = await repository.create(
      {
        itemTitle: 'Expired Seed Lot',
        category: 'seeds',
        originalPricePerUnit: 1000,
        discountedPricePerUnit: 800,
        targetQuantity: 50,
        deadline: new Date(Date.now() - 3600000).toISOString(), // 1 hr in past
        location: 'Patiala, Punjab'
      },
      '00000000-0000-0000-0000-000000000001'
    );

    const { pool, error } = await repository.joinPool(expiredPool.id, 2, '00000000-0000-0000-0000-000000000001');
    expect(error).toContain('This pool is no longer open');
    expect(pool?.status).toBe('EXPIRED');
  });

  it('7. Idempotently seeds demo group buying pools without duplication', async () => {
    const repository = new GroupBuyingRepository();
    const seed1 = await repository.seedDemoPools();
    const countAfterSeed1 = (await repository.findAll()).length;

    const seed2 = await repository.seedDemoPools();
    const countAfterSeed2 = (await repository.findAll()).length;

    expect(countAfterSeed2).toBe(countAfterSeed1);
    expect(seed2.seededCount).toBe(0);
  });

  it('8. Transitions status to THRESHOLD_REACHED when target quantity is met', async () => {
    const repository = new GroupBuyingRepository();
    const newPool = await repository.create(
      {
        itemTitle: 'Organic Micro-Nutrients Bulk',
        category: 'fertilizer',
        originalPricePerUnit: 500,
        discountedPricePerUnit: 350,
        targetQuantity: 10,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        location: 'Jalandhar, Punjab'
      },
      '00000000-0000-0000-0000-000000000001'
    );

    const { pool } = await repository.joinPool(newPool.id, 10, '00000000-0000-0000-0000-000000000001');
    expect(pool?.status).toBe('THRESHOLD_REACHED');
  });
});
