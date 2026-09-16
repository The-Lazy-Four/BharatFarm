import React from 'react';
import { Button } from '@core/ui/Button';
import { useLanguage } from '../../../../context/LanguageContext';

export const ScanButton: React.FC<{ onClick: () => void; isScanning: boolean }> = ({ onClick, isScanning }) => {
  const { t } = useLanguage();
  return (
    <Button onClick={onClick} isLoading={isScanning} size="lg" style={{ width: '100%', marginTop: '1rem' }}>
      {t('scanner.analyzeLeafHealth')}
    </Button>
  );
};

