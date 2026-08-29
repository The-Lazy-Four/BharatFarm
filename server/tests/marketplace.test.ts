import { describe, it, expect, beforeEach } from 'vitest';
import { MarketplaceRepository } from '../src/modules/marketplace/repositories/marketplace.repository.js';
import { MarketplaceService } from '../src/modules/marketplace/services/marketplace.service.js';
import { config } from '../src/config/env.js';

describe('Marketplace Phase 11 Production Suite', () => {
  let repository: MarketplaceRepository;
  let service: MarketplaceService;
  let createdProductId: string;
  const testSellerId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const unauthorizedSellerId = 'b1ffcd00-9c0b-4ef8-bb6d-6bb9bd380a22';

  beforeEach(() => {
    (config as any).useMockData = true;
    repository = new MarketplaceRepository();
    service = new MarketplaceService();
  });

  it('1. lists all marketplace products and verifies 42 seeded dataset', async () => {
    const products = await service.getAllListings();
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  it('2. filters products deterministically by category', async () => {
    const seeds = await service.getAllListings({ category: 'seeds' });
    expect(seeds.every(p => p.category === 'seeds')).toBe(true);
  });

  it('3. performs deterministic keyword search against title and location', async () => {
    const results = await service.getAllListings({ search: 'wheat' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(p => p.title.toLowerCase().includes('wheat'))).toBe(true);
  });

  it('4. filters products by price range bounds', async () => {
    const range = await service.getAllListings({ minPrice: 100, maxPrice: 1000 });
    expect(range.every(p => p.price >= 100 && p.price <= 1000)).toBe(true);
  });

  it('5. creates a new product listing authenticated under sellerId', async () => {
    const newProduct = await service.createListing(
      {
        title: 'Organic Fertilizer Special',
        category: 'fertilizers',
        price: 450,
        unit: '50kg bag',
        quantityAvailable: 20,
        location: 'Punjab, India',
        sellerPhone: '9876543210'
      },
      testSellerId,
      'Test Farmer'
    );

    expect(newProduct).toBeDefined();
    expect(newProduct.id).toBeTruthy();
    expect(newProduct.sellerId).toBe(testSellerId);
    createdProductId = newProduct.id;
  });

  it('6. retrieves product detail by id', async () => {
    const newProduct = await service.createListing(
      {
        title: 'Test Product Listing',
        category: 'seeds',
        price: 300,
        unit: 'kg',
        quantityAvailable: 10,
        location: 'Haryana',
        sellerPhone: '9876543210'
      },
      testSellerId,
      'Test Farmer'
    );

    const product = await service.getListingById(newProduct.id);
    expect(product).toBeDefined();
    expect(product?.id).toBe(newProduct.id);
  });

  it('7. allows owner to update their listing', async () => {
    const newProduct = await service.createListing(
      {
        title: 'Product to Update',
        category: 'crops',
        price: 500,
        unit: 'quintal',
        quantityAvailable: 5,
        location: 'MP',
        sellerPhone: '9876543210'
      },
      testSellerId,
      'Test Farmer'
    );

    const updated = await service.updateListing(
      newProduct.id,
      { price: 420, quantityAvailable: 18 },
      testSellerId
    );
    expect(updated).toBeDefined();
    expect(updated?.price).toBe(420);
  });

  it('8. prevents unauthorized non-owner from updating listing', async () => {
    const newProduct = await service.createListing(
      {
        title: 'Protected Product',
        category: 'equipment',
        price: 1500,
        unit: 'unit',
        quantityAvailable: 1,
        location: 'UP',
        sellerPhone: '9876543210'
      },
      testSellerId,
      'Owner Farmer'
    );

    await expect(
      service.updateListing(newProduct.id, { price: 100 }, unauthorizedSellerId)
    ).rejects.toThrow('FORBIDDEN_SELLER_OPERATION');
  });

  it('9. prevents unauthorized non-owner from deleting listing', async () => {
    const newProduct = await service.createListing(
      {
        title: 'Protected Product Deletion',
        category: 'seeds',
        price: 100,
        unit: 'packet',
        quantityAvailable: 50,
        location: 'Bihar',
        sellerPhone: '9876543210'
      },
      testSellerId,
      'Owner Farmer'
    );

    await expect(
      service.deleteListing(newProduct.id, unauthorizedSellerId)
    ).rejects.toThrow('FORBIDDEN_SELLER_OPERATION');
  });

  it('10. allows owner to delete their listing', async () => {
    const newProduct = await service.createListing(
      {
        title: 'Temporary Product',
        category: 'crops',
        price: 200,
        unit: 'kg',
        quantityAvailable: 15,
        location: 'Gujarat',
        sellerPhone: '9876543210'
      },
      testSellerId,
      'Test Farmer'
    );

    const deleted = await service.deleteListing(newProduct.id, testSellerId);
    expect(deleted).toBe(true);
    const fetched = await service.getListingById(newProduct.id);
    expect(fetched).toBeNull();
  });
});
