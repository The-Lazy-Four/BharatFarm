import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  helperText,
  className = '',
  style,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: error ? 'var(--danger)' : 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
            }}
          >
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`input-field ${className}`}
          style={{
            width: '100%',
            padding: '0.65rem 0.95rem',
            paddingLeft: leftIcon ? '2.5rem' : '0.95rem',
            paddingRight: rightIcon ? '2.5rem' : '0.95rem',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-family)',
            borderColor: error ? 'var(--danger)' : undefined,
            ...style,
          }}
          {...props}
        />

        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: error ? 'var(--danger)' : 'var(--text-muted)',
            marginTop: '0.1rem',
          }}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};
