import React from 'react';
import { Card } from '@core/ui/Card';

export const FarmingRecommendation: React.FC<{ advisory: string; doList: string[]; dontList: string[] }> = ({
  advisory,
  doList,
  dontList
}) => {
  return (
    <Card title="🌾 Hyperlocal Agronomist Advisory" subtitle="AI and meteorologist generated crop protection guidance for current weather.">
      <div className="alert-warning" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--emerald-primary)', background: 'var(--bg-card-hover)' }}>
        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {advisory}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <h4 style={{ color: 'var(--emerald-primary)', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
            RECOMMENDED ACTIVITIES (DO)
          </h4>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', lineHeight: 1.4 }}>
            {doList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h4 style={{ color: '#EF4444', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
            RESTRICTED ACTIVITIES (DON'T)
          </h4>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', lineHeight: 1.4 }}>
            {dontList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

