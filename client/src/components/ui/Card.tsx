import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  variant?: 'glass' | '3d' | 'elevated' | 'outline';
  headerAction?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  variant = 'glass',
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
      case '3d':
        return 'card-3d';
      case 'elevated':
        return 'card-glass shadow-lg';
      case 'outline':
        return 'card-glass border-strong';
      case 'glass':
      default:
        return 'card-glass';
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

