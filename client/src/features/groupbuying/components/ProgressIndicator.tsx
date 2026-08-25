import React from 'react';

export const ProgressIndicator: React.FC<{ current: number; target: number }> = ({ current, target }) => {
  const percent = Math.min(100, Math.round((current / target) * 100));
  return (
    <div style={{ width: '100%', margin: '0.75rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
        <span>Progress ({current}/{target} units)</span>
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{percent}%</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'var(--bg-card-hover)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary)', transition: 'var(--transition)' }} />
      </div>
    </div>
  );
};
