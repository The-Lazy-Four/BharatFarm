import React from 'react';
import { ClimateAssessmentResult } from '../types';

interface Props {
  procurement: ClimateAssessmentResult['procurementAdvisory'];
  storage: ClimateAssessmentResult['storageAdvisory'];
}

export const ProcurementStorageSection: React.FC<Props> = ({ procurement, storage }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.25rem'
    }}>
      {/* PROCUREMENT ADVISORY */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>
              MANDI & DISPATCH LOGISTICS
            </span>
            <span style={{
              background: procurement.riskLevel === 'HIGH RISK' ? '#fee2e2' : '#fef9c3',
              color: procurement.riskLevel === 'HIGH RISK' ? '#991b1b' : '#854d0e',
              fontSize: '0.7rem',
              fontWeight: 850,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px'
            }}>
              PROCUREMENT: {procurement.riskLevel}
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Procurement & Logistics Advisory
          </h3>

          <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.5rem', lineHeight: 1.4 }}>
            {procurement.guidance}
          </p>
        </div>

        <div style={{ background: '#FFFBEB', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B45309', display: 'block', textTransform: 'uppercase' }}>
            RECOMMENDED PROCUREMENT WINDOW
          </span>
          <strong style={{ fontSize: '0.92rem', color: '#92400E', fontWeight: 800 }}>
            ⏱️ {procurement.recommendedWindow}
          </strong>
        </div>
      </div>

      {/* STORAGE ADVISORY */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>
              POST-HARVEST GRAIN PROTECTION
            </span>
            <span style={{
              background: storage.riskLevel === 'HIGH RISK' ? '#fee2e2' : '#f3e8ff',
              color: storage.riskLevel === 'HIGH RISK' ? '#991b1b' : '#6b21a8',
              fontSize: '0.7rem',
              fontWeight: 850,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px'
            }}>
              STORAGE: {storage.riskLevel}
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Warehouse & Covered Storage Advisory
          </h3>

          <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.5rem', lineHeight: 1.4 }}>
            {storage.guidance}
          </p>
        </div>

        <div style={{ background: '#F3E8FF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B21A8', display: 'block', textTransform: 'uppercase' }}>
            SPOILAGE PREVENTION MANDATE
          </span>
          <strong style={{ fontSize: '0.85rem', color: '#581C87', fontWeight: 800 }}>
            📦 Move harvested grain to covered, elevated storage immediately. Avoid open-field exposure.
          </strong>
        </div>
      </div>
    </div>
  );
};
