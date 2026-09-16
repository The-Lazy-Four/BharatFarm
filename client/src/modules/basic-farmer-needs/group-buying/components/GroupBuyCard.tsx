import React from 'react';
import { Link } from 'react-router-dom';
import { GroupBuyPool } from '../types/groupBuying.types';
import { Card } from '@core/ui/Card';
import { Badge } from '@core/ui/Badge';
import { ProgressIndicator } from './ProgressIndicator';
import { JoinGroupButton } from './JoinGroupButton';
import { calculateSavings, formatTimeRemaining } from '../utils/groupBuying.utils';
import { useLanguage } from '../../../../context/LanguageContext';

export const GroupBuyCard: React.FC<{ pool: GroupBuyPool; onJoin: (quantity: number) => Promise<boolean> | void }> = ({
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
    <Card
      title={pool.itemTitle}
      action={
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <Badge variant="warning">{t('groupBuying.offDiscount', { savings })}</Badge>
          <Badge variant="secondary">{getCategoryLabel(pool.category)}</Badge>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>₹{pool.discountedPricePerUnit}</span>
          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ₹{pool.originalPricePerUnit}
          </span>
        </div>
        <ProgressIndicator current={pool.currentQuantity} target={pool.targetQuantity} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>📍 {pool.location}</span>
          <span>⏳ {formatTimeRemaining(pool.deadline, t)}</span>
        </div>
        <Link to={`/groupbuying/${pool.id}`} style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
          {t('common.viewDetails')} →
        </Link>
        <JoinGroupButton status={pool.status} onJoin={onJoin} />
      </div>
    </Card>
  );
};

