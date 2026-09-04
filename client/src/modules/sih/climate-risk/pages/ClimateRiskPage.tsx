import React, { useState } from 'react';
import { SihLayout } from '../../shared/SihLayout';

export const ClimateRiskPage: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('Wheat');

  const forecast = [
    { day: 'Mon', temp: '28°C', condition: 'Sunny', rain: '10%' },
    { day: 'Tue', temp: '29°C', condition: 'Partly Cloudy', rain: '20%' },
    { day: 'Wed', temp: '26°C', condition: 'Light Rain', rain: '65%' },
    { day: 'Thu', temp: '27°C', condition: 'Sunny', rain: '15%' },
    { day: 'Fri', temp: '30°C', condition: 'Clear', rain: '5%' },
    { day: 'Sat', temp: '31°C', condition: 'Sunny', rain: '0%' },
    { day: 'Sun', temp: '29°C', condition: 'Partly Cloudy', rain: '25%' }
  ];

  return (
    <SihLayout activeModuleId="climate-risk" moduleTitle="Climate Risk" moduleIcon="partly_cloudy_day">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Title */}
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Climate Risk Advisor
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.35rem', margin: 0 }}>
            Plan smarter. Procure better.
          </p>
        </div>

        {/* Weather Summary Card & Risk Level Badge */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Main Weather Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '38px' }}>partly_cloudy_day</span>
              </div>

              <div>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                  24°C
                </div>
                <div style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 600, marginTop: '0.2rem' }}>
                  Partly Cloudy
                </div>
              </div>
            </div>

            {/* Risk Level Badge */}
            <div style={{
              background: '#DCFCE7',
              color: '#15803D',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
              <span>Low Risk</span>
            </div>
          </div>

          {/* Target Crop Selector */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
              Select Target Crop:
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
              <option value="Wheat">Wheat (Rabi Season)</option>
              <option value="Paddy">Paddy / Rice (Kharif)</option>
              <option value="Mustard">Mustard (Oilseed)</option>
              <option value="Cotton">Cotton</option>
            </select>
          </div>
        </div>

        {/* 7-Day Forecast & Recommendations Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          
          {/* 7-Day Forecast */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
              7-Day Forecast
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {forecast.map((f, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '12px',
                  background: idx === 0 ? '#F1F5F9' : 'transparent'
                }}>
                  <span style={{ width: '50px', fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>{f.day}</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', flex: 1 }}>{f.condition}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', width: '60px', textAlign: 'right' }}>{f.temp}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284C7', width: '50px', textAlign: 'right' }}>☔ {f.rain}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
              Recommendations
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ color: '#16A34A', fontSize: '22px' }}>check_circle</span>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Best time to procure</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Procure fertilizers before Wednesday rain forecast.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ color: '#16A34A', fontSize: '22px' }}>trending_up</span>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Expected yield impact</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>+8% favorable moisture conditions for {selectedCrop}.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: '22px' }}>warning</span>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Risk alerts</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Avoid pesticide spraying on Wednesday due to predicted precipitation.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </SihLayout>
  );
};
