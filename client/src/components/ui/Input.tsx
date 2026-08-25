import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
      {label && <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</label>}
      <input
        style={{
          background: '#FFFFFF',
          border: error ? '1px solid var(--danger)' : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.66rem 1rem',
          color: 'var(--text-main)',
          fontSize: '0.95rem',
          outline: 'none',
          fontFamily: 'var(--font-family)',
          ...style
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
};
