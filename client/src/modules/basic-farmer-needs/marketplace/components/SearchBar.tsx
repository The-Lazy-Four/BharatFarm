import React from 'react';
import { Input } from '@core/ui/Input';
import { useLanguage } from '../../../../context/LanguageContext';

export const SearchBar: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const { t } = useLanguage();
  return <Input placeholder={t('marketplace.searchPlaceholder')} value={value} onChange={e => onChange(e.target.value)} />;
};

