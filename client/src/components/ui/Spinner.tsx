import React from 'react';

export const Spinner: React.FC = () => (
  <div style={{
    width: '24px', height: '24px', border: '3px solid rgba(34,37,31,0.1)',
    borderTopColor: 'var(--signal-lime)', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
