import { ProductListing, CreateListingDto } from '../types/marketplace.types.js';
import { MOCK_LISTINGS } from '../mock/marketplace.mock.js';
import { config } from '../../../config/env.js';
import { getSupabaseClient, getSupabaseAdminClient } from '../../../config/supabase.js';
import { logger } from '../../../utils/logger.js';

export interface ListingFilterParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
}

export class MarketplaceRepository {
  private mockListings: ProductListing[] = [...MOCK_LISTINGS];

  /**
   * Helper to map DB row to ProductListing domain interface
   */
  private mapRowToDomain(row: any): ProductListing {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      price: Number(row.price),
      unit: row.unit,
      quantityAvailable: Number(row.quantity_available ?? row.quantityAvailable ?? 0),
      location: row.location,
      sellerId: row.seller_id ?? row.sellerId,
      sellerName: row.seller_name ?? row.sellerName ?? 'Farmer',
      sellerRating: row.seller_rating != null ? Number(row.seller_rating) : (row.sellerRating != null ? Number(row.sellerRating) : 4.5),
      sellerWhatsapp: row.seller_whatsapp ?? row.sellerWhatsapp ?? undefined,
      sellerPhone: row.seller_phone ?? row.sellerPhone ?? undefined,
      verified: Boolean(row.verified),
      imageUrl: row.image_url ?? row.imageUrl ?? undefined,
      createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString()
    };
  }

  async findAll(filters?: ListingFilterParams): Promise<ProductListing[]> {
    if (config.useMockData) {
      let result = [...this.mockListings];
      if (filters?.category && filters.category !== 'all') {
        result = result.filter(item => item.category === filters.category);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(item =>
          item.title.toLowerCase().includes(q) ||
          item.sellerName.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      }
      if (filters?.minPrice !== undefined) {
        result = result.filter(item => item.price >= filters.minPrice!);
      }
      if (filters?.maxPrice !== undefined) {
        result = result.filter(item => item.price <= filters.maxPrice!);
      }
      if (filters?.sellerId) {
        result = result.filter(item => item.sellerId === filters.sellerId);
      }
      return result;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      logger.warn('[MarketplaceRepository] Supabase client unavailable, falling back to mock listings.');
      return this.mockListings;
    }

    let query = supabase
      .from('marketplace_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters?.sellerId) {
      query = query.eq('seller_id', filters.sellerId);
    }
    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters?.search) {
      const q = `%${filters.search}%`;
      query = query.or(`title.ilike.${q},location.ilike.${q},seller_name.ilike.${q}`);
    }

    const { data, error } = await query;
    if (error) {
      logger.error(`[MarketplaceRepository] findAll error: ${error.message}`);
      throw new Error(`Database error fetching marketplace listings: ${error.message}`);
    }

    return (data || []).map(row => this.mapRowToDomain(row));
  }

  async findById(id: string): Promise<ProductListing | null> {
    if (config.useMockData) {
      return this.mockListings.find(item => item.id === id) || null;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return this.mockListings.find(item => item.id === id) || null;
    }

    const { data, error } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error(`[MarketplaceRepository] findById error: ${error.message}`);
      throw new Error(`Database error fetching listing ${id}: ${error.message}`);
    }

    return data ? this.mapRowToDomain(data) : null;
  }

  async create(
    dto: CreateListingDto,
    sellerId: string,
    sellerName = 'Farmer',
    sellerPhone?: string
  ): Promise<ProductListing> {
    const rawPhone = dto.sellerPhone || sellerPhone || '';
    const whatsapp = rawPhone ? rawPhone.replace(/\D/g, '') : undefined;

    if (config.useMockData) {
      const newListing: ProductListing = {
        id: `prod-${Date.now()}`,
        title: dto.title,
        category: dto.category,
        price: dto.price,
        unit: dto.unit,
        quantityAvailable: dto.quantityAvailable,
        location: dto.location,
        sellerId,
        sellerName,
        sellerWhatsapp: whatsapp,
        sellerPhone: rawPhone,
        verified: true,
        imageUrl: dto.imageUrl,
        createdAt: new Date().toISOString()
      };
      this.mockListings.unshift(newListing);
      return newListing;
    }

    // In production mode, write directly to Supabase table
    const dbClient = getSupabaseAdminClient() || getSupabaseClient();
    if (!dbClient) {
      throw new Error('Supabase client unavailable for listing creation.');
    }

    const insertPayload = {
      title: dto.title,
      category: dto.category,
      price: dto.price,
      unit: dto.unit,
      quantity_available: dto.quantityAvailable,
      location: dto.location,
      seller_id: sellerId,
      seller_name: sellerName,
      seller_rating: 4.8,
      seller_phone: rawPhone || null,
      seller_whatsapp: whatsapp || null,
      verified: true,
      image_url: dto.imageUrl || null
    };

    const { data, error } = await dbClient
      .from('marketplace_products')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      logger.error(`[MarketplaceRepository] create error: ${error.message}`);
      throw new Error(`Database error creating listing: ${error.message}`);
    }

    return this.mapRowToDomain(data);
  }

  async update(id: string, dto: Partial<CreateListingDto>, sellerId?: string): Promise<ProductListing | null> {
    if (config.useMockData) {
      const index = this.mockListings.findIndex(item => item.id === id);
      if (index === -1) return null;
      if (sellerId && this.mockListings[index].sellerId !== sellerId) {
        throw new Error('FORBIDDEN_SELLER_OPERATION');
      }
      this.mockListings[index] = { ...this.mockListings[index], ...dto };
      return this.mockListings[index];
    }

    const dbClient = getSupabaseAdminClient() || getSupabaseClient();
    if (!dbClient) {
      throw new Error('Supabase client unavailable for listing update.');
    }

    // First check ownership if sellerId passed
    if (sellerId) {
      const existing = await this.findById(id);
      if (!existing) return null;
      if (existing.sellerId !== sellerId) {
        throw new Error('FORBIDDEN_SELLER_OPERATION');
      }
    }

    const updatePayload: Record<string, any> = {};
    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.category !== undefined) updatePayload.category = dto.category;
    if (dto.price !== undefined) updatePayload.price = dto.price;
    if (dto.unit !== undefined) updatePayload.unit = dto.unit;
    if (dto.quantityAvailable !== undefined) updatePayload.quantity_available = dto.quantityAvailable;
    if (dto.location !== undefined) updatePayload.location = dto.location;
    if (dto.imageUrl !== undefined) updatePayload.image_url = dto.imageUrl;
    if (dto.sellerPhone !== undefined) {
      updatePayload.seller_phone = dto.sellerPhone;
      updatePayload.seller_whatsapp = dto.sellerPhone.replace(/\D/g, '');
    }

    const { data, error } = await dbClient
      .from('marketplace_products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      logger.error(`[MarketplaceRepository] update error: ${error.message}`);
      throw new Error(`Database error updating listing ${id}: ${error.message}`);
    }

    return data ? this.mapRowToDomain(data) : null;
  }

  async delete(id: string, sellerId?: string): Promise<boolean> {
    if (config.useMockData) {
      const existing = this.mockListings.find(item => item.id === id);
      if (!existing) return false;
      if (sellerId && existing.sellerId !== sellerId) {
        throw new Error('FORBIDDEN_SELLER_OPERATION');
      }
      const initialLen = this.mockListings.length;
      this.mockListings = this.mockListings.filter(item => item.id !== id);
      return this.mockListings.length < initialLen;
    }

    const dbClient = getSupabaseAdminClient() || getSupabaseClient();
    if (!dbClient) {
      throw new Error('Supabase client unavailable for listing deletion.');
    }

    if (sellerId) {
      const existing = await this.findById(id);
      if (!existing) return false;
      if (existing.sellerId !== sellerId) {
        throw new Error('FORBIDDEN_SELLER_OPERATION');
      }
    }

    const { error, count } = await dbClient
      .from('marketplace_products')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      logger.error(`[MarketplaceRepository] delete error: ${error.message}`);
      throw new Error(`Database error deleting listing ${id}: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }
}

