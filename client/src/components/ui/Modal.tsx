import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(19, 30, 23, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card-glass" style={{ width: '90%', maxWidth: '500px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};
