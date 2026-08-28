import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { post } from '../lib/api';
import { optimizeImageUrl } from '../lib/images';
import { useListings, useCategories, useDeleteListing, useUpdateListing } from '../hooks';
import { DataTable, StatusBadge, Button, Modal, PageHeader, LoadingSpinner } from '../components/ui';
import {
  Package,
  Plus,
  Minus,
  Trash2,
  Edit,
  Send,
  Calendar as CalendarIcon,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Monitor,
  Tag,
  LayoutGrid,
  List,
  X,
  CheckSquare,
  Square,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  Flame,
  Clock,
  CircleCheck,
  CircleX,
  Loader2,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  smartphone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  watch: Watch,
  tablet: Monitor,
};

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'AVAILABLE', label: 'Available', color: 'var(--color-success)' },
  { value: 'SOLD', label: 'Sold', color: 'var(--color-danger)' },
  { value: 'PENDING', label: 'Pending', color: 'var(--color-warning)' },
  { value: 'ARCHIVED', label: 'Archived', color: 'var(--color-text-muted)' },
];

export default function Properties() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: listings = [], isLoading: listingsLoading } = useListings();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const deleteMutation = useDeleteListing();
  const updateMutation = useUpdateListing();

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [sortBy, setSortBy] = useState('priority');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchFocused, setSearchFocused] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12); // 12 is optimal for 4-column grid

  // Multi-Selection State for Mass Telegram Posting
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [massPostModal, setMassPostModal] = useState(false);
  const [massPosting, setMassPosting] = useState(false);
  const [massProgress, setMassProgress] = useState({ current: 0, total: 0, completed: false });
  const [massResults, setMassResults] = useState<
    Array<{ id: string; title: string; status: 'pending' | 'running' | 'success' | 'failed'; error?: string }>
  >([]);
  const cancelMassRef = useRef(false);

  // Single item action modals
  const [postModal, setPostModal] = useState<any>(null);
  const [posting, setPosting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<any>(null);

  const loading = listingsLoading || catsLoading;

  // Filter & Sort listings
  const filtered = useMemo(() => {
    let result = listings.filter((l: any) => {
      // 1. Search filter
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (l.title || '').toLowerCase().includes(q) ||
        (l.category?.displayName || '').toLowerCase().includes(q) ||
        (l.category?.name || '').toLowerCase().includes(q);

      // 2. Category filter
      const catName = l.category?.name || (typeof l.category === 'string' ? l.category : '');
      const matchesCategory = !selectedCategory || catName === selectedCategory;

      // 3. Status filter
      const matchesStatus =
        selectedStatus === 'ALL' || (l.status || 'AVAILABLE') === selectedStatus;

      // 4. Priority / Marketing filter
      let matchesPriority = true;
      const attrs = l.attributes || {};
      const priority = attrs.priority || (attrs.isFeatured ? 'TOP_PRIORITY' : 'NORMAL');
      if (selectedPriority === 'TOP_PRIORITY') {
        matchesPriority = priority === 'TOP_PRIORITY' || attrs.isFeatured === true;
      } else if (selectedPriority === 'BEST_SELLER') {
        matchesPriority = priority === 'BEST_SELLER';
      } else if (selectedPriority === 'HOT_DEAL') {
        matchesPriority = priority === 'HOT_DEAL' || Boolean(attrs.originalPrice && Number(attrs.originalPrice) > Number(l.price));
      }

      // 5. Date filter
      let matchesDate = true;
      if (datePreset === 'today') {
        const itemDate = new Date(l.createdAt || 0).toDateString();
        matchesDate = itemDate === new Date().toDateString();
      } else if (datePreset === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesDate = new Date(l.createdAt || 0) >= sevenDaysAgo;
      } else if (datePreset === '30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchesDate = new Date(l.createdAt || 0) >= thirtyDaysAgo;
      } else if (datePreset === 'custom' && dateFilter) {
        const itemDateStr = new Date(l.createdAt || 0).toISOString().split('T')[0];
        matchesDate = itemDateStr === dateFilter;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesDate;
    });

    // Sorting
    result = [...result].sort((a: any, b: any) => {
      if (sortBy === 'priority') {
        const getScore = (item: any) => {
          const at = item.attributes || {};
          const p = at.priority || (at.isFeatured ? 'TOP_PRIORITY' : 'NORMAL');
          if (p === 'TOP_PRIORITY' || at.isFeatured) return 100;
          if (p === 'BEST_SELLER') return 80;
          if (p === 'HOT_DEAL' || (at.originalPrice && Number(at.originalPrice) > Number(item.price))) return 60;
          if (p === 'FEATURED') return 40;
          return 0;
        };
        const diff = getScore(b) - getScore(a);
        if (diff !== 0) return diff;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'price_asc') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price_desc') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === 'stock_asc') {
        return (a.stockQuantity ?? 1) - (b.stockQuantity ?? 1);
      }
      if (sortBy === 'stock_desc') {
        return (b.stockQuantity ?? 1) - (a.stockQuantity ?? 1);
      }
      return 0;
    });

    return result;
  }, [listings, search, selectedCategory, selectedStatus, selectedPriority, datePreset, dateFilter, sortBy]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, selectedStatus, datePreset, dateFilter, sortBy, pageSize]);

  // Paginated listings slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedListings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Multi-Selection helpers
  const isAllSelectedOnPage =
    paginatedListings.length > 0 &&
    paginatedListings.every((l: any) => selectedIds.includes(l.id || l._id));

  const toggleSelectAllOnPage = () => {
    if (isAllSelectedOnPage) {
      const pageIds = paginatedListings.map((l: any) => l.id || l._id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedListings.map((l: any) => l.id || l._id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filtered.map((l: any) => l.id || l._id);
    setSelectedIds(allFilteredIds);
  };

  const toggleSelectListing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Fast optimistic stock adjustment (+ / -)
  const handleQuickStock = async (listing: any, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStock = listing.stockQuantity ?? 1;
    const newStock = Math.max(0, currentStock + delta);
    if (newStock === currentStock) return;

    const listingId = listing.id || listing._id;

    // 1. Optimistic Cache Update
    queryClient.setQueryData(['listings'], (oldListings: any[] | undefined) => {
      if (!oldListings) return [];
      return oldListings.map((l: any) =>
        l.id === listingId || l._id === listingId ? { ...l, stockQuantity: newStock } : l
      );
    });

    // 2. Background PATCH request
    try {
      const fd = new FormData();
      fd.append('title', listing.title || '');
      fd.append('description', listing.description || '');
      fd.append('price', String(listing.price || 0));
      fd.append('status', listing.status || 'AVAILABLE');
      fd.append('categoryId', listing.category?.id || listing.category?._id || listing.categoryId || '');
      fd.append('stockQuantity', String(newStock));
      fd.append('attributes', JSON.stringify(listing.attributes || {}));
      await updateMutation.mutateAsync({ id: listingId, fd });
    } catch (err) {
      console.error('Failed to update stock:', err);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    }
  };

  // Fast optimistic status toggle (AVAILABLE <-> SOLD)
  const handleQuickToggleStatus = async (listing: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = listing.status || 'AVAILABLE';
    const nextStatus = currentStatus === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    const listingId = listing.id || listing._id;

    // 1. Optimistic Cache Update
    queryClient.setQueryData(['listings'], (oldListings: any[] | undefined) => {
      if (!oldListings) return [];
      return oldListings.map((l: any) =>
        l.id === listingId || l._id === listingId ? { ...l, status: nextStatus } : l
      );
    });

    // 2. Background PATCH request
    try {
      const fd = new FormData();
      fd.append('title', listing.title || '');
      fd.append('description', listing.description || '');
      fd.append('price', String(listing.price || 0));
      fd.append('status', nextStatus);
      fd.append('categoryId', listing.category?.id || listing.category?._id || listing.categoryId || '');
      fd.append('stockQuantity', String(listing.stockQuantity ?? 1));
      fd.append('attributes', JSON.stringify(listing.attributes || {}));
      await updateMutation.mutateAsync({ id: listingId, fd });
    } catch (err) {
      console.error('Failed to update status:', err);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    }
  };

  // Fast optimistic priority toggle (NORMAL -> TOP_PRIORITY -> BEST_SELLER -> HOT_DEAL -> NORMAL)
  const handleQuickTogglePriority = async (listing: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentAttrs = listing.attributes || {};
    const currentPriority = currentAttrs.priority || (currentAttrs.isFeatured ? 'TOP_PRIORITY' : 'NORMAL');

    // Cycle: NORMAL -> TOP_PRIORITY -> BEST_SELLER -> HOT_DEAL -> NORMAL
    const nextPriority =
      currentPriority === 'NORMAL' ? 'TOP_PRIORITY' :
      currentPriority === 'TOP_PRIORITY' ? 'BEST_SELLER' :
      currentPriority === 'BEST_SELLER' ? 'HOT_DEAL' : 'NORMAL';

    const newAttributes = {
      ...currentAttrs,
      priority: nextPriority,
      isFeatured: nextPriority === 'TOP_PRIORITY' || nextPriority === 'BEST_SELLER',
    };

    const listingId = listing.id || listing._id;

    // 1. Optimistic Cache Update
    queryClient.setQueryData(['listings'], (oldListings: any[] | undefined) => {
      if (!oldListings) return [];
      return oldListings.map((l: any) =>
        l.id === listingId || l._id === listingId ? { ...l, attributes: newAttributes } : l
      );
    });

    // 2. Background PATCH request
    try {
      const fd = new FormData();
      fd.append('title', listing.title || '');
      fd.append('description', listing.description || '');
      fd.append('price', String(listing.price || 0));
      fd.append('status', listing.status || 'AVAILABLE');
      fd.append('categoryId', listing.category?.id || listing.category?._id || listing.categoryId || '');
      fd.append('stockQuantity', String(listing.stockQuantity ?? 1));
      fd.append('attributes', JSON.stringify(newAttributes));
      await updateMutation.mutateAsync({ id: listingId, fd });
    } catch (err) {
      console.error('Failed to update priority:', err);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    }
  };

  // Single item Telegram post
  const handlePost = async () => {
    if (!postModal) return;
    setPosting(true);
    try {
      await post(`/api/syndication/trigger/${postModal.id || postModal._id}`);
      setPostModal(null);
    } catch (err) {
      console.error('Post failed:', err);
    } finally {
      setPosting(false);
    }
  };

  // Massive / Batch Telegram Posting
  const startMassPosting = async () => {
    if (selectedIds.length === 0) return;

    // Prepare items list
    const selectedItems = listings.filter((l: any) =>
      selectedIds.includes(l.id || l._id)
    );

    const initialResults = selectedItems.map((l: any) => ({
      id: l.id || l._id,
      title: l.title || 'Untitled Product',
      status: 'pending' as const,
    }));

    setMassResults(initialResults);
    setMassProgress({ current: 0, total: selectedItems.length, completed: false });
    setMassPosting(true);
    cancelMassRef.current = false;

    for (let i = 0; i < selectedItems.length; i++) {
      if (cancelMassRef.current) {
        break;
      }

      const item = selectedItems[i];
      const itemId = item.id || item._id;

      // Set running status
      setMassResults((prev) =>
        prev.map((r) => (r.id === itemId ? { ...r, status: 'running' } : r))
      );

      try {
        await post(`/api/syndication/trigger/${itemId}`);
        setMassResults((prev) =>
          prev.map((r) => (r.id === itemId ? { ...r, status: 'success' } : r))
        );
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || err.message || 'Post failed';
        setMassResults((prev) =>
          prev.map((r) => (r.id === itemId ? { ...r, status: 'failed', error: errorMsg } : r))
        );
      }

      setMassProgress({ current: i + 1, total: selectedItems.length, completed: i + 1 === selectedItems.length });

      // 400ms delay to avoid Telegram rate limits
      if (i < selectedItems.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }

    setMassPosting(false);
    queryClient.invalidateQueries({ queryKey: ['syndicationLogs'] });
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const listingId = deleteModal.id || deleteModal._id;
    await deleteMutation.mutateAsync(listingId);
    setDeleteModal(null);
  };

  // Table columns definition
  const columns = [
    {
      header: (
        <button
          onClick={toggleSelectAllOnPage}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          title={isAllSelectedOnPage ? 'Deselect all' : 'Select all on page'}
        >
          {isAllSelectedOnPage ? (
            <CheckSquare size={18} style={{ color: 'var(--color-primary)' }} />
          ) : (
            <Square size={18} style={{ color: 'var(--color-text-muted)' }} />
          )}
        </button>
      ),
      render: (row: any) => {
        const rowId = row.id || row._id;
        const selected = selectedIds.includes(rowId);
        return (
          <button
            onClick={(e) => toggleSelectListing(rowId, e)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {selected ? (
              <CheckSquare size={18} style={{ color: 'var(--color-primary)' }} />
            ) : (
              <Square size={18} style={{ color: 'var(--color-text-muted)' }} />
            )}
          </button>
        );
      },
    },
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
              <img
                src={optimizeImageUrl(row.images[0], 'thumb')}
                alt=""
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Package size={18} style={{ color: 'var(--color-text-muted)' }} />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 220,
              }}
            >
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
      header: 'Availability',
      render: (row: any) => (
        <button
          onClick={(e) => handleQuickToggleStatus(row, e)}
          title="Click to toggle availability"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <StatusBadge status={row.status || 'AVAILABLE'} />
        </button>
      ),
    },
    {
      header: 'Stock',
      render: (row: any) => {
        const qty = row.stockQuantity ?? 1;
        return (
          <div
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="stepper-btn"
              disabled={qty <= 0}
              onClick={(e) => handleQuickStock(row, -1, e)}
              title="Decrease stock"
            >
              <Minus size={13} />
            </button>
            <span
              style={{
                minWidth: 28,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'var(--font-body)',
                color: qty === 0 ? 'var(--color-danger)' : qty <= 3 ? 'var(--color-warning)' : 'var(--color-success)',
              }}
            >
              {qty}
            </span>
            <button
              className="stepper-btn"
              onClick={(e) => handleQuickStock(row, 1, e)}
              title="Increase stock"
            >
              <Plus size={13} />
            </button>
          </div>
        );
      },
    },
    {
      header: 'Marketing',
      render: (row: any) => {
        const attrs = row.attributes || {};
        const p = attrs.priority || (attrs.isFeatured ? 'TOP_PRIORITY' : 'NORMAL');
        const hasDiscount = attrs.originalPrice && Number(attrs.originalPrice) > Number(row.price);

        return (
          <button
            onClick={(e) => handleQuickTogglePriority(row, e)}
            title="Click to cycle marketing priority"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background:
                p === 'TOP_PRIORITY' ? 'rgba(56, 189, 248, 0.15)' :
                p === 'BEST_SELLER' ? 'rgba(234, 179, 8, 0.15)' :
                p === 'HOT_DEAL' ? 'rgba(239, 68, 68, 0.15)' :
                hasDiscount ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-bg)',
              color:
                p === 'TOP_PRIORITY' ? '#0284c7' :
                p === 'BEST_SELLER' ? '#ca8a04' :
                p === 'HOT_DEAL' ? '#dc2626' :
                hasDiscount ? '#dc2626' : 'var(--color-text-muted)',
            }}
          >
            {p === 'TOP_PRIORITY' && <Sparkles size={12} />}
            {p === 'BEST_SELLER' && <Star size={12} fill="currentColor" />}
            {p === 'HOT_DEAL' && <Flame size={12} />}
            {p === 'NORMAL' && !hasDiscount && <Tag size={12} />}
            <span>
              {p === 'TOP_PRIORITY' ? 'Top Priority' :
               p === 'BEST_SELLER' ? 'Best Seller' :
               p === 'HOT_DEAL' ? 'Hot Deal' :
               hasDiscount ? 'Discount' : 'Standard'}
            </span>
          </button>
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
      header: 'Listed Date',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <CalendarIcon size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div className="table-actions" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e: any) => e.stopPropagation()}>
          <ActionButton
            icon={Star}
            active={Boolean(row.attributes?.priority && row.attributes?.priority !== 'NORMAL')}
            activeColor="#eab308"
            onClick={() => handleQuickTogglePriority(row, { stopPropagation: () => {} } as any)}
            title="Cycle Marketing Priority"
          />
          <ActionButton icon={Edit} onClick={() => navigate(`/properties/${row.id || row._id}`)} title="Edit" />
          <ActionButton icon={Send} onClick={() => setPostModal(row)} title="Post to Telegram" />
          <ActionButton icon={Trash2} onClick={() => setDeleteModal(row)} title="Delete" danger />
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', paddingBottom: selectedIds.length > 0 ? 80 : 20 }}>
      {/* Top Header */}
      <PageHeader
        title="Products"
        subtitle={`${filtered.length} of ${listings.length} products listed`}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selectedIds.length > 0 && (
              <Button
                variant="primary"
                icon={Send}
                onClick={() => {
                  setMassPostModal(true);
                  startMassPosting();
                }}
              >
                <span>Mass Post ({selectedIds.length})</span>
              </Button>
            )}
            <Button icon={Plus} onClick={() => navigate('/properties/new')}>
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        }
      />

      {/* Control Bar: Search, Category, Status, Calendar Date Filter, Sort & View Mode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 260px', width: '100%', minWidth: 200, position: 'relative' }}>
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
              <Package size={16} />
            </div>
            <input
              type="text"
              placeholder="Search products, brand, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%',
                height: 42,
                padding: '0 36px 0 40px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${searchFocused ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: 'var(--color-surface)',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
                outline: 'none',
                boxShadow: searchFocused ? '0 0 0 3px rgba(24,120,180,0.1)' : 'var(--shadow-sm)',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div style={{ position: 'relative', flex: '1 1 135px', minWidth: 120 }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                height: 42,
                padding: '0 30px 0 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c: any) => (
                <option key={c.id || c._id} value={c.name}>
                  {c.displayName || c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div style={{ position: 'relative', flex: '1 1 120px', minWidth: 110 }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: '100%',
                height: 42,
                padding: '0 30px 0 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Marketing Priority Filter Dropdown */}
          <div style={{ position: 'relative', flex: '1 1 135px', minWidth: 120 }}>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              style={{
                width: '100%',
                height: 42,
                padding: '0 30px 0 10px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${selectedPriority !== 'ALL' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: selectedPriority !== 'ALL' ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                color: selectedPriority !== 'ALL' ? 'var(--color-primary)' : 'var(--color-text)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              <option value="ALL">⭐ All Marketing</option>
              <option value="TOP_PRIORITY">⭐ Top Priority</option>
              <option value="BEST_SELLER">🏆 Best Sellers</option>
              <option value="HOT_DEAL">🔥 Hot Deals</option>
            </select>
          </div>

          {/* Calendar / Listed Date Filter Dropdown & Native Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 135px', minWidth: 120 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                value={datePreset}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setDatePreset(val);
                  if (val !== 'custom') setDateFilter('');
                }}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 30px 0 10px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${datePreset !== 'all' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: datePreset !== 'all' ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  color: datePreset !== 'all' ? 'var(--color-primary)' : 'var(--color-text)',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                <option value="all">📅 Any Date</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Date...</option>
              </select>
            </div>

            {datePreset === 'custom' && (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    height: 42,
                    padding: '0 8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-primary)',
                    background: 'var(--color-surface)',
                    fontSize: 12,
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div style={{ position: 'relative', flex: '1 1 135px', minWidth: 120 }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                height: 42,
                padding: '0 30px 0 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              <option value="priority">⭐ Marketing Priority</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_desc">Stock: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
            </select>
          </div>

          {/* View Mode Switcher (Cards vs Table) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 3,
              gap: 2,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              title="Card Grid View (4+ products per row)"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast), color var(--transition-fast)',
                fontSize: 13,
                fontWeight: 500,
                gap: 6,
              }}
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'table' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast), color var(--transition-fast)',
                fontSize: 13,
                fontWeight: 500,
                gap: 6,
              }}
            >
              <List size={15} />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Selection Bar & Quick Category Chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {/* Category Pills */}
          <div
            className="chip-scroll-container"
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'none',
              flex: 1,
            }}
          >
            <button
              onClick={() => setSelectedCategory('')}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                border: `1px solid ${selectedCategory === '' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: selectedCategory === '' ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                color: selectedCategory === '' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background var(--transition-fast), color var(--transition-fast)',
              }}
            >
              All ({listings.length})
            </button>
            {categories.map((c: any) => {
              const active = selectedCategory === c.name;
              const Icon = ICON_MAP[c.icon] || Tag;
              const count = listings.filter(
                (l: any) => (l.category?.name || l.category) === c.name
              ).length;
              return (
                <button
                  key={c.id || c._id}
                  onClick={() => setSelectedCategory(active ? '' : c.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: 'var(--font-body)',
                    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: active ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background var(--transition-fast), color var(--transition-fast)',
                  }}
                >
                  <Icon size={12} />
                  <span>{c.displayName || c.name}</span>
                  <span style={{ opacity: 0.7, fontSize: 11 }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Quick Select All Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleSelectAllOnPage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              {isAllSelectedOnPage ? <CheckSquare size={14} style={{ color: 'var(--color-primary)' }} /> : <Square size={14} />}
              <span>Select Page ({paginatedListings.length})</span>
            </button>

            {filtered.length > paginatedListings.length && (
              <button
                onClick={selectAllFiltered}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                <span>Select All ({filtered.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: 4+ Horizontal Product Cards or Table View */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '80px 20px',
            textAlign: 'center',
          }}
        >
          <Package
            size={48}
            style={{ color: 'var(--color-border)', margin: '0 auto 16px', display: 'block' }}
          />
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              margin: '0 0 6px',
            }}
          >
            No products found
          </h3>
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              margin: '0 0 16px',
            }}
          >
            Try adjusting your search query, date, or category filters.
          </p>
          {(search || selectedCategory || selectedStatus !== 'ALL' || datePreset !== 'all') && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedStatus('ALL');
                setDatePreset('all');
                setDateFilter('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* 4+ Cards Horizontal Grid */
        <div className="product-card-grid">
          {paginatedListings.map((item: any) => {
            const itemId = item.id || item._id;
            const CategoryIcon = ICON_MAP[item.category?.icon] || Tag;
            const isAvailable = (item.status || 'AVAILABLE') === 'AVAILABLE';
            const stockQty = item.stockQuantity ?? 1;
            const isSelected = selectedIds.includes(itemId);

            return (
              <div
                key={itemId}
                className="product-card"
                onClick={() => navigate(`/properties/${itemId}`)}
                style={{
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  boxShadow: isSelected ? '0 0 0 1px var(--color-primary), var(--shadow-md)' : undefined,
                }}
              >
                {/* Cover Image & Overlays */}
                <div className="product-card-img-container">
                  {item.images?.[0] ? (
                    <img
                      src={optimizeImageUrl(item.images[0], 'card')}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="product-card-img"
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <Package size={36} />
                    </div>
                  )}

                  {/* Top-Left Selection Checkbox + Category Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      zIndex: 2,
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => toggleSelectListing(itemId, e)}
                      title={isSelected ? 'Deselect product' : 'Select product for mass action'}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--color-primary)' : 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: `1.5px solid ${isSelected ? 'var(--color-primary)' : '#ffffff'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#ffffff',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {isSelected ? <Check size={16} strokeWidth={3} /> : null}
                    </button>

                    {/* Category Pill & Marketing Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 9px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <CategoryIcon size={12} style={{ color: 'var(--color-primary-light, #38bdf8)' }} />
                      <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.category?.displayName || item.category?.name || 'Item'}
                      </span>
                    </div>

                    {/* Marketing Priority Pill */}
                    {item.attributes?.priority && item.attributes?.priority !== 'NORMAL' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background:
                            item.attributes?.priority === 'BEST_SELLER' ? 'rgba(234, 179, 8, 0.9)' :
                            item.attributes?.priority === 'TOP_PRIORITY' ? 'rgba(56, 189, 248, 0.9)' :
                            'rgba(239, 68, 68, 0.9)',
                          backdropFilter: 'blur(8px)',
                          color: '#ffffff',
                          fontSize: 11,
                          fontWeight: 700,
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        {item.attributes?.priority === 'BEST_SELLER' && <Star size={11} fill="#ffffff" />}
                        {item.attributes?.priority === 'TOP_PRIORITY' && <Sparkles size={11} />}
                        {item.attributes?.priority === 'HOT_DEAL' && <Flame size={11} />}
                        <span>
                          {item.attributes?.priority === 'BEST_SELLER' ? 'Best Seller' :
                           item.attributes?.priority === 'TOP_PRIORITY' ? 'Top Choice' :
                           item.attributes?.priority === 'HOT_DEAL' ? 'Hot Deal' : 'Featured'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Top-Right Quick Availability Switch */}
                  <button
                    onClick={(e) => handleQuickToggleStatus(item, e)}
                    title={`Click to turn ${isAvailable ? 'OFF (Sold)' : 'ON (Available)'}`}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: isAvailable ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 0 6px #ffffff',
                      }}
                    />
                    <span>{isAvailable ? 'Available' : item.status || 'Sold'}</span>
                  </button>

                  {/* Bottom Gradient Scrim with Title & Price */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '36px 12px 10px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 60%, transparent 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      zIndex: 1,
                    }}
                  >
                    <h3
                      title={item.title}
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: 'var(--font-heading)',
                        color: '#ffffff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                      }}
                    >
                      {item.title || 'Untitled Product'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 3 }}>
                      {item.attributes?.originalPrice && Number(item.attributes.originalPrice) > Number(item.price) && (
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: 'var(--font-body)',
                            color: 'rgba(255,255,255,0.6)',
                            textDecoration: 'line-through',
                          }}
                        >
                          {Number(item.attributes.originalPrice).toLocaleString()} ETB
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          fontFamily: 'var(--font-body)',
                          color: '#38bdf8',
                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                        }}
                      >
                        {(item.price || 0).toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body: Quick Stock Stepper & Interactive Actions */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Stock Quantity Quick Stepper */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--color-bg)',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Package size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: 'var(--font-body)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        Stock
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        className="stepper-btn"
                        disabled={stockQty <= 0}
                        onClick={(e) => handleQuickStock(item, -1, e)}
                        title="Decrease stock by 1"
                      >
                        <Minus size={13} />
                      </button>

                      <span
                        style={{
                          minWidth: 26,
                          textAlign: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: 'var(--font-body)',
                          color:
                            stockQty === 0
                              ? 'var(--color-danger)'
                              : stockQty <= 3
                              ? 'var(--color-warning)'
                              : 'var(--color-success)',
                        }}
                      >
                        {stockQty}
                      </span>

                      <button
                        className="stepper-btn"
                        onClick={(e) => handleQuickStock(item, 1, e)}
                        title="Increase stock by 1"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom: Listed Date & Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-body)',
                        color: 'var(--color-text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 120,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <CalendarIcon size={11} />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                    </span>

                    {/* Action buttons */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionButton
                        icon={Star}
                        active={Boolean(item.attributes?.priority && item.attributes?.priority !== 'NORMAL')}
                        activeColor="#eab308"
                        onClick={() => handleQuickTogglePriority(item, { stopPropagation: () => {} } as any)}
                        title="Cycle Marketing Priority (Standard -> Top Priority -> Best Seller -> Hot Deal)"
                      />
                      <ActionButton
                        icon={Edit}
                        onClick={() => navigate(`/properties/${itemId}`)}
                        title="Edit product"
                      />
                      <ActionButton
                        icon={Send}
                        onClick={() => setPostModal(item)}
                        title="Post to Telegram"
                      />
                      <ActionButton
                        icon={Trash2}
                        onClick={() => setDeleteModal(item)}
                        title="Delete product"
                        danger
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <DataTable
          columns={columns}
          data={paginatedListings}
          onRowClick={(row: any) => navigate(`/properties/${row.id || row._id}`)}
          emptyMessage="No products found"
          emptyIcon={Package}
          showPagination={false}
        />
      )}

      {/* ═══ PAGINATION CONTROLS (Cards & Table) ═══ */}
      {filtered.length > 0 && (
        <div
          style={{
            marginTop: 24,
            padding: '16px 20px',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Info text & page size selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
              Showing <strong>{(page - 1) * pageSize + 1}</strong> – <strong>{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> products
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                Per page:
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{
                  height: 32,
                  padding: '0 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  fontSize: 12,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value={12}>12 cards</option>
                <option value={24}>24 cards</option>
                <option value={48}>48 cards</option>
                <option value={100}>100 cards</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  height: 32,
                  padding: '0 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: page <= 1 ? 'var(--color-text-muted)' : 'var(--color-text)',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                let pNum = idx + 1;
                if (totalPages > 5) {
                  if (page > 3) {
                    pNum = page - 2 + idx;
                  }
                  if (pNum > totalPages) {
                    pNum = totalPages - 4 + idx;
                  }
                }
                if (pNum < 1 || pNum > totalPages) return null;

                const isCurrent = page === pNum;
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${isCurrent ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: isCurrent ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: isCurrent ? '#ffffff' : 'var(--color-text)',
                      fontSize: 13,
                      fontWeight: isCurrent ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  height: 32,
                  padding: '0 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: page >= totalPages ? 'var(--color-text-muted)' : 'var(--color-text)',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ FLOATING BULK ACTION BAR (Mass Telegram Post) ═══ */}
      {selectedIds.length > 0 && (
        <div className="floating-bulk-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {selectedIds.length}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
              }}
            >
              Selected
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => {
                setMassPostModal(true);
                startMassPosting();
              }}
            >
              <span>Post to TG ({selectedIds.length})</span>
            </Button>

            <button
              onClick={() => setSelectedIds([])}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ═══ MASSIVE TELEGRAM POST MODAL ═══ */}
      <Modal
        open={massPostModal}
        onClose={() => {
          if (massPosting) {
            cancelMassRef.current = true;
          }
          setMassPostModal(false);
        }}
        title="Mass Post to Telegram"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Progress Banner */}
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              background: massProgress.completed ? 'var(--color-success-tint, rgba(34, 197, 94, 0.1))' : 'var(--color-primary-tint)',
              border: `1px solid ${massProgress.completed ? 'var(--color-success)' : 'var(--color-primary)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {massPosting ? (
                  <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                ) : massProgress.completed ? (
                  <CircleCheck size={18} style={{ color: 'var(--color-success)' }} />
                ) : (
                  <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                )}
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                  {massPosting
                    ? `Posting ${massProgress.current} of ${massProgress.total} products...`
                    : massProgress.completed
                    ? `All ${massProgress.total} products posted to Telegram!`
                    : `Ready to post ${selectedIds.length} products to Telegram`}
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
                {massProgress.total > 0 ? Math.round((massProgress.current / massProgress.total) * 100) : 0}%
              </span>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: 8,
                borderRadius: 4,
                background: 'var(--color-border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${massProgress.total > 0 ? (massProgress.current / massProgress.total) * 100 : 0}%`,
                  background: massProgress.completed ? 'var(--color-success)' : 'var(--color-primary)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Results List */}
          <div
            style={{
              maxHeight: 280,
              overflowY: 'auto',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg)',
            }}
          >
            {massResults.map((res, index) => (
              <div
                key={res.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: index < massResults.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', width: 20 }}>
                    #{index + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-body)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 280,
                    }}
                  >
                    {res.title}
                  </span>
                </div>

                <div>
                  {res.status === 'pending' && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <Clock size={13} /> Queued
                    </span>
                  )}
                  {res.status === 'running' && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                      }}
                    >
                      <Loader2 size={13} className="animate-spin" /> Posting...
                    </span>
                  )}
                  {res.status === 'success' && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        color: 'var(--color-success)',
                        fontWeight: 600,
                      }}
                    >
                      <CircleCheck size={13} /> Posted
                    </span>
                  )}
                  {res.status === 'failed' && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        color: 'var(--color-danger)',
                        fontWeight: 600,
                      }}
                      title={res.error}
                    >
                      <CircleX size={13} /> Failed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Modal Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            {massPosting ? (
              <Button
                variant="danger"
                onClick={() => {
                  cancelMassRef.current = true;
                  setMassPosting(false);
                }}
              >
                Cancel Process
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  setMassPostModal(false);
                  setSelectedIds([]);
                }}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Single Post Modal */}
      <Modal
        open={!!postModal}
        onClose={() => setPostModal(null)}
        title="Post to Telegram"
        size="sm"
      >
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          Post <strong>{postModal?.title}</strong> directly to your connected Telegram channel?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="ghost" onClick={() => setPostModal(null)}>
            Cancel
          </Button>
          <Button icon={Send} loading={posting} onClick={handlePost}>
            Post Now
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Product"
        size="sm"
      >
        <p
          style={{
            fontSize: 14,
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          Are you sure you want to delete <strong>{deleteModal?.title}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            loading={deleteMutation.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  onClick,
  title,
  danger,
  active,
  activeColor,
}: {
  icon: any;
  onClick: () => void;
  title: string;
  danger?: boolean;
  active?: boolean;
  activeColor?: string;
}) {
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
        background: hovered
          ? danger
            ? 'var(--color-danger-tint)'
            : 'var(--color-primary-tint)'
          : active
          ? 'var(--color-primary-tint)'
          : 'transparent',
        color: hovered
          ? danger
            ? 'var(--color-danger)'
            : 'var(--color-primary)'
          : active
          ? activeColor || 'var(--color-primary)'
          : 'var(--color-text-muted)',
        cursor: 'pointer',
      }}
    >
      <Icon size={15} />
    </button>
  );
}
