import React from 'react';

export function EmptyState({ icon: Icon, title, description, action }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Icon size={28} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text)',
          marginBottom: 6,
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            textAlign: 'center',
            maxWidth: 360,
            marginBottom: action ? 20 : 0,
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes: Record<string, string> = { sm: '16px', md: '24px', lg: '32px' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <svg
        style={{ animation: 'spin 1s linear infinite', width: sizes[size], height: sizes[size], color: 'var(--color-primary)' }}
        viewBox="0 0 24 24"
      >
        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: any) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              marginTop: 4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
