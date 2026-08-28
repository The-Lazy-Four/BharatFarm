import { describe, it, expect, beforeEach } from 'vitest';
import { MarketplaceRepository } from '../src/modules/marketplace/repositories/marketplace.repository.js';
import { config } from '../src/config/env.js';

describe('Marketplace API Endpoints & Seller Security', () => {
  beforeEach(() => {
    (config as any).useMockData = true;
  });

  it('GET /api/marketplace/listings returns marketplace listings', async () => {
    const repository = new MarketplaceRepository();
    const listings = await repository.findAll();
    expect(Array.isArray(listings)).toBe(true);
    expect(listings.length).toBeGreaterThan(0);
  });

  it('POST /api/marketplace/listings creates a listing under authenticated seller', async () => {
    const repository = new MarketplaceRepository();
    const sellerId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    const newListing = await repository.create(
      {
        title: 'Organic Wheat Seed 100kg',
        category: 'seeds',
        price: 2400,
        unit: 'quintal',
        quantityAvailable: 50,
        location: 'Ludhiana, Punjab',
        sellerPhone: '9876543210'
      },
      sellerId,
      'Ramesh Patel',
      '9876543210'
    );

    expect(newListing).toHaveProperty('id');
    expect(newListing.sellerId).toBe(sellerId);
    expect(newListing.sellerName).toBe('Ramesh Patel');
  });

  it('DELETE listing denies unauthorized sellers', async () => {
    const repository = new MarketplaceRepository();
    const ownerId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    const attackerId = 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e';
    const created = await repository.create(
      {
        title: 'Hybrid Maize',
        category: 'crops',
        price: 1800,
        unit: 'quintal',
        quantityAvailable: 20,
        location: 'Karnal, Haryana',
        sellerPhone: '9876543210'
      },
      ownerId,
      'Ramesh Patel',
      '9876543210'
    );

    await expect(repository.delete(created.id, attackerId)).rejects.toThrow('FORBIDDEN_SELLER_OPERATION');
  });

  it('DELETE listing allows actual owner seller', async () => {
    const repository = new MarketplaceRepository();
    const ownerId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    const created = await repository.create(
      {
        title: 'Fresh Mustard',
        category: 'crops',
        price: 5200,
        unit: 'quintal',
        quantityAvailable: 15,
        location: 'Alwar, Rajasthan',
        sellerPhone: '9876543210'
      },
      ownerId,
      'Ramesh Patel',
      '9876543210'
    );

    const deleted = await repository.delete(created.id, ownerId);
    expect(deleted).toBe(true);
  });
});

