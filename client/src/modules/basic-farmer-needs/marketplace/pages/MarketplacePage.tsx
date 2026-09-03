import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@core/ui/Card';
import { ProductGrid } from '../components/ProductGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { useMarketplace } from '../hooks/useMarketplace';
import { Spinner } from '@core/ui/Spinner';
import { EmptyState } from '@core/ui/EmptyState';
import { Button } from '@core/ui/Button';
import { FEATURE_IMAGES } from '@core/constants/featureImages';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Visual Agricultural Header Banner */}
      <div className="page-header-banner" style={{ padding: '0.85rem 1rem' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.2rem', fontSize: '0.65rem' }}>Direct Trade Ecosystem</span>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Marketplace — Direct Farmer Trade
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Trade crops, certified seeds, organic fertilizers, and farm equipment directly.
          </p>
        </div>

        <Link to="/marketplace/new">
          <Button variant="primary" size="sm">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> List Produce
          </Button>
        </Link>
      </div>

      {/* Featured Market Categories (Image-backed) */}
      <div className="mobile-grid-2">
        <div
          className="card-feature-backed"
          onClick={() => setCategory('crops')}
          style={{ minHeight: '85px', padding: '0.65rem' }}
        >
          <img src={FEATURE_IMAGES.marketplace.url} alt="Crops" className="card-feature-bg" />
          <div className="card-feature-overlay" />
          <div className="card-feature-content">
            <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>Direct Produce</span>
            <h4 className="text-embossed" style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '0.15rem' }}>Fresh Harvest Crops</h4>
            <p style={{ fontSize: '0.68rem', color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}>Wheat, Paddy, Pulses & Produce</p>
          </div>
        </div>

        <div
          className="card-feature-backed"
          onClick={() => setCategory('seeds')}
          style={{ minHeight: '85px', padding: '0.65rem' }}
        >
          <img src={FEATURE_IMAGES.groupbuying.url} alt="Seeds & Inputs" className="card-feature-bg" />
          <div className="card-feature-overlay" />
          <div className="card-feature-content">
            <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>Certified Inputs</span>
            <h4 className="text-embossed" style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '0.15rem' }}>Seeds & Fertilizers</h4>
            <p style={{ fontSize: '0.68rem', color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}>Bio-pesticides & Hybrids</p>
          </div>
        </div>

      </div>

      {/* Main Layout Grid */}
      <div className="grid-dashboard" style={{ gap: '0.85rem' }}>
        {/* Main Product Catalog Section (Span 8) */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Card title="Active Produce & Input Listings" subtitle="Filter by crop category or search seller district." style={{ padding: '0.75rem' }}>
            <SearchBar value={search} onChange={setSearch} />
            <FilterPanel selected={category} onSelect={setCategory} />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>⚠️ {error}</p>}
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
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Card title="Live Mandi Benchmark Rates" subtitle="Governed MSP & Regional Spot Prices" style={{ padding: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.35rem' }}>
              <div className="alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.65rem' }}>
                <div>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Wheat (Sharbati)</h5>
                  <p style={{ fontSize: '0.7rem', opacity: 0.85 }}>Khanna Mandi • Punjab</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '0.9rem' }}>₹2,275 / qtl</strong>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>▲ +2.4%</span>
                </div>
              </div>

              <div className="alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.65rem' }}>
                <div>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Paddy (Basmati 1121)</h5>
                  <p style={{ fontSize: '0.7rem', opacity: 0.85 }}>Karnal Mandi • Haryana</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '0.9rem' }}>₹4,150 / qtl</strong>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>▲ +1.1%</span>
                </div>
              </div>

              <div className="alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.65rem' }}>
                <div>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Mustard (Pusa 30)</h5>
                  <p style={{ fontSize: '0.7rem', opacity: 0.85 }}>Alwar Mandi • Rajasthan</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '0.9rem' }}>₹5,400 / qtl</strong>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>▲ +0.8%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

