import React from 'react';

interface Props {
  rainfall: {
    todayMm: number;
    tomorrowMm: number;
    next3DaysMm: number;
    next7DaysMm: number;
    total7DayMm: number;
    maxExpectedMm: number;
    highestRainfallDay: string;
    rainfallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    consecutiveRainyDays: number;
    explanation: string;
  };
}

export const RainfallAnalysisSection: React.FC<Props> = ({ rainfall }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'SEVERE': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MODERATE': return '#d97706';
      default: return '#16a34a';
    }
  };

  const riskColor = getRiskColor(rainfall.rainfallRiskLevel);

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
          RAINFALL
        </span>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          color: riskColor,
          background: '#f8fafc',
          padding: '0.15rem 0.45rem',
          borderRadius: '4px',
          border: `1px solid ${riskColor}`
        }}>
          {rainfall.rainfallRiskLevel}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        margin: '0.6rem 0'
      }}>
        <div style={{ background: '#f8fafc', padding: '0.45rem', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, display: 'block' }}>7-DAY TOTAL</span>
          <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0284c7' }}>
            {Number(rainfall.total7DayMm.toFixed(1))} mm
          </span>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.45rem', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, display: 'block' }}>NEXT 48H</span>
          <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
            {Number((rainfall.todayMm + rainfall.tomorrowMm).toFixed(1))} mm
          </span>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.45rem', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, display: 'block' }}>PEAK DAY</span>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#dc2626' }}>
            {rainfall.highestRainfallDay || 'Wed'} • {Number(rainfall.maxExpectedMm.toFixed(1))} mm
          </span>
        </div>
      </div>

      {/* Clean Single Progress Bar */}
      <div>
        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, Math.round((rainfall.total7DayMm / 150) * 100))}%`,
            background: riskColor,
            borderRadius: '3px'
          }} />
        </div>
      </div>
    </div>
  );
};
