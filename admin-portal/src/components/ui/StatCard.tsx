import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, className = '' }: any) {
  const isPositive = trend > 0;

  return (
    <div
      className={className}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: 24,
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={22} style={{ color: 'var(--color-primary)' }} />
        </div>
        {trend !== undefined && trend !== null && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3
        style={{
          fontSize: 32,
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text)',
          lineHeight: 1,
          marginBottom: 4,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </h3>
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.3,
        }}
      >
        {title}
      </p>
      {trendLabel && (
        <p
          style={{
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
            marginTop: 8,
          }}
        >
          {trendLabel}
        </p>
      )}
    </div>
  );
}
