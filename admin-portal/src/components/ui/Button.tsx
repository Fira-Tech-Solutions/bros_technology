import React from 'react';

const VARIANTS: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    fontSize: 15,
  },
  secondary: {
    background: 'var(--color-surface)',
    color: 'var(--color-primary)',
    border: '1.5px solid var(--color-primary)',
    fontWeight: 500,
    fontSize: 15,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-muted)',
    border: 'none',
    fontWeight: 500,
    fontSize: 15,
  },
  danger: {
    background: 'var(--color-danger)',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    fontSize: 15,
  },
  'danger-tint': {
    background: 'var(--color-danger-tint)',
    color: 'var(--color-danger)',
    border: 'none',
    fontWeight: 500,
    fontSize: 15,
  },
  success: {
    background: 'var(--color-success)',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    fontSize: 15,
  },
};

const SIZES: Record<string, React.CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: 13, borderRadius: 'var(--radius-sm)' },
  md: { padding: '10px 20px', fontSize: 15, borderRadius: 'var(--radius-md)' },
  lg: { padding: '12px 24px', fontSize: 15, borderRadius: 'var(--radius-md)' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  style = {},
  ...props
}: any) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 15,
    lineHeight: 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all var(--transition-fast)',
    transform: pressed && !disabled ? 'scale(0.98)' : 'scale(1)',
    whiteSpace: 'nowrap',
    ...VARIANTS[variant] || VARIANTS.primary,
    ...SIZES[size] || SIZES.md,
    ...style,
  };

  // Hover states
  if (hovered && !disabled && !loading) {
    if (variant === 'primary') base.background = 'var(--color-primary-dark)';
    else if (variant === 'secondary') base.background = 'var(--color-primary-tint)';
    else if (variant === 'ghost') base.background = 'var(--color-bg)';
    else if (variant === 'danger') base.background = '#DC2626';
    else if (variant === 'danger-tint') base.background = 'var(--color-danger-tint)';
  }

  return (
    <button
      style={base}
      className={className}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...props}
    >
      {loading ? (
        <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
}
