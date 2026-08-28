import { GroupBuyingRepository, PoolFilterParams } from '../repositories/groupBuying.repository.js';
import { GroupBuyPool, CreateGroupBuyPoolDto, GroupBuyMember } from '../types/groupBuying.types.js';

export class GroupBuyingService {
  private repository: GroupBuyingRepository;

  constructor() {
    this.repository = new GroupBuyingRepository();
  }

  async getAllPools(filters?: PoolFilterParams): Promise<GroupBuyPool[]> {
    return await this.repository.findAll(filters);
  }

  async getPoolById(id: string): Promise<GroupBuyPool | null> {
    return await this.repository.findById(id);
  }

  async createPool(dto: CreateGroupBuyPoolDto, creatorId: string): Promise<GroupBuyPool> {
    return await this.repository.create(dto, creatorId);
  }

  async joinGroupBuy(
    id: string,
    quantity: number,
    userId?: string
  ): Promise<{ pool: GroupBuyPool | null; error?: string }> {
    return await this.repository.joinPool(id, quantity, userId);
  }

  async getPoolMembers(poolId: string): Promise<GroupBuyMember[]> {
    return await this.repository.getPoolMembers(poolId);
  }

  async seedDemoPools(): Promise<{ seededCount: number; message: string }> {
    return await this.repository.seedDemoPools();
  }
}
