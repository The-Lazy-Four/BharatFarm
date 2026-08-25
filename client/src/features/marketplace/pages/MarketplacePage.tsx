import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.js';
import { ProductGrid } from '../components/ProductGrid.js';
import { SearchBar } from '../components/SearchBar.js';
import { FilterPanel } from '../components/FilterPanel.js';
import { useMarketplace } from '../hooks/useMarketplace.js';
import { Spinner } from '../../../components/ui/Spinner.js';
import { EmptyState } from '../../../components/ui/EmptyState.js';
import { Button } from '../../../components/ui/Button.js';

export const MarketplacePage: React.FC = () => {
  const { listings, isLoading, error } = useMarketplace();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = listings.filter(item => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.sellerName.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);
    const matchesCat = category === 'all' || item.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card
        title="Agri Direct Marketplace"
        subtitle="Buy & sell crops, seeds, fertilizers and equipment direct from verified farmers and sellers."
        action={
          <Link to="/marketplace/new">
            <Button size="sm">+ Sell Produce</Button>
          </Link>
        }
      >
        <SearchBar value={search} onChange={setSearch} />
        <FilterPanel selected={category} onSelect={setCategory} />
        {error && <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚠️ {error}</p>}
      </Card>

      {isLoading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState message="No listings found. Try a different category or search term." />
      ) : (
        <ProductGrid products={filtered} />
      )}
    </div>
  );
};
