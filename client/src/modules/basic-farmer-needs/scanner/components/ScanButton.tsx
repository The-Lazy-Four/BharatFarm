import React from 'react';
import { Button } from '@core/ui/Button';

export const ScanButton: React.FC<{ onClick: () => void; isScanning: boolean }> = ({ onClick, isScanning }) => {
  return (
    <Button onClick={onClick} isLoading={isScanning} size="lg" style={{ width: '100%', marginTop: '1rem' }}>
      🔍 Analyze Leaf Health
    </Button>
  );
};

