import { useState, useEffect } from 'react';
import { Package, TrendingUp, FolderOpen, ArrowRight, Smartphone, Laptop, Watch, Headphones, Tablet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { get } from '../lib/api';
import { StatCard, PageHeader, LoadingSpinner } from '../components/ui';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'var(--color-success)',
  PENDING: 'var(--color-warning)',
  SOLD: 'var(--color-danger)',
  ARCHIVED: 'var(--color-text-muted)',
};

const CATEGORY_ICONS: Record<string, any> = {
  PHONES: Smartphone,
  SMARTPHONES: Smartphone,
  IPHONES_SAMSUNG: Smartphone,
  LAPTOPS: Laptop,
  SMARTWATCHES: Watch,
  AIRPODS: Headphones,
  TABLETS: Tablet,
  IPADS_MACBOOKS: Laptop,
  'IPADS & MACBOOKS': Laptop,
};

const CATEGORY_COLORS: string[] = [
  '#1878B4', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Record<string, number>>({ total: 0, available: 0, sold: 0, pending: 0, archived: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const fetchAll = async (endpoint: string) => {
          let all: any[] = [];
          let page = 1;
          while (true) {
            const res = await get(endpoint, { params: { page, limit: 100 } });
            const chunk = res.data?.data || res.data?.listings || res.data || [];
            const arr = Array.isArray(chunk) ? chunk : [];
            all = [...all, ...arr];
            const total = res.data?.pagination?.total || 0;
            if (all.length >= total || arr.length < 100) break;
            page++;
          }
          return all;
        };

        const [listings, catsRaw] = await Promise.all([
          fetchAll('/api/listings'),
          get('/api/categories'),
        ]);
        const totalCount = listings.length;
        const cats = Array.isArray(catsRaw.data?.data || catsRaw.data?.categories || catsRaw.data) ? (catsRaw.data?.data || catsRaw.data?.categories || catsRaw.data) : [];

        const statusCounts: Record<string, number> = { total: totalCount, available: 0, sold: 0, pending: 0, archived: 0 };
        listings.forEach((l: any) => {
          const s = (l.status || 'AVAILABLE').toUpperCase();
          if (statusCounts[s.toLowerCase()] !== undefined) statusCounts[s.toLowerCase()]++;
        });
        setStats(statusCounts);
        setCategories(cats);
        setRecentListings(listings.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = [
    { name: 'Available', value: stats.available || 0, color: STATUS_COLORS.AVAILABLE },
    { name: 'Sold', value: stats.sold || 0, color: STATUS_COLORS.SOLD },
    { name: 'Pending', value: stats.pending || 0, color: STATUS_COLORS.PENDING },
    { name: 'Archived', value: stats.archived || 0, color: STATUS_COLORS.ARCHIVED },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your store performance" />

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        <StatCard title="Total Products" value={stats.total || 0} icon={Package} />
        <StatCard title="Available" value={stats.available || 0} icon={TrendingUp} />
        <StatCard title="Sold" value={stats.sold || 0} icon={Package} />
        <StatCard title="Categories" value={categories.length} icon={FolderOpen} />
      </div>

      {/* Device Analytics by Category */}
      {categories.length > 0 && (
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            padding: 28,
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text)',
              marginBottom: 20,
            }}
          >
            Device Analytics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {categories.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.name?.toUpperCase()] || CATEGORY_ICONS[cat.displayName?.toUpperCase()] || Package;
              const count = cat.listingCount || 0;
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <div
                  key={cat.id || cat._id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/properties')}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 0 1px ${color}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: `${color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-text)', lineHeight: 1 }}>
                      {count}
                    </p>
                    <p style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {cat.displayName || cat.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        {/* Chart */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            padding: 28,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text)',
              marginBottom: 24,
            }}
          >
            Status Distribution
          </h3>

          {/* Custom bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 220, paddingTop: 20 }}>
            {chartData.map((item, i) => {
              const pct = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                      {item.value}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                      {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 64,
                      height: Math.max((item.value / maxValue) * 160, 4),
                      background: item.color,
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 0.5s ease',
                    }}
                  />
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Products */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              Recent Products
            </h3>
            <button
              onClick={() => navigate('/properties')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary-dark)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div>
            {recentListings.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', fontSize: 14, color: 'var(--color-text-muted)' }}>
                No products yet
              </div>
            ) : (
              recentListings.map((listing: any, i: number) => (
                <div
                  key={listing.id || listing._id || i}
                  onClick={() => navigate(`/properties/${listing.id || listing._id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 24px',
                    borderBottom: i < recentListings.length - 1 ? '1px solid var(--color-border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary-tint)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={18} style={{ color: 'var(--color-text-muted)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        fontFamily: 'var(--font-body)',
                        color: 'var(--color-text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {listing.title || 'Untitled'}
                    </p>
                    <p style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                      {(listing.price || 0).toLocaleString()} ETB
                    </p>
                  </div>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: STATUS_COLORS[listing.status || 'AVAILABLE'] || '#6B7280',
                      flexShrink: 0,
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
