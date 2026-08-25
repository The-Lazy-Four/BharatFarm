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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(15, 56, 34, 0.97) 0%, rgba(20, 83, 45, 0.93) 100%)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-3d)',
        color: '#FFFFFF'
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Collective Bargaining Hub</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Group Buying & Input Pooling
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Leverage regional farming power to secure wholesale pricing on fertilizers, seeds, and equipment.
          </p>
        </div>
      </div>


      {/* Overview Stat Cards matching Stitch */}
      <div className="grid-dashboard">
        <div className="col-span-4">
          <Card>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ACTIVE GROUPS</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.25rem 0' }}>24 Pools</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active across 12 neighboring districts</p>
          </Card>
        </div>

        <div className="col-span-4">
          <Card>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>NEARBY OPPORTUNITIES</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.25rem 0' }}>8 Nearby</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Within 15 km radius of your location</p>
          </Card>
        </div>

        <div className="col-span-4">
          <Card>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED SAVINGS POTENTIAL</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.25rem 0' }}>₹42,500</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average seasonal input cost reduction</p>
          </Card>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Search, Category Filter & Active Pools */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Active Cooperative Pools">
            <Input placeholder="Search fertilizer, seeds, heavy machinery..." value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '0.4rem 1.25rem',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: category === cat ? 'var(--signal-lime)' : 'var(--card-gray)',
                    color: 'var(--dark-text)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'var(--transition)'
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
            <EmptyState message="No active groups found in your area. You can start a new group or expand your search radius." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filtered.map(pool => (
                <GroupBuyCard key={pool.id} pool={pool} onJoin={qty => joinPool(pool.id, qty)} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (Span 4): Participation Timeline & Terms (Stitch reference) */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Participation Timeline Panel */}
          <Card title="Participation Timeline" subtitle="How group orders move from creation to doorstep delivery.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ background: 'var(--signal-lime)', color: 'var(--dark-text)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>1</span>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Group Formation</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gathering minimum required participants and target quantity.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ background: '#FEF3C7', color: '#92400E', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>2</span>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Supplier Negotiation</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Finalizing bulk discount terms with manufacturer.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0369A1', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>3</span>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-text)' }}>Fulfillment & Delivery</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected bulk dispatch to regional distribution centers.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Terms & Refund Policy Card */}
          <Card title="Pooling Terms & Policy">
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', paddingLeft: '1.25rem', margin: 0 }}>
              <li style={{ marginBottom: '0.4rem' }}>A 10% refundable deposit is required to lock your bulk tier rate.</li>
              <li style={{ marginBottom: '0.4rem' }}>If threshold is not met by deadline, full refund is credited automatically.</li>
              <li>Doorstep delivery available for orders exceeding 50 bags.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
