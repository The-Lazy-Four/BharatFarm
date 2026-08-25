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
    borderRadius: 'var(--radius-pill)',
    fontWeight: 700,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'var(--transition)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none'
  };

  const sizes = {
    sm: { padding: '0.4rem 1rem', fontSize: '0.85rem' },
    md: { padding: '0.66rem 1.5rem', fontSize: '0.95rem' },
    lg: { padding: '0.9rem 2rem', fontSize: '1.05rem' }
  };

  const variants = {
    primary: { background: 'var(--signal-lime)', color: 'var(--dark-text)' },
    secondary: { background: 'var(--card-gray)', color: 'var(--dark-text)' },
    danger: { background: 'var(--danger)', color: '#FFFFFF' },
    outline: { background: 'transparent', color: 'var(--dark-text)', border: '1px solid rgba(34,37,31,0.2)' }
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
