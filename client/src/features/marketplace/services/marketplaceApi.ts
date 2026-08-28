import { ApiClient } from '../../../services/apiClient.js';
import { ProductListing, CreateListingInput } from '../types/marketplace.types.js';

export interface MarketplaceQueryParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
}

export class MarketplaceApi {
  static async getListings(params?: MarketplaceQueryParams): Promise<ProductListing[]> {
    const queryParts: string[] = [];
    if (params?.category && params.category !== 'all') {
      queryParts.push(`category=${encodeURIComponent(params.category)}`);
    }
    if (params?.search) {
      queryParts.push(`search=${encodeURIComponent(params.search)}`);
    }
    if (params?.minPrice !== undefined) {
      queryParts.push(`minPrice=${params.minPrice}`);
    }
    if (params?.maxPrice !== undefined) {
      queryParts.push(`maxPrice=${params.maxPrice}`);
    }
    if (params?.sellerId) {
      queryParts.push(`sellerId=${encodeURIComponent(params.sellerId)}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const res = await ApiClient.get<ProductListing[]>(`/marketplace/listings${queryString}`);
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to fetch listings');
    }
    return res.data || [];
  }

  static async getListingById(id: string): Promise<ProductListing | null> {
    const res = await ApiClient.get<ProductListing>(`/marketplace/listings/${id}`);
    if (!res.success) {
      if (res.error?.code === 'NOT_FOUND') return null;
      throw new Error(res.error?.message || 'Failed to fetch listing details');
    }
    return res.data || null;
  }

  static async createListing(data: CreateListingInput): Promise<ProductListing> {
    const res = await ApiClient.post<ProductListing>('/marketplace/listings', data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to create listing');
    }
    return res.data;
  }

  static async updateListing(id: string, data: Partial<CreateListingInput>): Promise<ProductListing> {
    const res = await ApiClient.patch<ProductListing>(`/marketplace/listings/${id}`, data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to update listing');
    }
    return res.data;
  }

  static async deleteListing(id: string): Promise<boolean> {
    const res = await ApiClient.delete<{ id: string }>(`/marketplace/listings/${id}`);
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to delete listing');
    }
    return true;
  }
}

