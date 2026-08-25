import { ProductListing, CreateListingDto } from '../types/marketplace.types.js';
import { MOCK_LISTINGS } from '../mock/marketplace.mock.js';

export class MarketplaceRepository {
  private listings: ProductListing[] = [...MOCK_LISTINGS];

  async findAll(): Promise<ProductListing[]> {
    return this.listings;
  }

  async findById(id: string): Promise<ProductListing | null> {
    return this.listings.find(item => item.id === id) || null;
  }

  async create(dto: CreateListingDto, sellerId: string, sellerName = 'Current User'): Promise<ProductListing> {
    const whatsapp = dto.sellerPhone ? dto.sellerPhone.replace(/\D/g, '') : undefined;
    const newListing: ProductListing = {
      id: `prod-${Date.now()}`,
      ...dto,
      sellerId,
      sellerName,
      sellerWhatsapp: whatsapp,
      verified: false,
      createdAt: new Date().toISOString()
    };
    this.listings.unshift(newListing);
    return newListing;
  }

  async update(id: string, dto: Partial<CreateListingDto>): Promise<ProductListing | null> {
    const index = this.listings.findIndex(item => item.id === id);
    if (index === -1) return null;
    this.listings[index] = { ...this.listings[index], ...dto };
    return this.listings[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLen = this.listings.length;
    this.listings = this.listings.filter(item => item.id !== id);
    return this.listings.length < initialLen;
  }
}
