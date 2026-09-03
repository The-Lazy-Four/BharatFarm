import React from 'react';
import { Link } from 'react-router-dom';
import { Scheme } from '../types/schemes.types';
import { Card } from '@core/ui/Card';
import { Badge } from '@core/ui/Badge';
import { Button } from '@core/ui/Button';

const landLabel = (scheme: Scheme): string => {
  if (!scheme.eligibility) return 'Any Size';
  const { minLandSize, maxLandSize } = scheme.eligibility;
  if (maxLandSize >= 9999) return minLandSize === 0 ? 'Any Size' : `${minLandSize}+ acres`;
  return `${minLandSize}–${maxLandSize} acres`;
};

export const SchemeCard: React.FC<{ scheme: Scheme }> = ({ scheme }) => {
  return (
    <Card title={scheme.title} action={<Badge variant="primary">{scheme.state}</Badge>}>
      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{scheme.department}</p>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>{scheme.description}</p>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        <Badge variant="secondary">📏 {landLabel(scheme)}</Badge>
        <Badge variant="secondary">🌾 {scheme.eligibility?.crops.includes('All') || !scheme.eligibility ? 'All Crops' : scheme.eligibility.crops.join(', ')}</Badge>
        <Badge variant="secondary">🏷️ {scheme.category}</Badge>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link to={`/schemes/${scheme.id}`} style={{ flex: 1 }}>
          <Button variant="secondary" size="sm" style={{ width: '100%' }}>
            View Details
          </Button>
        </Link>
        {scheme.officialUrl && (
          <a href={scheme.officialUrl} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
            <Button variant="outline" size="sm" style={{ width: '100%' }}>
              Official Portal ↗
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
};

