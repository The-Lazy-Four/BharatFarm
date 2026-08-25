import { MarketplaceRepository } from '../repositories/marketplace.repository.js';
import { ProductListing, CreateListingDto } from '../types/marketplace.types.js';

export class MarketplaceService {
  private repository: MarketplaceRepository;

  constructor() {
    this.repository = new MarketplaceRepository();
  }

  async getAllListings(): Promise<ProductListing[]> {
    return await this.repository.findAll();
  }

  async getListingById(id: string): Promise<ProductListing | null> {
    return await this.repository.findById(id);
  }

  async createListing(dto: CreateListingDto, sellerId: string, sellerName?: string): Promise<ProductListing> {
    return await this.repository.create(dto, sellerId, sellerName);
  }

  async updateListing(id: string, dto: Partial<CreateListingDto>): Promise<ProductListing | null> {
    return await this.repository.update(id, dto);
  }

  async deleteListing(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
