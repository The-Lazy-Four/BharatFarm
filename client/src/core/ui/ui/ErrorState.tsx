import React from 'react';
import { Button } from './Button';

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message = 'Something went wrong.', onRetry }) => (
  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--danger)' }}>
    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>⚠️ {message}</p>
    {onRetry && (
      <div style={{ marginTop: '0.75rem' }}>
        <Button onClick={onRetry} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    )}
  </div>
);
