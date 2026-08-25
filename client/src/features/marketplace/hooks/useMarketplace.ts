import { useState, useEffect, useCallback } from 'react';
import { ProductListing, CreateListingInput } from '../types/marketplace.types.js';
import { MarketplaceApi } from '../services/marketplaceApi.js';
import { MOCK_PRODUCT_LISTINGS } from '../mock/marketplace.mock.js';

export const useMarketplace = () => {
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(() => {
    setIsLoading(true);
    return MarketplaceApi.getListings()
      .then(data => {
        setListings(data.length > 0 ? data : MOCK_PRODUCT_LISTINGS);
        setError(null);
      })
      .catch(() => {
        setListings(MOCK_PRODUCT_LISTINGS);
        setError('Could not reach the server, showing offline listings.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const createListing = useCallback(
    async (input: CreateListingInput): Promise<ProductListing> => {
      const created = await MarketplaceApi.createListing(input);
      if (created) {
        setListings(prev => [created, ...prev]);
        return created;
      }
      throw new Error('Failed to publish listing. Please try again.');
    },
    []
  );

  return { listings, isLoading, error, refetch: fetchListings, createListing };
};

export const useProductListing = (id: string | undefined) => {
  const [product, setProduct] = useState<ProductListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    MarketplaceApi.getListingById(id)
      .then(data => {
        setProduct(data ?? MOCK_PRODUCT_LISTINGS.find(item => item.id === id) ?? null);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  return { product, isLoading };
};
