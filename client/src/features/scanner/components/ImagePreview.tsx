import React from 'react';

export const ImagePreview: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  return (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      <div
        style={{
          width: '100%',
          maxHeight: '280px',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          background: '#0d1512',
          border: '1px solid var(--border-color)'
        }}
      >
        <img
          src={imageUrl}
          alt="Leaf ready for analysis"
          style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
        />
      </div>
    </div>
  );
};
