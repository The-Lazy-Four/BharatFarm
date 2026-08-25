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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Direct Trade Ecosystem</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--dark-text)' }}>
            Marketplace — Connect Directly with Buyers & Sellers
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Trade crops, certified seeds, organic fertilizers, and heavy farm equipment directly.
          </p>
        </div>

        <Link to="/marketplace/new">
          <Button variant="primary" size="md">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> List My Produce
          </Button>
        </Link>
      </div>

      {/* Main Layout Grid matching Stitch */}
      <div className="grid-dashboard">
        {/* Main Product Catalog Section (Span 8) */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Active Produce & Input Listings" subtitle="Filter by crop category or search by seller district.">
            <SearchBar value={search} onChange={setSearch} />
            <div style={{ marginTop: '1rem' }}>
              <FilterPanel selected={category} onSelect={setCategory} />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠️ {error}</p>}
          </Card>

          {isLoading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <EmptyState message="No listings found. Try adjusting your search query or category filter." />
          ) : (
            <ProductGrid products={filtered} />
          )}
        </div>

        {/* Right Sidebar: Live Mandi Benchmark Prices & Direct Seller Stats (Stitch reference) */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Mandi Benchmark Prices Panel */}
          <Card title="Live Mandi Price Benchmarks" subtitle="Governed MSP & Regional Market Spot Rates">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(215, 242, 26, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--signal-lime)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Wheat (Sharbati)</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Khanna Mandi • Punjab</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--dark-text)' }}>₹2,275 / qtl</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--dark-text)', fontWeight: 700 }}>▲ +2.4%</span>
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: '#FFFDF5', borderRadius: 'var(--radius-sm)', border: '1px solid #FCD34D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Paddy (Basmati 1121)</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tarn Taran • Punjab</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1rem', color: '#92400E' }}>₹4,150 / qtl</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Stable</span>
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--card-gray)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,37,31,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Mustard Seed</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bhatinda Mandi</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--dark-text)' }}>₹5,450 / qtl</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--dark-text)', fontWeight: 700 }}>▲ +1.1%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Seller Trust & Verification Note */}
          <Card title="Farmer Direct Guarantee">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              All listings are verified against local Krishi Bhavan land registrations to eliminate middlemen fees and ensure fair pricing.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
