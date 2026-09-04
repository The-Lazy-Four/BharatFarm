import React from 'react';
import { SihLayout } from '../../shared/SihLayout';

export const CropInsuranceVerificationPage: React.FC = () => {
  return (
    <SihLayout activeModuleId="crop-insurance" moduleTitle="Crop Insurance" moduleIcon="verified_user">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Heading */}
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Crop Risk & Insurance
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.35rem', margin: 0 }}>
            Protect your crop, secure your future.
          </p>
        </div>

        {/* Satellite / Farm Image Panel */}
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          height: '260px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0'
        }}>
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
            alt="Satellite farm view"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '1.5rem',
            color: '#FFFFFF'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86EFAC' }}>
              LIVE SATELLITE FIELD AUDIT
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>
              Field Plot #402 - Sector B
            </h3>
          </div>
        </div>

        {/* Crop Health Status & NDVI Value */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Crop Health Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#16A34A', fontSize: '24px' }}>check_circle</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#16A34A' }}>Healthy</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              NDVI Index Value
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
              NDVI: 0.72
            </div>
          </div>
        </div>

        {/* Action Buttons: File a Claim, Check Status, Guidelines */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button
            onClick={() => alert('Initiating PMFBY Claim process...')}
            style={{
              background: '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>description</span>
            <span>File a Claim</span>
          </button>

          <button
            onClick={() => alert('Checking existing claim status...')}
            style={{
              background: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>pending_actions</span>
            <span>Check Status</span>
          </button>

          <button
            onClick={() => alert('Opening PMFBY Guidelines dossier...')}
            style={{
              background: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help_outline</span>
            <span>Guidelines</span>
          </button>
        </div>

      </div>
    </SihLayout>
  );
};
