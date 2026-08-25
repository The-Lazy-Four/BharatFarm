import React from 'react';

export const EmptyState: React.FC<{ message?: string }> = ({ message = 'No data available.' }) => (
  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
    <p style={{ fontSize: '1.1rem' }}>🌱</p>
    <p>{message}</p>
  </div>
);
