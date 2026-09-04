import React, { useState } from 'react';
import { SihLayout } from '../../shared/SihLayout';

export const AggregationOptimizerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('sell');

  const pools = [
    {
      id: 'tomato',
      crop: 'Tomato',
      farmersCount: 245,
      price: '₹18/kg',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'rice',
      crop: 'Rice',
      farmersCount: 320,
      price: '₹22/kg',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'potato',
      crop: 'Potato',
      farmersCount: 189,
      price: '₹16/kg',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80'
    }
  ];

  return (
    <SihLayout activeModuleId="aggregation" moduleTitle="Aggregation" moduleIcon="groups">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Title */}
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Small-Farm Aggregation
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.35rem', margin: 0 }}>
            Together we grow stronger.
          </p>
        </div>

        {/* Tabs for Buy Together and Sell Together */}
        <div style={{
          display: 'inline-flex',
          background: '#E2E8F0',
          padding: '0.35rem',
          borderRadius: '12px',
          gap: '0.35rem',
          alignSelf: 'flex-start'
        }}>
          <button
            onClick={() => setActiveTab('buy')}
            style={{
              background: activeTab === 'buy' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'buy' ? '#0F172A' : '#64748B',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'buy' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Buy Together
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            style={{
              background: activeTab === 'sell' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'sell' ? '#0F172A' : '#64748B',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'sell' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Sell Together
          </button>
        </div>

        {/* Active Farmer Pools Header */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Active Farmer Pools
        </h2>

        {/* Pools List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pools.map((pool) => (
            <div
              key={pool.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <img
                  src={pool.image}
                  alt={pool.crop}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    objectFit: 'cover'
                  }}
                />

                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {pool.crop}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>
                    {pool.farmersCount} farmers joined
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#16A34A', marginTop: '0.25rem' }}>
                    {pool.price}
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert(`Joined ${pool.crop} ${activeTab === 'sell' ? 'Selling' : 'Buying'} Pool!`)}
                style={{
                  background: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.5rem',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                }}
              >
                Join
              </button>
            </div>
          ))}
        </div>

      </div>
    </SihLayout>
  );
};
