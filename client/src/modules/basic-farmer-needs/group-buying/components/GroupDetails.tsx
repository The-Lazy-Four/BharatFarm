import React from 'react';
import { GroupBuyPool } from '../types/groupBuying.types';
import { Badge } from '@core/ui/Badge';
import { ProgressIndicator } from './ProgressIndicator';
import { JoinGroupButton } from './JoinGroupButton';
import { calculateSavings, formatTimeRemaining } from '../utils/groupBuying.utils';
import { useLanguage } from '../../../../context/LanguageContext';

export const GroupDetails: React.FC<{ pool: GroupBuyPool; onJoin: (quantity: number) => Promise<boolean> | void }> = ({
  pool,
  onJoin
}) => {
  const { t } = useLanguage();
  const savings = calculateSavings(pool.originalPricePerUnit, pool.discountedPricePerUnit);

  const getCategoryLabel = (cat: string) => {
    if (cat === 'fertilizer') return t('groupBuying.fertilizerCat');
    if (cat === 'seeds') return t('groupBuying.seedsCat');
    if (cat === 'machinery') return t('groupBuying.machineryCat');
    return cat;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <Badge variant="warning">{t('groupBuying.offDiscount', { savings })}</Badge>
          <Badge variant="secondary">{getCategoryLabel(pool.category)}</Badge>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{pool.itemTitle}</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>₹{pool.discountedPricePerUnit}</span>
        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{pool.originalPricePerUnit}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('groupBuying.perUnitWholesale')}</span>
      </div>

      <ProgressIndicator current={pool.currentQuantity} target={pool.targetQuantity} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('groupBuying.participants')}</p>
          <p style={{ fontWeight: 600 }}>{t('groupBuying.farmersCount', { count: pool.participantCount })}</p>
        </div>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('groupBuying.location')}</p>
          <p style={{ fontWeight: 600 }}>📍 {pool.location}</p>
        </div>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('groupBuying.timeRemaining')}</p>
          <p style={{ fontWeight: 600 }}>⏳ {formatTimeRemaining(pool.deadline, t)}</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          {t('groupBuying.groupDetailsDesc')}
        </p>
        <JoinGroupButton status={pool.status} onJoin={onJoin} />
      </div>
    </div>
  );
};

