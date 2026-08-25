import { GroupBuyingRepository } from '../repositories/groupBuying.repository.js';
import { GroupBuyPool } from '../types/groupBuying.types.js';

export class GroupBuyingService {
  private repository: GroupBuyingRepository;

  constructor() {
    this.repository = new GroupBuyingRepository();
  }

  async getAllPools(): Promise<GroupBuyPool[]> {
    return await this.repository.findAll();
  }

  async getPoolById(id: string): Promise<GroupBuyPool | null> {
    return await this.repository.findById(id);
  }

  async joinGroupBuy(id: string, quantity: number): Promise<{ pool: GroupBuyPool | null; error?: string }> {
    return await this.repository.joinPool(id, quantity);
  }
}
