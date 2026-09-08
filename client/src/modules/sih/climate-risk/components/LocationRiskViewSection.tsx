import React from 'react';
import { ClimateAssessmentResult } from '../types';

interface Props {
  location: string;
  latitude: number;
  longitude: number;
  assessment: ClimateAssessmentResult;
}

export const LocationRiskViewSection: React.FC<Props> = ({ location, latitude, longitude, assessment }) => {
  const isSevere = assessment.overallRiskLevel === 'SEVERE' || assessment.overallRiskLevel === 'HIGH';

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
          FIELD LOCATION
        </span>
        <span style={{
          background: isSevere ? '#fee2e2' : '#dcfce7',
          color: isSevere ? '#991b1b' : '#166534',
          fontSize: '0.66rem',
          fontWeight: 800,
          padding: '0.1rem 0.4rem',
          borderRadius: '4px'
        }}>
          {assessment.overallRiskLevel} Exposure
        </span>
      </div>

      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '0.6rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem'
      }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
          📍 {location}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
          {Number(latitude.toFixed(4))}°N • {Number(longitude.toFixed(4))}°E
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: '#475569',
        padding: '0.3rem 0.2rem 0'
      }}>
        <span>Crop: <strong>{assessment.cropRisk.cropName}</strong></span>
        <span>Stage: <strong>{assessment.cropRisk.cropStage}</strong></span>
      </div>
    </div>
  );
};
