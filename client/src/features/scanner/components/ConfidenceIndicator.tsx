import React from 'react';
import { Badge } from '../../../components/ui/Badge.js';

export const ConfidenceIndicator: React.FC<{ confidence: number }> = ({ confidence }) => {
  const percentage = Math.round(confidence * 100);
  const variant = percentage >= 80 ? 'primary' : percentage >= 50 ? 'warning' : 'secondary';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Confidence:</span>
      <Badge variant={variant}>{percentage}%</Badge>
    </div>
  );
};
