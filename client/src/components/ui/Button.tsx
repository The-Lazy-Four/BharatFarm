import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--signal-lime)',
          color: 'var(--text-on-lime)',
          border: 'none',
          boxShadow: '0 2px 10px var(--signal-lime-soft)',
        };
      case 'secondary':
        return {
          background: 'var(--surface-2)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-strong)',
        };
      case 'danger':
        return {
          background: 'var(--danger)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 2px 10px rgba(220, 38, 38, 0.25)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: 'none',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.4rem 0.85rem',
          fontSize: '0.78rem',
          minHeight: '34px',
          borderRadius: 'var(--radius-sm)',
        };
      case 'lg':
        return {
          padding: '0.85rem 1.75rem',
          fontSize: '1rem',
          minHeight: '48px',
          borderRadius: 'var(--radius)',
        };
      case 'md':
      default:
        return {
          padding: '0.6rem 1.25rem',
          fontSize: '0.88rem',
          minHeight: '40px',
          borderRadius: 'var(--radius-sm)',
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 700,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'var(--transition)',
    width: fullWidth ? '100%' : 'auto',
    userSelect: 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button
      className={`btn-interactive ${className}`}
      disabled={disabled || isLoading}
      style={baseStyle}
      {...props}
    >
      {leftIcon && !isLoading && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{leftIcon}</span>}
      {isLoading && (
        <span
          className="material-symbols-outlined"
          style={{
            animation: 'spin 1s linear infinite',
            fontSize: size === 'sm' ? '14px' : '18px',
          }}
        >
          progress_activity
        </span>
      )}
      {children}
      {rightIcon && !isLoading && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{rightIcon}</span>}
    </button>
  );
};
