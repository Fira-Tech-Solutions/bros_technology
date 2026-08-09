import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../lib/api';
import { useListings, useCategories, useDeleteListing } from '../hooks';
import { DataTable, StatusBadge, Button, Modal, PageHeader, LoadingSpinner } from '../components/ui';
import { Package, Plus, Trash2, Edit, Send, Filter, Calendar, Smartphone, Laptop, Headphones, Watch, Monitor, Tag } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  smartphone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  watch: Watch,
  tablet: Monitor,
};

export default function Properties() {
  const navigate = useNavigate();
  const { data: listings = [], isLoading: listingsLoading } = useListings();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const deleteMutation = useDeleteListing();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [syndicateModal, setSyndicateModal] = useState<any>(null);
  const [syndicating, setSyndicating] = useState(false);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const loading = listingsLoading || catsLoading;

  const filtered = useMemo(() => listings.filter((l: any) => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (l.title || '').toLowerCase().includes(q) ||
      (l.category?.displayName || '').toLowerCase().includes(q) ||
      (l.category?.name || '').toLowerCase().includes(q);
    const catName = l.category?.name || (typeof l.category === 'string' ? l.category : '');
    const matchesCategory = !selectedCategory || catName === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [listings, search, selectedCategory]);

  const handleSyndicate = async () => {
    if (!syndicateModal) return;
    setSyndicating(true);
    try {
      await post(`/api/syndication/trigger/${syndicateModal.id || syndicateModal._id}`);
      setSyndicateModal(null);
    } catch (err) {
      console.error('Syndicate failed:', err);
    } finally {
      setSyndicating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const listingId = deleteModal.id || deleteModal._id;
    await deleteMutation.mutateAsync(listingId);
    setDeleteModal(null);
  };

  const columns = [
    {
      header: 'Product',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
            {row.images?.[0] ? (
              <img src={row.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Package size={18} style={{ color: 'var(--color-text-muted)' }} />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
              {row.title || 'Untitled'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              {(() => {
                const Icon = ICON_MAP[row.category?.icon] || Tag;
                return <Icon size={12} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />;
              })()}
              <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                {row.category?.displayName || row.category?.name || 'Uncategorized'}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Price',
      render: (row: any) => (
        <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
          {(row.price || 0).toLocaleString()} ETB
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row: any) => <StatusBadge status={row.status || 'AVAILABLE'} />,
    },
    {
      header: 'Stock',
      render: (row: any) => {
        const qty = row.stockQuantity || 0;
        return (
          <span style={{
            fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
            color: qty === 0 ? 'var(--color-danger)' : qty <= 3 ? 'var(--color-warning)' : 'var(--color-success)',
          }}>
            {qty}
          </span>
        );
      },
    },
    {
      header: 'Agent',
      render: (row: any) => (
        <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
          {row.agent?.firstName || row.agent?.name || (typeof row.agent === 'string' ? row.agent : '—')}
        </span>
      ),
    },
    {
      header: 'Date',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (row: any, hovered: boolean) => (
        <div className={`table-actions ${hovered ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e: any) => e.stopPropagation()}>
          <ActionButton icon={Edit} onClick={() => navigate(`/properties/${row.id || row._id}`)} title="Edit" />
          <ActionButton icon={Send} onClick={() => setSyndicateModal(row)} title="Syndicate" />
          <ActionButton icon={Trash2} onClick={() => setDeleteModal(row)} title="Delete" danger />
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${filtered.length} of ${listings.length} products`}
        action={
          <Button icon={Plus} onClick={() => navigate('/properties/new')}>
            <span className="sm\:hidden" style={{ display: 'none' }}>Add</span>
            <span className="hidden sm\:inline">Add Product</span>
          </Button>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexDirection: 'column' }} className="sm\:flex" >
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Package size={16} />
          </div>
          <input
            type="text"
            placeholder="Search products or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%',
              height: 44,
              padding: '0 14px 0 40px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${searchFocused ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: 'var(--color-surface)',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text)',
              outline: 'none',
              boxShadow: searchFocused ? '0 0 0 3px rgba(24,120,180,0.1)' : 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)',
              boxSizing: 'border-box' as const,
            }}
          />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              height: 44,
              padding: '0 36px 0 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text)',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none' as const,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id || c._id} value={c.name}>{c.displayName || c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row: any) => navigate(`/properties/${row.id || row._id}`)}
        emptyMessage="No products found"
        emptyIcon={Package}
        pageSize={15}
      />

      <Modal open={!!syndicateModal} onClose={() => setSyndicateModal(null)} title="Syndicate to Telegram" size="sm">
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', marginBottom: 20, lineHeight: 1.6 }}>
          Send <strong>{syndicateModal?.title}</strong> to the Telegram channel?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="ghost" onClick={() => setSyndicateModal(null)}>Cancel</Button>
          <Button icon={Send} loading={syndicating} onClick={handleSyndicate}>Send Now</Button>
        </div>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Product" size="sm">
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', marginBottom: 20, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{deleteModal?.title}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" icon={Trash2} loading={deleteMutation.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function ActionButton({ icon: Icon, onClick, title, danger }: { icon: any; onClick: () => void; title: string; danger?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: hovered ? (danger ? 'var(--color-danger-tint)' : 'var(--color-primary-tint)') : 'transparent',
        color: hovered ? (danger ? 'var(--color-danger)' : 'var(--color-primary)') : 'var(--color-text-muted)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
    >
      <Icon size={15} />
    </button>
  );
}
