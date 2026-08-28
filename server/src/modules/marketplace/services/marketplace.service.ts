import { MarketplaceRepository, ListingFilterParams } from '../repositories/marketplace.repository.js';
import { ProductListing, CreateListingDto } from '../types/marketplace.types.js';

export class MarketplaceService {
  private repository: MarketplaceRepository;

  constructor() {
    this.repository = new MarketplaceRepository();
  }

  async getAllListings(filters?: ListingFilterParams): Promise<ProductListing[]> {
    return await this.repository.findAll(filters);
  }

  async getListingById(id: string): Promise<ProductListing | null> {
    return await this.repository.findById(id);
  }

  async createListing(
    dto: CreateListingDto,
    sellerId: string,
    sellerName?: string,
    sellerPhone?: string
  ): Promise<ProductListing> {
    return await this.repository.create(dto, sellerId, sellerName, sellerPhone);
  }

  async updateListing(
    id: string,
    dto: Partial<CreateListingDto>,
    sellerId?: string
  ): Promise<ProductListing | null> {
    return await this.repository.update(id, dto, sellerId);
  }

  async deleteListing(id: string, sellerId?: string): Promise<boolean> {
    return await this.repository.delete(id, sellerId);
  }
}

