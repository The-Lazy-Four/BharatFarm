import React from 'react';

export const Spinner: React.FC = () => (
  <div style={{
    width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.2)',
    borderTopColor: 'var(--primary)', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
