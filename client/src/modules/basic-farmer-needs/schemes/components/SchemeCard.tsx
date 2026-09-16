import React from 'react';
import { Link } from 'react-router-dom';
import { Scheme } from '../types/schemes.types';
import { Card } from '@core/ui/Card';
import { Badge } from '@core/ui/Badge';
import { Button } from '@core/ui/Button';
import { useLanguage } from '../../../../context/LanguageContext';

export const SchemeCard: React.FC<{ scheme: Scheme }> = ({ scheme }) => {
  const { t } = useLanguage();

  const landLabel = (sch: Scheme): string => {
    if (!sch.eligibility) return t('schemes.anySize');
    const { minLandSize, maxLandSize } = sch.eligibility;
    if (maxLandSize >= 9999) return minLandSize === 0 ? t('schemes.anySize') : `${minLandSize}+ acres`;
    return `${minLandSize}–${maxLandSize} acres`;
  };

  return (
    <Card title={scheme.title} action={<Badge variant="primary">{scheme.state}</Badge>}>
      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{scheme.department}</p>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>{scheme.description}</p>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        <Badge variant="secondary">📏 {landLabel(scheme)}</Badge>
        <Badge variant="secondary">🌾 {scheme.eligibility?.crops.includes('All') || !scheme.eligibility ? t('schemes.allCrops') : scheme.eligibility.crops.join(', ')}</Badge>
        <Badge variant="secondary">🏷️ {scheme.category}</Badge>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link to={`/schemes/${scheme.id}`} style={{ flex: 1 }}>
          <Button variant="secondary" size="sm" style={{ width: '100%' }}>
            {t('common.viewDetails')}
          </Button>
        </Link>
        {scheme.officialUrl && (
          <a href={scheme.officialUrl} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
            <Button variant="outline" size="sm" style={{ width: '100%' }}>
              {t('schemes.officialPortalBtn')}
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
};

