import { useState, useEffect, useCallback } from 'react';
import { GroupBuyPool } from '../types/groupBuying.types';
import { GroupBuyingApi } from '../services/groupBuyingApi';
import { MOCK_GROUP_BUYS } from '../mock/groupBuying.mock';

export const useGroupBuying = () => {
  const [pools, setPools] = useState<GroupBuyPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    GroupBuyingApi.getPools()
      .then(data => setPools(data.length > 0 ? data : MOCK_GROUP_BUYS))
      .catch(() => setPools(MOCK_GROUP_BUYS))
      .finally(() => setIsLoading(false));
  }, []);

  const joinPool = useCallback(async (id: string, quantity: number) => {
    setError(null);
    const { pool, error: joinError } = await GroupBuyingApi.joinPool(id, quantity);
    if (pool) {
      setPools(prev => prev.map(p => (p.id === id ? pool : p)));
      return true;
    }
    setError(joinError || 'Failed to join this group buy pool.');
    return false;
  }, []);

  return { pools, isLoading, error, joinPool };
};

export const useGroupBuyDetails = (id: string | undefined) => {
  const [pool, setPool] = useState<GroupBuyPool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    GroupBuyingApi.getPoolById(id)
      .then(data => setPool(data ?? MOCK_GROUP_BUYS.find(p => p.id === id) ?? null))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const joinPool = useCallback(
    async (quantity: number) => {
      if (!id) return false;
      setError(null);
      const { pool: updated, error: joinError } = await GroupBuyingApi.joinPool(id, quantity);
      if (updated) {
        setPool(updated);
        return true;
      }
      setError(joinError || 'Failed to join this group buy pool.');
      return false;
    },
    [id]
  );

  return { pool, isLoading, error, joinPool };
};
