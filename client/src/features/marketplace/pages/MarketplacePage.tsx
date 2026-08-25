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
import { FEATURE_IMAGES } from '../../../constants/featureImages.js';

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
      {/* Visual Agricultural Header Banner */}
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Direct Trade Ecosystem</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Marketplace — Connect Directly with Buyers & Sellers
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Trade crops, certified seeds, organic fertilizers, and heavy farm equipment directly.
          </p>
        </div>

        <Link to="/marketplace/new">
          <Button variant="primary" size="md">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> List My Produce
          </Button>
        </Link>
      </div>

      {/* Featured Market Categories (Image-backed) */}
      <div className="mobile-grid-2">
        <div
          className="card-feature-backed"
          onClick={() => setCategory('crops')}
          style={{ minHeight: '110px' }}
        >
          <img src={FEATURE_IMAGES.marketplace.url} alt="Crops" className="card-feature-bg" />
          <div className="card-feature-overlay" />
          <div className="card-feature-content">
            <span className="badge badge-primary">Direct Produce</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '0.25rem', color: '#FFFFFF' }}>Fresh Harvest Crops</h4>
            <p style={{ fontSize: '0.72rem', opacity: 0.88, color: '#FFFFFF' }}>Wheat, Paddy, Pulses & Vegetables</p>
          </div>
        </div>

        <div
          className="card-feature-backed"
          onClick={() => setCategory('seeds')}
          style={{ minHeight: '110px' }}
        >
          <img src={FEATURE_IMAGES.groupbuying.url} alt="Seeds & Inputs" className="card-feature-bg" />
          <div className="card-feature-overlay" />
          <div className="card-feature-content">
            <span className="badge badge-success">Certified Inputs</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '0.25rem', color: '#FFFFFF' }}>Seeds & Fertilizers</h4>
            <p style={{ fontSize: '0.72rem', opacity: 0.88, color: '#FFFFFF' }}>Bio-pesticides & Hybrid Seeds</p>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
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

        {/* Right Sidebar: Live Mandi Benchmark Prices */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Live Mandi Price Benchmarks" subtitle="Governed MSP & Regional Market Spot Rates">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div className="alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Wheat (Sharbati)</h5>
                  <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>Khanna Mandi • Punjab</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1rem' }}>₹2,275 / qtl</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>▲ +2.4%</span>
                </div>
              </div>

              <div className="alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Paddy (Basmati 1121)</h5>
                  <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>Karnal Mandi • Haryana</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1rem' }}>₹4,150 / qtl</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>▲ +1.1%</span>
                </div>
              </div>

              <div className="alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Mustard (Pusa 30)</h5>
                  <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>Alwar Mandi • Rajasthan</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1rem' }}>₹5,400 / qtl</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>▲ +0.8%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
