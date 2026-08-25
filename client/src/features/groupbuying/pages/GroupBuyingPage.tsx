import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card.js';
import { Input } from '../../../components/ui/Input.js';
import { GroupBuyCard } from '../components/GroupBuyCard.js';
import { useGroupBuying } from '../hooks/useGroupBuying.js';
import { Spinner } from '../../../components/ui/Spinner.js';
import { EmptyState } from '../../../components/ui/EmptyState.js';

const CATEGORIES = ['all', 'fertilizer', 'seeds', 'machinery'] as const;

export const GroupBuyingPage: React.FC = () => {
  const { pools, isLoading, error, joinPool } = useGroupBuying();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all');

  const filtered = pools.filter(pool => {
    const matchesSearch = !search || pool.itemTitle.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || pool.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card
        title="Group Buying & Input Pooling"
        subtitle="Collaborate with nearby farmers to unlock bulk pricing on essential agricultural supplies."
      >
        <Input placeholder="Search fertilizer, seeds, machinery..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '20px',
                border: `1px solid ${category === cat ? 'var(--primary)' : 'var(--border-color)'}`,
                background: category === cat ? 'var(--primary)' : 'transparent',
                color: category === cat ? '#fff' : 'var(--text-main)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚠️ {error}</p>}
      </Card>

      {isLoading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState message="No group buying pools found for this filter." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(pool => (
            <GroupBuyCard key={pool.id} pool={pool} onJoin={qty => joinPool(pool.id, qty)} />
          ))}
        </div>
      )}
    </div>
  );
};
