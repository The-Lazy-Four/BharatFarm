import { ApiClient } from '../../../services/apiClient.js';
import { GroupBuyPool } from '../types/groupBuying.types.js';

export class GroupBuyingApi {
  static async getPools(): Promise<GroupBuyPool[]> {
    const res = await ApiClient.get<GroupBuyPool[]>('/groupbuying');
    return res.data || [];
  }

  static async getPoolById(id: string): Promise<GroupBuyPool | null> {
    const res = await ApiClient.get<GroupBuyPool>(`/groupbuying/${id}`);
    return res.data || null;
  }

  static async joinPool(id: string, quantity: number): Promise<{ pool: GroupBuyPool | null; error?: string }> {
    const res = await ApiClient.post<GroupBuyPool>(`/groupbuying/${id}/join`, { quantity });
    if (!res.success) {
      return { pool: null, error: res.error?.message || 'Failed to join this group buy pool.' };
    }
    return { pool: res.data || null };
  }
}
