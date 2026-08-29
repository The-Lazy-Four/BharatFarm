import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  variant?: 'surface1' | 'surface2' | 'surface3' | 'cream' | 'glass' | '3d' | 'elevated' | 'outline';
  headerAction?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  variant = 'surface2',
  headerAction,
  action,
  className = '',
  style,
  children,
  ...props
}) => {
  const activeAction = headerAction || action;

  const getCardClass = () => {
    switch (variant) {
      case 'surface1':
        return 'surface-1';
      case 'surface3':
      case 'cream':
        return 'surface-3';
      case 'outline':
        return 'surface-2 border-strong';
      case '3d':
      case 'elevated':
      case 'surface2':
      case 'glass':
      default:
        return 'surface-2';
    }
  };



  return (
    <div
      className={`${getCardClass()} ${className}`}
      style={style}
      {...props}
    >
      {(title || subtitle || activeAction) && (
        <div style={{ marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div>
            {title && (
              <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0, lineHeight: 1.35 }}>
                {subtitle}
              </p>
            )}
          </div>
          {activeAction && <div style={{ flexShrink: 0 }}>{activeAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

