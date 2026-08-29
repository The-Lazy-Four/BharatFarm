import { GroupBuyPool, CreateGroupBuyPoolDto, GroupBuyMember } from '../types/groupBuying.types.js';
import { MOCK_GROUP_BUYS } from '../mock/groupBuying.mock.js';
import { config } from '../../../config/env.js';
import { getSupabaseClient, getSupabaseAdminClient } from '../../../config/supabase.js';
import { logger } from '../../../utils/logger.js';

export interface PoolFilterParams {
  category?: string;
  search?: string;
  status?: string;
}

export class GroupBuyingRepository {
  private mockPools: GroupBuyPool[] = [...MOCK_GROUP_BUYS];
  private mockMembers: GroupBuyMember[] = [];

  /** Helper to map DB row to GroupBuyPool domain model */
  private mapPoolRowToDomain(row: any): GroupBuyPool {
    const rawDeadline = row.deadline;
    const deadlineIso = new Date(rawDeadline).toISOString();
    const isExpired = new Date(rawDeadline).getTime() < Date.now();

    let status: GroupBuyPool['status'] = row.status;
    if (isExpired && status === 'OPEN') {
      status = 'EXPIRED';
    }

    return {
      id: row.id,
      itemTitle: row.item_title ?? row.itemTitle,
      category: row.category,
      originalPricePerUnit: Number(row.original_price_per_unit ?? row.originalPricePerUnit),
      discountedPricePerUnit: Number(row.discounted_price_per_unit ?? row.discountedPricePerUnit),
      targetQuantity: Number(row.target_quantity ?? row.targetQuantity),
      currentQuantity: Number(row.current_quantity ?? row.currentQuantity ?? 0),
      participantCount: Number(row.participant_count ?? row.participantCount ?? 0),
      status,
      deadline: deadlineIso,
      location: row.location,
      creatorId: row.creator_id ?? row.creatorId,
      createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString()
    };
  }

  /** Helper to map DB member row to domain model */
  private mapMemberRowToDomain(row: any): GroupBuyMember {
    return {
      id: row.id,
      poolId: row.pool_id ?? row.poolId,
      userId: row.user_id ?? row.userId,
      quantity: Number(row.quantity),
      joinedAt: row.joined_at ?? row.joinedAt ?? new Date().toISOString(),
      userFullName: row.profiles?.full_name ?? row.userFullName ?? 'Farmer Participant'
    };
  }

  async findAll(filters?: PoolFilterParams): Promise<GroupBuyPool[]> {
    if (config.useMockData) {
      let result = this.mockPools.map(p => this.withRefreshedStatus(p));
      if (filters?.category && filters.category !== 'all') {
        result = result.filter(p => p.category === filters.category);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(p => p.itemTitle.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
      }
      if (filters?.status) {
        result = result.filter(p => p.status === filters.status);
      }
      return result;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      logger.warn('[GroupBuyingRepository] Supabase client unavailable, falling back to mock pools.');
      return this.mockPools.map(p => this.withRefreshedStatus(p));
    }

    let query = supabase
      .from('group_buying_pools')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      const q = `%${filters.search}%`;
      query = query.or(`item_title.ilike.${q},location.ilike.${q}`);
    }

    const { data, error } = await query;
    if (error) {
      logger.error(`[GroupBuyingRepository] findAll error: ${error.message}`);
      throw new Error(`Database error fetching group buying pools: ${error.message}`);
    }

    return (data || []).map(row => this.mapPoolRowToDomain(row));
  }

  async findById(id: string): Promise<GroupBuyPool | null> {
    if (config.useMockData) {
      const pool = this.mockPools.find(p => p.id === id);
      return pool ? this.withRefreshedStatus(pool) : null;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      const pool = this.mockPools.find(p => p.id === id);
      return pool ? this.withRefreshedStatus(pool) : null;
    }

    const { data, error } = await supabase
      .from('group_buying_pools')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error(`[GroupBuyingRepository] findById error: ${error.message}`);
      throw new Error(`Database error fetching group pool ${id}: ${error.message}`);
    }

