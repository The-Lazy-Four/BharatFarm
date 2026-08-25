import React from 'react';

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message = 'Something went wrong.', onRetry }) => (
  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--danger)' }}>
    <p style={{ fontWeight: 600 }}>⚠️ {message}</p>
    {onRetry && (
      <button onClick={onRetry} style={{ marginTop: '0.5rem', background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '4px', padding: '0.25rem 0.75rem', cursor: 'pointer' }}>
        Retry
      </button>
    )}
  </div>
);
