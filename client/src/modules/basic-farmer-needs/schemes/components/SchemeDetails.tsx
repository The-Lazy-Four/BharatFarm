import React from 'react';
import { Scheme } from '../types/schemes.types';
import { Badge } from '@core/ui/Badge';
import { Button } from '@core/ui/Button';

export const SchemeDetails: React.FC<{ scheme: Scheme }> = ({ scheme }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <Badge variant="primary">{scheme.state}</Badge>
          <Badge variant="secondary">{scheme.category}</Badge>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{scheme.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{scheme.department}</p>
      </div>

      <p style={{ lineHeight: 1.6 }}>{scheme.description}</p>

      <div>
        <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>✅ Eligibility Criteria</h4>
        <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {scheme.eligibilityCriteria.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>📄 Required Documents</h4>
        <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {scheme.requiredDocuments.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>

      {scheme.applySteps && scheme.applySteps.length > 0 && (
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>🧭 How to Apply</h4>
          <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {scheme.applySteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {scheme.officialUrl && (
        <a href={scheme.officialUrl} target="_blank" rel="noreferrer">
          <Button>Visit Official Government Portal ↗</Button>
        </a>
      )}
    </div>
  );
};

