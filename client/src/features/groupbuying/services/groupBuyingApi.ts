import { ApiClient } from '../../../services/apiClient.js';
import { GroupBuyPool, CreateGroupBuyPoolDto, GroupBuyMember } from '../types/groupBuying.types.js';

export class GroupBuyingApi {
  static async getPools(params?: { category?: string; search?: string; status?: string }): Promise<GroupBuyPool[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    const queryString = query.toString();
    const url = queryString ? `/groupbuying?${queryString}` : '/groupbuying';

    const res = await ApiClient.get<GroupBuyPool[]>(url);
    return res.data || [];
  }

  static async getPoolById(id: string): Promise<GroupBuyPool | null> {
    const res = await ApiClient.get<GroupBuyPool>(`/groupbuying/${id}`);
    return res.data || null;
  }

  static async createPool(dto: CreateGroupBuyPoolDto): Promise<{ pool: GroupBuyPool | null; error?: string }> {
    const res = await ApiClient.post<GroupBuyPool>('/groupbuying', dto);
    if (!res.success) {
      return { pool: null, error: res.error?.message || 'Failed to create group buy pool.' };
    }
    return { pool: res.data || null };
  }

  static async joinPool(id: string, quantity: number): Promise<{ pool: GroupBuyPool | null; error?: string }> {
    const res = await ApiClient.post<GroupBuyPool>(`/groupbuying/${id}/join`, { quantity });
    if (!res.success) {
      return { pool: null, error: res.error?.message || 'Failed to join this group buy pool.' };
    }
    return { pool: res.data || null };
  }

  static async getPoolMembers(id: string): Promise<GroupBuyMember[]> {
    const res = await ApiClient.get<GroupBuyMember[]>(`/groupbuying/${id}/members`);
    return res.data || [];
  }
}
