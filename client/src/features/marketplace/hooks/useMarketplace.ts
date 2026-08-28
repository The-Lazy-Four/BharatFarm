import { useState, useEffect, useCallback } from 'react';
import { ProductListing, CreateListingInput } from '../types/marketplace.types.js';
import { MarketplaceApi, MarketplaceQueryParams } from '../services/marketplaceApi.js';
import { MOCK_PRODUCT_LISTINGS } from '../mock/marketplace.mock.js';

export const useMarketplace = (initialParams?: MarketplaceQueryParams) => {
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async (params?: MarketplaceQueryParams) => {
    setIsLoading(true);
    try {
      const data = await MarketplaceApi.getListings(params || initialParams);
      setListings(data);
      setError(null);
    } catch (err: any) {
      setListings(MOCK_PRODUCT_LISTINGS);
      setError(err?.message || 'Could not reach the server, showing offline listings.');
    } finally {
      setIsLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const createListing = useCallback(
    async (input: CreateListingInput): Promise<ProductListing> => {
      const created = await MarketplaceApi.createListing(input);
      setListings(prev => [created, ...prev]);
      return created;
    },
    []
  );

  const updateListing = useCallback(
    async (id: string, input: Partial<CreateListingInput>): Promise<ProductListing> => {
      const updated = await MarketplaceApi.updateListing(id, input);
      setListings(prev => prev.map(item => item.id === id ? updated : item));
      return updated;
    },
    []
  );

  const deleteListing = useCallback(
    async (id: string): Promise<boolean> => {
      await MarketplaceApi.deleteListing(id);
      setListings(prev => prev.filter(item => item.id !== id));
      return true;
    },
    []
  );

  return {
    listings,
    isLoading,
    error,
    refetch: fetchListings,
    createListing,
    updateListing,
    deleteListing
  };
};

export const useProductListing = (id: string | undefined) => {
  const [product, setProduct] = useState<ProductListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    MarketplaceApi.getListingById(id)
      .then(data => {
        setProduct(data ?? MOCK_PRODUCT_LISTINGS.find(item => item.id === id) ?? null);
        setError(null);
      })
      .catch(err => {
        const fallback = MOCK_PRODUCT_LISTINGS.find(item => item.id === id);
        setProduct(fallback || null);
        if (!fallback) {
          setError(err?.message || 'Failed to load listing');
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  return { product, isLoading, error };
};

