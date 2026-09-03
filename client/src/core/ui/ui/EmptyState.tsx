import React from 'react';

export const EmptyState: React.FC<{ message?: string }> = ({ message = 'No data available.' }) => (
  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
    <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌱</p>
    <p style={{ fontSize: '0.95rem' }}>{message}</p>
  </div>
);
