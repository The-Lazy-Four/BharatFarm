import React from 'react';
import { Card } from '../../../components/ui/Card.js';

export const FarmingRecommendation: React.FC<{ advisory: string; doList: string[]; dontList: string[] }> = ({
  advisory,
  doList,
  dontList
}) => {
  return (
    <Card title="🌾 Hyperlocal Agronomist Advisory">
      <p style={{ lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '1rem' }}>{advisory}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>✅ Do</h4>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {doList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <h4 style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>🚫 Don't</h4>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {dontList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
