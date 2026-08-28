import React from 'react';
import { MARKETPLACE_CONSTANTS } from '../constants/marketplace.constants.js';

export const FilterPanel: React.FC<{ selected: string; onSelect: (cat: string) => void }> = ({ selected, onSelect }) => {
  return (
    <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem', margin: '0.5rem 0 0 0' }}>
      {MARKETPLACE_CONSTANTS.CATEGORIES.map(cat => {
        const isSelected = selected === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            style={{
              padding: '0.28rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              border: isSelected ? 'none' : '1px solid var(--border-default)',
              background: isSelected ? 'var(--signal-lime)' : 'var(--surface-input)',
              color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: isSelected ? 700 : 500,
              fontSize: '0.75rem',
              textTransform: 'capitalize',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition)'
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};
