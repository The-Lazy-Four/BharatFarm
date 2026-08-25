import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = {
    fontFamily: 'var(--font-family)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'var(--transition)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none'
  };

  const sizes = {
    sm: { padding: '0.4rem 0.85rem', fontSize: '0.85rem' },
    md: { padding: '0.66rem 1.25rem', fontSize: '0.95rem' },
    lg: { padding: '0.9rem 1.75rem', fontSize: '1.05rem' }
  };

  const variants = {
    primary: { background: 'var(--primary)', color: '#FFFFFF' },
    secondary: { background: '#F0FDF4', color: 'var(--primary)', border: '1px solid var(--border-color)' },
    danger: { background: 'var(--danger)', color: '#FFFFFF' },
    outline: { background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }
  };

  return (
    <button
      className={className}
      style={{
        ...baseStyle,
        ...sizes[size],
        ...variants[variant],
        opacity: disabled || isLoading ? 0.6 : 1
      }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span>Loading...</span> : children}
    </button>
  );
};
