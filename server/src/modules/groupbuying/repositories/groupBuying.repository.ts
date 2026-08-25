import { GroupBuyPool } from '../types/groupBuying.types.js';
import { MOCK_GROUP_BUYS } from '../mock/groupBuying.mock.js';

export class GroupBuyingRepository {
  private pools: GroupBuyPool[] = [...MOCK_GROUP_BUYS];

  async findAll(): Promise<GroupBuyPool[]> {
    return this.pools.map(pool => this.withRefreshedStatus(pool));
  }

  async findById(id: string): Promise<GroupBuyPool | null> {
    const pool = this.pools.find(p => p.id === id);
    return pool ? this.withRefreshedStatus(pool) : null;
  }

  async joinPool(id: string, quantity: number): Promise<{ pool: GroupBuyPool | null; error?: string }> {
    const pool = this.pools.find(p => p.id === id);
    if (!pool) return { pool: null, error: 'Group buy pool not found' };

    const refreshed = this.withRefreshedStatus(pool);
    if (refreshed.status !== 'OPEN') {
      return { pool: refreshed, error: `This pool is no longer open (status: ${refreshed.status}).` };
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { pool: refreshed, error: 'Quantity must be a positive number.' };
    }

    pool.currentQuantity += quantity;
    pool.participantCount += 1;
    if (pool.currentQuantity >= pool.targetQuantity) {
      pool.status = 'THRESHOLD_REACHED';
    }

    return { pool: this.withRefreshedStatus(pool) };
  }

  /** Auto-expires a pool whose deadline has passed and it never reached its target — a rule the mock data alone can't express. */
  private withRefreshedStatus(pool: GroupBuyPool): GroupBuyPool {
    const isExpired = new Date(pool.deadline).getTime() < Date.now();
    if (isExpired && (pool.status === 'OPEN')) {
      pool.status = 'EXPIRED';
    }
    return pool;
  }
}
