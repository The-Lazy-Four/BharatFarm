import React from 'react';
import { Link } from 'react-router-dom';
import { GroupBuyPool } from '../types/groupBuying.types.js';
import { Card } from '../../../components/ui/Card.js';
import { Badge } from '../../../components/ui/Badge.js';
import { ProgressIndicator } from './ProgressIndicator.js';
import { JoinGroupButton } from './JoinGroupButton.js';
import { calculateSavings, formatTimeRemaining } from '../utils/groupBuying.utils.js';

export const GroupBuyCard: React.FC<{ pool: GroupBuyPool; onJoin: (quantity: number) => Promise<boolean> | void }> = ({
  pool,
  onJoin
}) => {
  const savings = calculateSavings(pool.originalPricePerUnit, pool.discountedPricePerUnit);

  return (
    <Card
      title={pool.itemTitle}
      action={
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <Badge variant="warning">{savings}% Off</Badge>
          <Badge variant="secondary">{pool.category}</Badge>
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
          <span>⏳ {formatTimeRemaining(pool.deadline)}</span>
        </div>
        <Link to={`/groupbuying/${pool.id}`} style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
          View Details →
        </Link>
        <JoinGroupButton status={pool.status} onJoin={onJoin} />
      </div>
    </Card>
  );
};
