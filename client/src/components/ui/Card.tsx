import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  style = {}
}) => {
  return (
    <div className={`card-glass ${className}`} style={{ background: '#FFFFFF', ...style }}>
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: subtitle ? '0.25rem' : '1rem' }}>
          {title && <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1rem' }}>{subtitle}</p>}
      {children}
    </div>
  );
};
