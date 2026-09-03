import React from 'react';
import { KRISHIBOT_SUGGESTIONS } from '../constants/krishiBot.constants';

export const SuggestedActions: React.FC<{ onSelect: (text: string) => void }> = ({ onSelect }) => {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
      {KRISHIBOT_SUGGESTIONS.map((text, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(text)}
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            borderRadius: '20px',
            padding: '0.3rem 0.8rem',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          {text}
        </button>
      ))}
    </div>
  );
};
