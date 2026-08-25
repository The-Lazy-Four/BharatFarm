import React from 'react';
import { GroupBuyPool } from '../types/groupBuying.types.js';
import { Badge } from '../../../components/ui/Badge.js';
import { ProgressIndicator } from './ProgressIndicator.js';
import { JoinGroupButton } from './JoinGroupButton.js';
import { calculateSavings, formatTimeRemaining } from '../utils/groupBuying.utils.js';

export const GroupDetails: React.FC<{ pool: GroupBuyPool; onJoin: (quantity: number) => Promise<boolean> | void }> = ({
  pool,
  onJoin
}) => {
  const savings = calculateSavings(pool.originalPricePerUnit, pool.discountedPricePerUnit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <Badge variant="warning">{savings}% Off</Badge>
          <Badge variant="secondary">{pool.category}</Badge>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{pool.itemTitle}</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>₹{pool.discountedPricePerUnit}</span>
        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{pool.originalPricePerUnit}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>per unit (bulk wholesale price)</span>
      </div>

      <ProgressIndicator current={pool.currentQuantity} target={pool.targetQuantity} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Participants</p>
          <p style={{ fontWeight: 600 }}>{pool.participantCount} farmers</p>
        </div>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</p>
          <p style={{ fontWeight: 600 }}>📍 {pool.location}</p>
        </div>
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Time Remaining</p>
          <p style={{ fontWeight: 600 }}>⏳ {formatTimeRemaining(pool.deadline)}</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          Order pools combine multiple farmers' requirements into one wholesale purchase, unlocking bulk pricing that
          isn't available to individual buyers. Once the target quantity is reached, BharatFarm coordinates the
          consolidated order with the supplier.
        </p>
        <JoinGroupButton status={pool.status} onJoin={onJoin} />
      </div>
    </div>
  );
};
