import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button.js';
import { Input } from '../../../components/ui/Input.js';
import { GroupBuyPool } from '../types/groupBuying.types.js';
import { GROUPBUYING_CONSTANTS } from '../constants/groupBuying.constants.js';

const STATUS_LABEL: Record<GroupBuyPool['status'], string> = {
  OPEN: 'Join Order Pool',
  THRESHOLD_REACHED: 'Target Reached',
  COMPLETED: 'Order Completed',
  EXPIRED: 'Pool Closed'
};

export const JoinGroupButton: React.FC<{
  status: GroupBuyPool['status'];
  onJoin: (quantity: number) => Promise<boolean> | void;
}> = ({ status, onJoin }) => {
  const [quantity, setQuantity] = useState(String(GROUPBUYING_CONSTANTS.MIN_JOIN_QUANTITY));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isJoinable = status === 'OPEN';

  const handleJoin = async () => {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;
    setIsSubmitting(true);
    await onJoin(qty);
    setIsSubmitting(false);
  };

  if (!isJoinable) {
    return (
      <Button disabled style={{ width: '100%' }}>
        {STATUS_LABEL[status]}
      </Button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <div style={{ width: '90px' }}>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          aria-label="Quantity to join with"
        />
      </div>
      <Button onClick={handleJoin} isLoading={isSubmitting} style={{ flex: 1 }}>
        🤝 {STATUS_LABEL.OPEN}
      </Button>
    </div>
  );
};
