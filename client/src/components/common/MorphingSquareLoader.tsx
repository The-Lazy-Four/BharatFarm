import React from 'react';

interface MorphingSquareLoaderProps {
  size?: number;
  color?: string;
  text?: string;
}

export const MorphingSquareLoader: React.FC<MorphingSquareLoaderProps> = ({
  size = 36,
  color = '#FFFFFF',
  text
}) => {
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.65rem'
    }}>
      <style>{`
        @keyframes morphingSquare {
          0% {
            transform: rotate(0deg) scale(1);
            border-radius: 20%;
          }
          25% {
            transform: rotate(90deg) scale(0.85);
            border-radius: 50%;
          }
          50% {
            transform: rotate(180deg) scale(1);
            border-radius: 20%;
          }
          75% {
            transform: rotate(270deg) scale(0.85);
            border-radius: 50%;
          }
          100% {
            transform: rotate(360deg) scale(1);
            border-radius: 20%;
          }
        }
      `}</style>

      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          borderRadius: '20%',
          animation: 'morphingSquare 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
        }}
      />

      {text && (
        <span style={{
          color: color,
          fontSize: '0.9rem',
          fontWeight: 700,
          letterSpacing: '0.02em'
        }}>
          {text}
        </span>
      )}
    </div>
  );
};