    return data ? this.mapPoolRowToDomain(data) : null;
  }

  async create(dto: CreateGroupBuyPoolDto, creatorId: string): Promise<GroupBuyPool> {
    if (config.useMockData) {
      const newPool: GroupBuyPool = {
        id: `b1000000-0000-0000-0000-${Date.now().toString().padStart(12, '0').slice(-12)}`,
        itemTitle: dto.itemTitle,
        category: dto.category,
        originalPricePerUnit: dto.originalPricePerUnit,
        discountedPricePerUnit: dto.discountedPricePerUnit,
        targetQuantity: dto.targetQuantity,
        currentQuantity: 0,
        participantCount: 0,
        status: 'OPEN',
        deadline: dto.deadline,
        location: dto.location,
        creatorId,
        createdAt: new Date().toISOString()
      };
      this.mockPools.unshift(newPool);
      return newPool;
    }

    const dbClient = getSupabaseAdminClient() || getSupabaseClient();
    if (!dbClient) {
      throw new Error('Supabase client unavailable for pool creation.');
    }

    const insertPayload = {
      item_title: dto.itemTitle,
      category: dto.category,
      original_price_per_unit: dto.originalPricePerUnit,
      discounted_price_per_unit: dto.discountedPricePerUnit,
      target_quantity: dto.targetQuantity,
      current_quantity: 0,
      participant_count: 0,
      status: 'OPEN',
      deadline: dto.deadline,
      location: dto.location,
      creator_id: creatorId
    };

    const { data, error } = await dbClient
      .from('group_buying_pools')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      logger.error(`[GroupBuyingRepository] create error: ${error.message}`);
      throw new Error(`Database error creating group pool: ${error.message}`);
    }

    return this.mapPoolRowToDomain(data);
  }

  async joinPool(
    id: string,
    quantity: number,
    userId: string = '00000000-0000-0000-0000-000000000001'
  ): Promise<{ pool: GroupBuyPool | null; error?: string }> {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { pool: null, error: 'Quantity must be a positive integer.' };
    }

    if (config.useMockData) {
      const pool = this.mockPools.find(p => p.id === id);
      if (!pool) return { pool: null, error: 'Group buy pool not found' };

      const refreshed = this.withRefreshedStatus(pool);
      if (refreshed.status !== 'OPEN') {
        return { pool: refreshed, error: `This pool is no longer open (status: ${refreshed.status}).` };
      }

      // Check existing membership in mock
      const existingIdx = this.mockMembers.findIndex(m => m.poolId === id && m.userId === userId);
      if (existingIdx !== -1) {
        this.mockMembers[existingIdx].quantity += quantity;
      } else {
        this.mockMembers.push({
          id: `mem-${Date.now()}`,
          poolId: id,
          userId,
          quantity,
          joinedAt: new Date().toISOString()
        });
        pool.participantCount += 1;
      }

      pool.currentQuantity += quantity;
      if (pool.currentQuantity >= pool.targetQuantity) {
        pool.status = 'THRESHOLD_REACHED';
      }

      return { pool: this.withRefreshedStatus(pool) };
    }

    // Production mode: Invoke atomic RPC function join_group_buying_pool
    const dbClient = getSupabaseAdminClient() || getSupabaseClient();
    if (!dbClient) {
      throw new Error('Supabase client unavailable for joining group buy.');
    }

    const { data: rpcResult, error: rpcError } = await dbClient.rpc('join_group_buying_pool', {
      p_pool_id: id,
      p_user_id: userId,
      p_quantity: quantity
    });

    if (rpcError) {
      logger.error(`[GroupBuyingRepository] atomic join_group_buying_pool RPC error: ${rpcError.message}`);
      throw new Error(`Database transaction error joining group pool: ${rpcError.message}`);
    }

    if (rpcResult && rpcResult.success === false) {
      const updatedPool = await this.findById(id);
      return { pool: updatedPool, error: rpcResult.error || 'Failed to join group buy pool.' };
    }

    const updatedPool = await this.findById(id);
    return { pool: updatedPool };
  }

  async getPoolMembers(poolId: string): Promise<GroupBuyMember[]> {
    if (config.useMockData) {
      return this.mockMembers.filter(m => m.poolId === poolId);
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.mockMembers.filter(m => m.poolId === poolId);
    }

    const { data, error } = await supabase
      .from('group_buying_members')
      .select('*, profiles(full_name)')
      .eq('pool_id', poolId)
      .order('joined_at', { ascending: false });

    if (error) {
      logger.error(`[GroupBuyingRepository] getPoolMembers error: ${error.message}`);
      throw new Error(`Database error fetching pool members: ${error.message}`);
    }

    return (data || []).map(row => this.mapMemberRowToDomain(row));
  }

  async getMyJoinedPools(userId: string): Promise<{ pool: GroupBuyPool; myQuantity: number; joinedAt: string }[]> {
    if (config.useMockData) {
      const userMemberships = this.mockMembers.filter(m => m.userId === userId);
      return userMemberships
        .map(m => {
          const pool = this.mockPools.find(p => p.id === m.poolId);
          if (!pool) return null;
          return {
            pool: this.withRefreshedStatus(pool),
            myQuantity: m.quantity,
            joinedAt: m.joinedAt
          };
        })
        .filter((item): item is { pool: GroupBuyPool; myQuantity: number; joinedAt: string } => item !== null);
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('group_buying_members')
      .select('quantity, joined_at, group_buying_pools(*)')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) {
      logger.error(`[GroupBuyingRepository] getMyJoinedPools error: ${error.message}`);
      throw new Error(`Database error fetching joined pools: ${error.message}`);
    }

    return (data || [])
      .filter((row: any) => row.group_buying_pools)
      .map((row: any) => ({
        pool: this.mapPoolRowToDomain(row.group_buying_pools),
        myQuantity: Number(row.quantity),
        joinedAt: row.joined_at
      }));
  }

  async seedDemoPools(): Promise<{ seededCount: number; message: string }> {
    const demoPools = MOCK_GROUP_BUYS;

    if (config.useMockData) {
      let added = 0;
      for (const pool of demoPools) {
        if (!this.mockPools.some(p => p.id === pool.id)) {
          this.mockPools.push(pool);
          added++;
        }
      }
      return { seededCount: added, message: `Mock seeded successfully. Total pools: ${this.mockPools.length}` };
    }

    const dbClient = getSupabaseAdminClient();
    if (!dbClient) {
      throw new Error('Supabase service-role admin client required for seeding.');
    }

    const seedPayloads = demoPools.map(p => ({
      id: p.id,
      item_title: p.itemTitle,
      category: p.category,
      original_price_per_unit: p.originalPricePerUnit,
      discounted_price_per_unit: p.discountedPricePerUnit,
      target_quantity: p.targetQuantity,
      current_quantity: p.currentQuantity,
      participant_count: p.participantCount,
      status: p.status,
      deadline: p.deadline,
      location: p.location
    }));

    const { data, error } = await dbClient
      .from('group_buying_pools')
      .upsert(seedPayloads, { onConflict: 'id', ignoreDuplicates: true })
      .select();

    if (error) {
      logger.error(`[GroupBuyingRepository] seed error: ${error.message}`);
      throw new Error(`Database error seeding group buying pools: ${error.message}`);
    }

    const seededCount = data ? data.length : 0;
    return {
      seededCount,
      message: `Database idempotent seed completed. ${seededCount} pools upserted/verified.`
    };
  }

  /** Auto-expires a pool whose deadline has passed and it never reached its target */
  private withRefreshedStatus(pool: GroupBuyPool): GroupBuyPool {
    const isExpired = new Date(pool.deadline).getTime() < Date.now();
    if (isExpired && pool.status === 'OPEN') {
      pool.status = 'EXPIRED';
    }
    return pool;
  }
}
