import React from 'react';
import { Input } from '../../../components/ui/Input.js';

export const SearchBar: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  return <Input placeholder="Search crops, seeds, fertilizers..." value={value} onChange={e => onChange(e.target.value)} />;
};
