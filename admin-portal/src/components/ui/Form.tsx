import React from 'react';

export function Input({ label, error, icon: Icon, className = '', style = {}, ...props }: any) {
  const [focused, setFocused] = React.useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 44,
    padding: Icon ? '0 14px 0 42px' : '0 14px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${focused ? 'var(--color-primary)' : error ? 'var(--color-danger)' : 'var(--color-border)'}`,
    background: focused ? 'var(--color-surface)' : 'var(--color-bg)',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
    fontWeight: 400,
    color: 'var(--color-text)',
    outline: 'none',
    transition: 'all var(--transition-fast)',
    boxShadow: focused ? '0 0 0 3px rgba(24,120,180,0.15)' : 'none',
    boxSizing: 'border-box' as const,
    ...style,
  };

  return (
    <div style={{ marginBottom: 0 }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 6,
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          style={inputStyle}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ marginTop: 4, fontSize: 13, color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({ label, error, children, className = '', style = {}, ...props }: any) {
  const [focused, setFocused] = React.useState(false);

  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: 44,
    padding: '0 14px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${focused ? 'var(--color-primary)' : error ? 'var(--color-danger)' : 'var(--color-border)'}`,
    background: focused ? 'var(--color-surface)' : 'var(--color-bg)',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
    fontWeight: 400,
    color: 'var(--color-text)',
    outline: 'none',
    transition: 'all var(--transition-fast)',
    boxShadow: focused ? '0 0 0 3px rgba(24,120,180,0.1)' : 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    ...style,
  };

  return (
    <div style={{ marginBottom: 0 }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 6,
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
        </label>
      )}
      <select
        style={selectStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p style={{ marginTop: 4, fontSize: 13, color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function Textarea({ label, error, className = '', style = {}, ...props }: any) {
  const [focused, setFocused] = React.useState(false);

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${focused ? 'var(--color-primary)' : error ? 'var(--color-danger)' : 'var(--color-border)'}`,
    background: focused ? 'var(--color-surface)' : 'var(--color-bg)',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
    fontWeight: 400,
    color: 'var(--color-text)',
    outline: 'none',
    transition: 'all var(--transition-fast)',
    boxShadow: focused ? '0 0 0 3px rgba(24,120,180,0.15)' : 'none',
    resize: 'vertical' as const,
    lineHeight: 1.5,
    minHeight: 100,
    ...style,
  };

  return (
    <div style={{ marginBottom: 0 }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 6,
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
        </label>
      )}
      <textarea
        style={textareaStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && (
        <p style={{ marginTop: 4, fontSize: 13, color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
