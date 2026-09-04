import React, { useState } from 'react';
import { SihLayout } from '../../shared/SihLayout';

export const SmartMandiPage: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [selectedLocation, setSelectedLocation] = useState('Haldia, WB');

  const mandiOptions = [
    {
      name: 'Burdwan Mandi',
      price: '₹2,140/q',
      distance: '42 km',
      isBest: true
    },
    {
      name: 'Kolkata Mandi',
      price: '₹2,020/q',
      distance: '78 km',
      isBest: false
    },
    {
      name: 'Kharagpur Mandi',
      price: '₹1,980/q',
      distance: '96 km',
      isBest: false
    }
  ];

  return (
    <SihLayout activeModuleId="smart-mandi" moduleTitle="Smart Mandi" moduleIcon="bar_chart">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Title */}
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Smart Mandi Intelligence
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.35rem', margin: 0 }}>
            Get the best price, at the right place.
          </p>
        </div>

        {/* Select Crop & Location Controls */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Crop Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
              Select Crop:
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#0F172A',
                outline: 'none'
              }}
            >
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice / Paddy</option>
              <option value="Potato">Potato</option>
              <option value="Tomato">Tomato</option>
            </select>
          </div>

          {/* Location Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
              Your Location:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.4rem',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span className="material-symbols-outlined" style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#16A34A'
              }}>location_on</span>
            </div>
          </div>
        </div>

        {/* Top Mandi Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Top Mandi Options
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mandiOptions.map((mandi, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  border: mandi.isBest ? '2px solid #16A34A' : '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {mandi.name}
                    </h3>
                    {mandi.isBest && (
                      <span style={{
                        background: '#DCFCE7',
                        color: '#15803D',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        Best Option
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>near_me</span>
                    <span>{mandi.distance}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#16A34A' }}>
                    {mandi.price}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                    Per Quintal
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </SihLayout>
  );
};
