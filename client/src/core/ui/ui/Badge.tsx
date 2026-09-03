import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'warning' | 'secondary';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary' }) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};
