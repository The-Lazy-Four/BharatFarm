import React from 'react';
import { MARKETPLACE_CONSTANTS } from '../constants/marketplace.constants.js';

export const FilterPanel: React.FC<{ selected: string; onSelect: (cat: string) => void }> = ({ selected, onSelect }) => {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
      {MARKETPLACE_CONSTANTS.CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            background: selected === cat ? 'var(--primary)' : 'var(--bg-card)',
            color: '#fff',
            textTransform: 'capitalize',
            cursor: 'pointer'
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};
