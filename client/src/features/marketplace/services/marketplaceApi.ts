import { ApiClient } from '../../../services/apiClient.js';
import { ProductListing, CreateListingInput } from '../types/marketplace.types.js';

export class MarketplaceApi {
  static async getListings(): Promise<ProductListing[]> {
    const res = await ApiClient.get<ProductListing[]>('/marketplace/listings');
    return res.data || [];
  }

  static async getListingById(id: string): Promise<ProductListing | null> {
    const res = await ApiClient.get<ProductListing>(`/marketplace/listings/${id}`);
    return res.data || null;
  }

  static async createListing(data: CreateListingInput): Promise<ProductListing | null> {
    const res = await ApiClient.post<ProductListing>('/marketplace/listings', data);
    return res.data || null;
  }
}
