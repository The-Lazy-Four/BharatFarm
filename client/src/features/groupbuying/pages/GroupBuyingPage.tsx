import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card.js';
import { Input } from '../../../components/ui/Input.js';
import { GroupBuyCard } from '../components/GroupBuyCard.js';
import { useGroupBuying } from '../hooks/useGroupBuying.js';
import { GroupBuyingApi } from '../services/groupBuyingApi.js';
import { Spinner } from '../../../components/ui/Spinner.js';
import { EmptyState } from '../../../components/ui/EmptyState.js';
import { FEATURE_IMAGES } from '../../../constants/featureImages.js';

const CATEGORIES = ['all', 'fertilizer', 'seeds', 'machinery'] as const;

export const GroupBuyingPage: React.FC = () => {
  const { pools, isLoading, error, joinPool } = useGroupBuying();
  const [activeTab, setActiveTab] = useState<'pools' | 'my-purchases'>('pools');
  const [myPurchases, setMyPurchases] = useState<{ pool: any; myQuantity: number; joinedAt: string }[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all');

  const fetchMyPurchases = async () => {
    setIsLoadingPurchases(true);
    try {
      const data = await GroupBuyingApi.getMyJoinedPools();
      setMyPurchases(data);
    } catch (err) {
      console.error('Failed to fetch my purchases', err);
    } finally {
      setIsLoadingPurchases(false);
    }
  };

  const handleTabChange = (tab: 'pools' | 'my-purchases') => {
    setActiveTab(tab);
    if (tab === 'my-purchases') {
      fetchMyPurchases();
    }
  };

  const filtered = pools.filter(pool => {
    const matchesSearch = !search || pool.itemTitle.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || pool.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header-banner">
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

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => handleTabChange('pools')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius)',
            border: 'none',
            background: activeTab === 'pools' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'pools' ? '#FFFFFF' : 'var(--text-primary)',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          🤝 Active Cooperative Pools
        </button>
        <button
          onClick={() => handleTabChange('my-purchases')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius)',
            border: 'none',
            background: activeTab === 'my-purchases' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'my-purchases' ? '#FFFFFF' : 'var(--text-primary)',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          📦 My Group Purchases ({myPurchases.length})
        </button>
      </div>

      {/* Overview Stat Cards matching Stitch */}
      <div className="grid-dashboard">
        <div className="col-span-4">
          <Card variant="3d">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ACTIVE GROUPS</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0' }}>24 Pools</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active across 12 neighboring districts</p>
          </Card>
        </div>

        <div className="col-span-4">
          <Card variant="3d">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>NEARBY OPPORTUNITIES</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0' }}>8 Nearby</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Within 15 km radius of your location</p>
          </Card>
        </div>

        <div className="col-span-4">
          <Card variant="3d">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED SAVINGS POTENTIAL</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0' }}>₹42,500</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average seasonal input cost reduction</p>
          </Card>
        </div>
      </div>

      {activeTab === 'pools' ? (
        <>
          {/* Featured Input Image Card */}
          <div className="mobile-grid-2">
            <div className="card-feature-backed" style={{ minHeight: '120px' }}>
              <img src={FEATURE_IMAGES.groupbuying.url} alt="Bulk Fertilizer" className="card-feature-bg" />
              <div className="card-feature-overlay" />
              <div className="card-feature-content">
                <span className="badge badge-success">Bulk Subsidy</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.25rem', color: '#FFFFFF' }}>DAP & NPK Fertilizer Pools</h4>
                <p style={{ fontSize: '0.72rem', opacity: 0.88, color: '#FFFFFF' }}>Direct factory freight savings for local farmer groups</p>
              </div>
            </div>

            <div className="card-feature-backed" style={{ minHeight: '120px' }}>
              <img src={FEATURE_IMAGES.marketplace.url} alt="Hybrid Seeds" className="card-feature-bg" />
              <div className="card-feature-overlay" />
              <div className="card-feature-content">
                <span className="badge badge-primary">Certified Quality</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.25rem', color: '#FFFFFF' }}>Hybrid Seed Varieties</h4>
                <p style={{ fontSize: '0.72rem', opacity: 0.88, color: '#FFFFFF' }}>High-yield wheat & mustard certified seed batches</p>
              </div>
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
                        background: category === cat ? 'var(--primary)' : 'var(--surface-input)',
                        color: category === cat ? '#FFFFFF' : 'var(--text-primary)',
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
                {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠️ {error}</p>}
              </Card>

              {isLoading ? (
                <Spinner />
              ) : filtered.length === 0 ? (
                <EmptyState message="No active group buying pools found matching your filter." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filtered.map(pool => (
                    <GroupBuyCard key={pool.id} pool={pool} onJoin={(qty) => joinPool(pool.id, qty)} />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column (Span 4): How Group Buying Works & District Stats */}
            <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card title="How Group Buying Works" subtitle="4 simple steps to save on farm inputs">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                  <div className="alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>1</span>
                    <div>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Browse Active Pools</h5>
                      <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>Select inputs needed for your upcoming crop cycle.</p>
                    </div>
                  </div>

                  <div className="alert-info" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>2</span>
                    <div>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Pledge Order Quantity</h5>
                      <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>Commit quantity to unlock tiered wholesale prices.</p>
                    </div>
                  </div>

                  <div className="alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>3</span>
                    <div>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Direct Mandi Dispatch</h5>
                      <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>Bulk shipment delivered to your regional hub.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        /* My Group Purchases Dashboard View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card title="My Active & Historical Group Orders" subtitle="Track your bulk order pledges, threshold progress, and delivery statuses.">
            {isLoadingPurchases ? (
              <Spinner />
            ) : myPurchases.length === 0 ? (
              <EmptyState message="You haven't joined any group buying pools yet. Browse active pools above to participate!" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {myPurchases.map(({ pool, myQuantity, joinedAt }) => {
                  const totalPrice = pool.discountedPricePerUnit * myQuantity;
                  return (
                    <div
                      key={pool.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--surface-card)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="badge badge-secondary" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{pool.category}</span>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.25rem' }}>{pool.itemTitle}</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 Location: {pool.location}</p>
                        </div>
                        <span className={`badge ${pool.status === 'THRESHOLD_REACHED' ? 'badge-success' : pool.status === 'COMPLETED' ? 'badge-primary' : 'badge-warning'}`}>
                          {pool.status}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', background: 'var(--surface-input)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>YOUR PLEDGED QTY</span>
                          <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{myQuantity} units</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PRICE PER UNIT</span>
                          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>₹{pool.discountedPricePerUnit}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL PLEDGE COST</span>
                          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>₹{totalPrice.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>JOINED ON</span>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
