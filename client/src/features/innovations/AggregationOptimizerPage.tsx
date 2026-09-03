import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { GroupBuyingPage } from '../groupbuying/index.js';
import { MarketplacePage } from '../marketplace/index.js';
import { SihLayout } from '../../components/layout/SihLayout.js';

export const AggregationOptimizerPage: React.FC = () => {
  const [mode, setMode] = useState<'selling' | 'buying'>('selling');

  // Simulated Produce Aggregation Pools
  const producePools = [
    { id: '1', crop: 'Wheat (PBW 725)', location: 'Khanna Block, Ludhiana', currentQty: 420, targetQty: 500, pricePerQuintal: 2350, standardPrice: 2275, farmersJoined: 14 },
    { id: '2', crop: 'Basmati Rice 1121', location: 'Jagraon Block, Ludhiana', currentQty: 280, targetQty: 400, pricePerQuintal: 4100, standardPrice: 3850, farmersJoined: 9 },
    { id: '3', crop: 'Mustard (Pusa 30)', location: 'Samrala Block, Ludhiana', currentQty: 150, targetQty: 200, pricePerQuintal: 5600, standardPrice: 5300, farmersJoined: 6 }
  ];

  return (
    <SihLayout
      activeModuleId="aggregation"
      moduleTitle="Small-Farm Aggregation"
      moduleIcon="🤝"
      moduleBadge="Group Power"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem 2.5rem' }}>
        
        {/* Module Header Banner */}
        <div className="page-header-banner" style={{ background: 'linear-gradient(135deg, #062612 0%, #15803d 100%)', borderRadius: '16px', padding: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary" style={{ background: '#22c55e', color: '#04210e', fontWeight: 900 }}>
                SIH INNOVATION MODULE #2
              </span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' }}>• Group Selling & Input Buying Matrix</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
              Small-Farm Aggregation Optimizer
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.88rem', marginTop: '0.25rem', maxWidth: '800px' }}>
              Uniting smallholder farmers into collective bargaining units for shared logistics, bulk input procurement (seeds & fertilizers), and premium direct-to-buyer produce selling.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button
              variant={mode === 'selling' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setMode('selling')}
              style={mode === 'selling' ? { background: '#22c55e', border: 'none', color: '#04210e' } : { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Group Selling (Produce)
            </Button>
            <Button
              variant={mode === 'buying' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setMode('buying')}
              style={mode === 'buying' ? { background: '#22c55e', border: 'none', color: '#04210e' } : { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Group Buying (Inputs)
            </Button>
          </div>
        </div>

        {/* Problem & Solution Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <Card title="⚠️ Problem Being Solved" subtitle="Smallholder market isolation & high costs">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
              86% of Indian farmers hold less than 2 hectares of land. Selling small batches individually leads to exploitation by middlemen and high per-quintal transportation overheads.
            </p>
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.25)', marginTop: '0.75rem' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', margin: 0 }}>Why Existing Systems Are Insufficient:</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.35, margin: 0 }}>
                Existing marketplaces treat each seller in isolation without automatic regional bundling, leaving small farmers unable to meet bulk corporate buyer minimum thresholds.
              </p>
            </div>
          </Card>

          <Card title="💡 Our Innovation & Implementation" subtitle="Unified Group Aggregation Engine">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
              BharatFarm extends existing Group Buying functionality to create a dual-way Aggregation Matrix: pooling input purchasing for discounts and produce selling for premium MSP+ pricing.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
              <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                <strong>🤝 Bulk Leverage:</strong> +12% Net Revenue
              </div>
              <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                <strong>🚚 Shared Freight:</strong> -30% Logistics Cost
              </div>
            </div>
          </Card>
        </div>

        {mode === 'selling' ? (
          <>
            {/* Active Group Selling Pools (NEW Implementation) */}
            <Card title="🌾 Active Regional Produce Aggregation Pools" subtitle="Join neighboring farmers to sell bulk harvest directly to corporate processors">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                {producePools.map((pool) => (
                  <div key={pool.id} className="card-glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge variant="primary">{pool.farmersJoined} Farmers Joined</Badge>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{pool.location}</span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>{pool.crop}</h3>
                      
                      {/* Progress */}
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span>Target Quota: {pool.targetQty} Quintals</span>
                          <strong>{Math.round((pool.currentQty / pool.targetQty) * 100)}% Filled</strong>
                        </div>
                        <div style={{ height: '6px', width: '100%', background: 'var(--surface-inset)', borderRadius: '3px', marginTop: '0.25rem', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(pool.currentQty / pool.targetQty) * 100}%`, background: 'var(--signal-lime)' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>AGGREGATED BUY PRICE</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--signal-lime)' }}>₹{pool.pricePerQuintal} / Qtl</strong>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Indiv. Price: ₹{pool.standardPrice}</span>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => alert(`Joined ${pool.crop} selling pool successfully!`)}>
                        Pledge Harvest ➔
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Integrated Marketplace Component */}
            <div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Integrated Platform Direct Marketplace
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--signal-lime)', fontWeight: 700 }}>
                  ✓ Core Shared Marketplace Infrastructure
                </span>
              </div>
              <MarketplacePage />
            </div>
          </>
        ) : (
          /* Integrated Group Buying Component */
          <div>
            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Integrated Platform Group Buying Module (Inputs & Seeds)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--signal-lime)', fontWeight: 700 }}>
                ✓ Core Shared Group Buying Infrastructure
              </span>
            </div>
            <GroupBuyingPage />
          </div>
        )}
      </div>
    </SihLayout>
  );
};
