import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'glass' | '3d';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  style = {},
  variant = 'glass'
}) => {
  const cardClass = variant === '3d' ? 'card-3d' : 'card-glass';

  return (
    <div className={`${cardClass} ${className}`} style={style}>
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: subtitle ? '0.25rem' : '1rem' }}>
          {title && <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{subtitle}</p>}
      {children}
    </div>
  );
};
