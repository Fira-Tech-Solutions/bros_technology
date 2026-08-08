const BADGE_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  AVAILABLE: { bg: 'var(--color-success-tint)', color: 'var(--color-success)', dot: 'var(--color-success)' },
  PENDING: { bg: 'var(--color-warning-tint)', color: 'var(--color-warning)', dot: 'var(--color-warning)' },
  SOLD: { bg: 'var(--color-danger-tint)', color: 'var(--color-danger)', dot: 'var(--color-danger)' },
  ARCHIVED: { bg: 'var(--color-bg)', color: 'var(--color-text-muted)', dot: 'var(--color-text-muted)' },
  SUCCESS: { bg: 'var(--color-success-tint)', color: 'var(--color-success)', dot: 'var(--color-success)' },
  FAILED: { bg: 'var(--color-danger-tint)', color: 'var(--color-danger)', dot: 'var(--color-danger)' },
  ACTIVE: { bg: 'var(--color-primary-tint)', color: 'var(--color-primary)', dot: 'var(--color-primary)' },
  INACTIVE: { bg: 'var(--color-bg)', color: 'var(--color-text-muted)', dot: 'var(--color-text-muted)' },
};

export default function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const s = BADGE_STYLES[status] || BADGE_STYLES.PENDING;
  const label = status?.charAt(0) + status?.slice(1).toLowerCase();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        padding: size === 'sm' ? '3px 10px' : '5px 14px',
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        background: s.bg,
        color: s.color,
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
