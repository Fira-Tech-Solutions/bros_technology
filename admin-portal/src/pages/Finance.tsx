import { useAssetStats } from '../hooks';
import { PageHeader, LoadingSpinner } from '../components/ui';
import { DollarSign, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS = ['#1878B4', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];
const CATEGORY_ICONS = {
  IPHONES_SAMSUNG: '📱',
  IPADS_MACBOOKS: '💻',
  LAPTOPS: '🖥️',
  AIRPODS: '🎧',
  SMARTWATCHES: '⌚',
};

export default function Finance() {
  const { data: stats, isLoading } = useAssetStats();

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}><LoadingSpinner size="lg" /></div>;
  }

  const categoryData: Record<string, any> = stats?.byCategory || stats?.categories || stats || {};
  const categoryEntries = Object.entries(categoryData).filter(([k]) => !['_id', 'createdAt', 'updatedAt'].includes(k));

  const totalProducts = stats?.totalAssets || categoryEntries.reduce((sum, [, v]) => sum + (v.count || v.listings || 0), 0);
  const totalValue = stats?.totalValue || categoryEntries.reduce((sum, [, v]) => sum + (v.totalValue || v.value || 0), 0);
  const totalSold = stats?.SOLD || categoryEntries.reduce((sum, [, v]) => sum + (v.sold || 0), 0);
  const totalStock = stats?.totalStock || 0;

  const chartData = categoryEntries.map(([key, val], i) => ({
    name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
    count: val.count || val.listings || 0,
    value: val.totalValue || val.value || 0,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title="Finance" subtitle="Asset overview by category" />

      <div className="grid-responsive-4" style={{ display: 'grid', gap: 16 }}>
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>{totalProducts}</p>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>Total Products</p>
            </div>
          </div>
        </div>
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-success-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} style={{ color: 'var(--color-success)' }} />
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>{totalSold}</p>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>Total Sold</p>
            </div>
          </div>
        </div>
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>{totalStock}</p>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>Total Stock</p>
            </div>
          </div>
        </div>
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-warning-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} style={{ color: 'var(--color-warning)' }} />
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>{totalValue.toLocaleString()} ETB</p>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>Total Value</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: '0 0 16px' }}>Products by Category</h3>
        <div style={{ height: 288 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-responsive-3" style={{ display: 'grid', gap: 16 }}>
        {chartData.map((cat, i) => (
          <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: `${cat.color}15` }}
              >
                {Object.values(CATEGORY_ICONS)[i] || '📦'}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-body)', margin: 0 }}>{cat.name}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>{cat.count} products</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
              <span>Value: {cat.value.toLocaleString()} ETB</span>
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
