import React, { useState } from 'react';
import { Button } from '@core/ui/Button';
import { Input } from '@core/ui/Input';
import { GroupBuyPool } from '../types/groupBuying.types';
import { GROUPBUYING_CONSTANTS } from '../constants/groupBuying.constants';
import { useLanguage } from '../../../../context/LanguageContext';

export const JoinGroupButton: React.FC<{
  status: GroupBuyPool['status'];
  onJoin: (quantity: number) => Promise<boolean> | void;
}> = ({ status, onJoin }) => {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(String(GROUPBUYING_CONSTANTS.MIN_JOIN_QUANTITY));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isJoinable = status === 'OPEN';

  const statusLabelMap: Record<GroupBuyPool['status'], string> = {
    OPEN: t('groupBuying.joinOrderPool'),
    THRESHOLD_REACHED: t('groupBuying.targetReached'),
    COMPLETED: t('groupBuying.orderCompleted'),
    EXPIRED: t('groupBuying.poolClosed')
  };

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
        {statusLabelMap[status]}
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
        🤝 {statusLabelMap.OPEN}
      </Button>
    </div>
  );
};

