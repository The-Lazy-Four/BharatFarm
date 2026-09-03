import React, { useState, useEffect } from 'react';
import { SihLayout } from '../../shared/SihLayout';
import { AggregationService, ProducePool, InputDeal } from '../aggregation.service';

export const AggregationOptimizerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'selling' | 'buying'>('selling');
  const [producePools, setProducePools] = useState<ProducePool[]>([]);
  const [inputDeals, setInputDeals] = useState<InputDeal[]>([]);
  const [pledgeTonnage, setPledgeTonnage] = useState<number>(20);
  const [joinedPools, setJoinedPools] = useState<string[]>([]);

  useEffect(() => {
    setProducePools(AggregationService.getProduceSellingPools());
    AggregationService.getInputBuyingDeals().then(setInputDeals);
  }, []);

  const handleJoinPool = (poolId: string) => {
    setJoinedPools([...joinedPools, poolId]);
    setProducePools(prev => prev.map(p => {
      if (p.id === poolId) {
        return {
          ...p,
          currentTonnage: Math.min(p.targetTonnage, p.currentTonnage + pledgeTonnage),
          participatingFarmers: p.participatingFarmers + 1
        };
      }
      return p;
    }));
  };

  return (
    <SihLayout
      activeModuleId="aggregation"
      moduleTitle="Small-Farm Aggregation"
      moduleIcon="🤝"
      moduleBadge="Bargaining Matrix"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>
        
        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #042211 0%, #15803d 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ background: '#22c55e', color: '#04210e', fontWeight: 900, fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                SIH MODULE 2
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>• Group Selling & Input Procurement</span>
            </div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              Small-Farm Aggregation Optimizer
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.3rem', maxWidth: '780px', lineHeight: 1.4 }}>
              Pool smallholder harvest produce to bypass middlemen for corporate direct purchase, and group-buy seeds & fertilizers for bulk discount savings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.35rem', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveTab('selling')}
              style={{
                background: activeTab === 'selling' ? '#22c55e' : 'transparent',
                color: activeTab === 'selling' ? '#04210e' : '#ffffff',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              🌾 Group Produce Selling
            </button>
            <button
              onClick={() => setActiveTab('buying')}
              style={{
                background: activeTab === 'buying' ? '#22c55e' : 'transparent',
                color: activeTab === 'buying' ? '#04210e' : '#ffffff',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              🛒 Group Input Buying
            </button>
          </div>
        </div>

        {/* Metric Overview Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ background: 'var(--surface-1, #0d2818)', padding: '1.1rem', borderRadius: '16px', border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>TOTAL AGGREGATED HARVEST</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--signal-lime, #22c55e)', margin: '0.2rem 0 0 0' }}>950 Quintals</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across 35 local farmers</span>
          </div>

          <div style={{ background: 'var(--surface-1, #0d2818)', padding: '1.1rem', borderRadius: '16px', border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>AVERAGE PRICE ADVANTAGE</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0 0 0' }}>+₹105 / Qtl</h3>
            <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>Above Standard MSP</span>
          </div>

          <div style={{ background: 'var(--surface-1, #0d2818)', padding: '1.1rem', borderRadius: '16px', border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>SHARED FREIGHT SAVINGS</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0 0 0' }}>32% Reduced</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Combined logistics truckloads</span>
          </div>
        </div>

        {/* Tab 1: Group Produce Selling Workspace */}
        {activeTab === 'selling' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  🌾 Active Regional Produce Aggregation Pools
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Pledge your harvest quantity to fulfill bulk corporate contracts for premium pricing.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-1)', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pledge Tonnage:</span>
                <input
                  type="number"
                  value={pledgeTonnage}
                  onChange={(e) => setPledgeTonnage(Number(e.target.value))}
                  style={{ width: '60px', padding: '0.2rem 0.4rem', borderRadius: '6px', border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: '#fff', fontSize: '0.85rem', fontWeight: 800 }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quintals</span>
              </div>
            </div>

            {/* Produce Pools Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {producePools.map((pool) => {
                const percent = Math.round((pool.currentTonnage / pool.targetTonnage) * 100);
                const isJoined = joinedPools.includes(pool.id);

                return (
                  <div
                    key={pool.id}
                    style={{
                      background: 'var(--surface-1, #0d2818)',
                      border: isJoined ? '2px solid #22c55e' : '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
                      borderRadius: '18px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontWeight: 800, fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                          {pool.participatingFarmers} Farmers Joined
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          📍 {pool.location}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.5rem 0 0.2rem 0' }}>
                        {pool.cropName} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>({pool.variety})</span>
                      </h3>
                      
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Contracted Buyer: <strong style={{ color: '#ffffff' }}>{pool.buyerName}</strong>
                      </div>

                      {/* Quota Progress Bar */}
                      <div style={{ marginTop: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          <span>Target Bulk Quota: {pool.targetTonnage} Qtl</span>
                          <strong style={{ color: '#22c55e' }}>{percent}% Filled</strong>
                        </div>
                        <div style={{ height: '8px', width: '100%', background: 'var(--surface-0)', borderRadius: '4px', marginTop: '0.35rem', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${percent}%`, background: 'var(--signal-lime, #22c55e)', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>CONTRACT PRICE</span>
                        <strong style={{ fontSize: '1.25rem', color: '#22c55e' }}>₹{pool.offeredPricePerQtl} / Qtl</strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Standard MSP: ₹{pool.mspPricePerQtl}</span>
                      </div>

                      <button
                        onClick={() => handleJoinPool(pool.id)}
                        disabled={isJoined}
                        style={{
                          background: isJoined ? 'rgba(34, 197, 94, 0.2)' : 'var(--signal-lime, #22c55e)',
                          color: isJoined ? '#22c55e' : '#04210e',
                          border: 'none',
                          padding: '0.6rem 1.1rem',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          cursor: isJoined ? 'default' : 'pointer'
                        }}
                      >
                        {isJoined ? '✓ Harvest Pledged' : `Pledge ${pledgeTonnage} Qtl ➔`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Tab 2: Group Input Buying Workspace */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                🛒 Bulk Input Procurement Deals (Seeds & Fertilizers)
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Join local farmer demand groups to unlock wholesale factory prices.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {inputDeals.map((deal) => (
                <div
                  key={deal.id}
                  style={{
                    background: 'var(--surface-1, #0d2818)',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.85rem'
                  }}
                >
                  <div>
                    <span style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                      {deal.category}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0.2rem 0' }}>
                      {deal.title}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 700 }}>
                      🔥 {deal.savingsPercentage}% Group Bulk Savings
                    </div>
                  </div>

                  <div style={{
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>GROUP PRICE</span>
                      <strong style={{ fontSize: '1.2rem', color: '#22c55e' }}>₹{deal.discountPrice}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '0.3rem' }}>₹{deal.marketPrice}</span>
                    </div>

                    <button
                      onClick={() => alert(`Joined ${deal.title} Group Order!`)}
                      style={{
                        background: 'var(--signal-lime, #22c55e)',
                        color: '#04210e',
                        border: 'none',
                        padding: '0.55rem 1rem',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Join Order Group ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </SihLayout>
  );
};
