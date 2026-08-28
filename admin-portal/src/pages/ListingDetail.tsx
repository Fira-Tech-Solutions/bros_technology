import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { post } from '../lib/api';
import { useListing, useUpdateListing, useDeleteListing } from '../hooks';
import { Button, Input, Select, Textarea, StatusBadge, LoadingSpinner, Modal } from '../components/ui';
import { ArrowLeft, Trash2, Save, Send, Upload, X, ChevronDown, ChevronUp, Tag, Plus, Check, GripVertical, Star } from 'lucide-react';
import { optimizeImageUrl } from '../lib/images';
import { PRODUCT_OPTIONS, FIELD_LABELS } from '../config/productOptions';

const STATUS_OPTIONS = ['AVAILABLE', 'PENDING', 'SOLD', 'ARCHIVED'];

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: listing, isLoading: loading } = useListing(id || '');
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();
  const [deleteModal, setDeleteModal] = useState(false);
  const [syndicateModal, setSyndicateModal] = useState(false);
  const [syndicating, setSyndicating] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [showFieldDropdown, setShowFieldDropdown] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    if (listing) {
      const attrs = listing.attributes || {};
      setAttributes(attrs);
      setCurrentImages(listing.images || []);
      setForm({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price || '',
        status: listing.status || 'AVAILABLE',
        categoryId: listing.category?.id || listing.categoryId || '',
        stockQuantity: listing.stockQuantity ?? 1,
      });
    }
  }, [listing]);

  const updateForm = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const updateAttribute = (key: string, value: any) => setAttributes(prev => ({ ...prev, [key]: value }));

  const getFieldOptions = (fieldName: string, category: any): string[] => {
    const catName = category?.name?.toUpperCase();
    const catOptions = PRODUCT_OPTIONS[catName];
    if (!catOptions) return [];

    const options = catOptions[fieldName];
    if (!options) return [];

    if (fieldName === 'model' && typeof options === 'object' && !Array.isArray(options)) {
      const brandValue = attributes.brand || '';
      return options[brandValue] || [];
    }

    return Array.isArray(options) ? options : [];
  };

  // Drag and Drop & Touch reordering handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    setDragOverIdx(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const updated = [...currentImages];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(targetIndex, 0, removed);
    setCurrentImages(updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const updated = [...currentImages];
    const [cover] = updated.splice(index, 1);
    updated.unshift(cover);
    setCurrentImages(updated);
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentImages.length) return;
    const updated = [...currentImages];
    const [item] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, item);
    setCurrentImages(updated);
  };

  const handleRemoveExistingImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  const isDirty = useMemo(() => {
    if (!listing) return false;
    if (newImages.length > 0) return true;
    if ((form.title || '') !== (listing.title || '')) return true;
    if ((form.description || '') !== (listing.description || '')) return true;
    if (String(form.price || '') !== String(listing.price || '')) return true;
    if ((form.status || 'AVAILABLE') !== (listing.status || 'AVAILABLE')) return true;
    const initialCatId = listing.category?.id || listing.category?._id || listing.categoryId || '';
    if ((form.categoryId || '') !== initialCatId) return true;
    if (Number(form.stockQuantity ?? 1) !== Number(listing.stockQuantity ?? 1)) return true;
    if (JSON.stringify(attributes) !== JSON.stringify(listing.attributes || {})) return true;
    if (JSON.stringify(currentImages) !== JSON.stringify(listing.images || [])) return true;
    return false;
  }, [listing, form, attributes, currentImages, newImages]);

  const handleSave = async () => {
    if (!isDirty) return;
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description || '');
      fd.append('price', String(form.price));
      fd.append('status', form.status);
      fd.append('categoryId', form.categoryId || listing?.category?.id || '');
      fd.append('attributes', JSON.stringify(attributes));
      fd.append('stockQuantity', String(form.stockQuantity ?? 1));
      fd.append('existingImages', JSON.stringify(currentImages));
      newImages.forEach(img => fd.append('images', img));
      await updateListing.mutateAsync({ id: id || '', fd });
      navigate('/properties');
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteListing.mutateAsync(id || '');
      setDeleteModal(false);
      navigate('/properties');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handlePost = async () => {
    setSyndicating(true);
    try {
      await post(`/api/syndication/trigger/${id}`);
      setSyndicateModal(false);
    } catch (err) {
      console.error('Post to Telegram failed:', err);
    } finally {
      setSyndicating(false);
    }
  };

  const handleNewImages = (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    setNewImages(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_: any, i: number) => i !== index));
    setNewImagePreviews(prev => prev.filter((_: any, i: number) => i !== index));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Product not found</p>
        <div style={{ marginTop: 16 }}>
          <Button variant="secondary" onClick={() => navigate('/properties')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const schemaRules = listing.category?.schemaRules || [];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Bar with Save, Post, and Delete Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/properties')}
            style={{
              padding: 8,
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-muted)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              Edit Product
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <StatusBadge status={form.status} size="sm" />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                {listing.category?.displayName || '—'} · Last updated {new Date(listing.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Save (only active on change), Post, Delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            variant="primary"
            icon={Save}
            disabled={!isDirty || updateListing.isPending}
            loading={updateListing.isPending}
            onClick={handleSave}
            style={{
              opacity: !isDirty ? 0.5 : 1,
              cursor: !isDirty ? 'not-allowed' : 'pointer',
            }}
          >
            {isDirty ? 'Save Changes' : 'Saved'}
          </Button>

          <Button variant="secondary" icon={Send} onClick={() => setSyndicateModal(true)}>
            Post
          </Button>

          <Button variant="danger" icon={Trash2} onClick={() => setDeleteModal(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Split Scrolling Layout (Details on Left, Photos on Right) */}
      <div className="product-detail-layout">
        {/* Left Column: Independently Scrollable Details */}
        <div className="product-detail-scroll-panel">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Basic Info */}
            <div className="card-padding" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="Product Title" value={form.title} onChange={(e: any) => updateForm('title', e.target.value)} />
              <Textarea label="Description" rows={3} value={form.description} onChange={(e: any) => updateForm('description', e.target.value)} />
              <div className="form-grid-2">
                <Input label="Price (ETB)" type="number" value={form.price} onChange={(e: any) => updateForm('price', e.target.value)} />
                <Select label="Status" value={form.status} onChange={(e: any) => updateForm('status', e.target.value)}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </Select>
              </div>
              <Input label="Stock Quantity" type="number" value={form.stockQuantity} onChange={(e: any) => updateForm('stockQuantity', e.target.value)} />
            </div>

            {/* Marketing, Priority & Discounts */}
            <div className="card-padding" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={16} style={{ color: '#eab308' }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  Marketing, Priority & Discounts
                </h3>
              </div>

              <div className="form-grid-2">
                <Select
                  label="Priority & Ranking"
                  value={attributes.priority || (attributes.isFeatured ? 'TOP_PRIORITY' : 'NORMAL')}
                  onChange={(e: any) => updateAttribute('priority', e.target.value)}
                >
                  <option value="NORMAL">Standard Listing</option>
                  <option value="TOP_PRIORITY">⭐ Top Priority / Top Choice (Cyan Glow)</option>
                  <option value="BEST_SELLER">🏆 Best Seller (Gold Dimlight Glow)</option>
                  <option value="HOT_DEAL">🔥 Hot Deal / Special Promo (Red Aura)</option>
                  <option value="FEATURED">✨ Featured Product</option>
                </Select>

                <Input
                  label="Original Price (ETB) - for Discount Ad"
                  type="number"
                  placeholder="e.g. 55000"
                  value={attributes.originalPrice || ''}
                  onChange={(e: any) => updateAttribute('originalPrice', e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <Input
                  label="Custom Promo Badge (optional)"
                  placeholder="e.g. Best Value, 20% OFF, Limited Edition"
                  value={attributes.badge || ''}
                  onChange={(e: any) => updateAttribute('badge', e.target.value)}
                />

                <Input
                  label="Promo Note (optional)"
                  placeholder="e.g. Free laptop bag & wireless mouse"
                  value={attributes.promoNote || ''}
                  onChange={(e: any) => updateAttribute('promoNote', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Category Fields */}
          {schemaRules.length > 0 && (
            <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  {listing.category?.displayName || 'Category'} Details
                </h3>
              </div>

              {schemaRules.map((rule: any, i: number) => {
                const fieldLabel = FIELD_LABELS[rule.field] || rule.field;
                const options = getFieldOptions(rule.field, listing.category);

                if (rule.type === 'boolean') {
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>{fieldLabel}</span>
                      <button
                        onClick={() => updateAttribute(rule.field, !attributes[rule.field])}
                        style={{
                          position: 'relative',
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          background: attributes[rule.field] ? 'var(--color-primary)' : 'var(--color-border)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'var(--transition-normal)',
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          top: 2,
                          left: attributes[rule.field] ? 22 : 2,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#fff',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'var(--transition-normal)',
                        }} />
                      </button>
                    </div>
                  );
                }

                if (options.length > 0) {
                  const currentValue = attributes[rule.field] || '';
                  const isCustom = customMode === rule.field;
                  const isOtherOption = !options.includes(currentValue) && currentValue !== '';

                  if (isCustom) {
                    return (
                      <div key={i}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
                          {fieldLabel} {rule.required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customValue.trim()) {
                                updateAttribute(rule.field, customValue.trim());
                                setCustomMode(null);
                                setCustomValue('');
                              }
                              if (e.key === 'Escape') {
                                setCustomMode(null);
                                setCustomValue('');
                              }
                            }}
                            style={{
                              flex: 1,
                              height: 44,
                              padding: '0 14px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-primary)',
                              background: 'var(--color-surface)',
                              fontSize: 14,
                              fontFamily: 'var(--font-body)',
                              color: 'var(--color-text)',
                              outline: 'none',
                              boxShadow: '0 0 0 3px rgba(24,120,180,0.15)',
                            }}
                          />
                          <button
                            onClick={() => {
                              if (customValue.trim()) {
                                updateAttribute(rule.field, customValue.trim());
                                setCustomMode(null);
                                setCustomValue('');
                              }
                            }}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 'var(--radius-md)',
                              border: 'none',
                              background: 'var(--color-primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => { setCustomMode(null); setCustomValue(''); }}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-border)',
                              background: 'var(--color-bg)',
                              color: 'var(--color-text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={i} style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
                        {fieldLabel} {rule.required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
                      </label>
                      <button
                        onClick={() => setShowFieldDropdown(showFieldDropdown === rule.field ? null : rule.field)}
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 14px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${isOtherOption ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: 'var(--color-bg)',
                          fontSize: 14,
                          fontFamily: 'var(--font-body)',
                          color: currentValue ? 'var(--color-text)' : 'var(--color-text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left',
                        }}
                      >
                        {currentValue || `Select ${fieldLabel.toLowerCase()}`}
                        <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />
                      </button>
                      {showFieldDropdown === rule.field && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: 4,
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-lg)',
                          zIndex: 50,
                          maxHeight: 220,
                          overflowY: 'auto',
                        }}>
                          {options.map((opt: string) => (
                            <button
                              key={opt}
                              onClick={() => { updateAttribute(rule.field, opt); setShowFieldDropdown(null); }}
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px 12px',
                                textAlign: 'left',
                                fontSize: 13,
                                fontFamily: 'var(--font-body)',
                                color: currentValue === opt ? 'var(--color-primary)' : 'var(--color-text)',
                                background: currentValue === opt ? 'var(--color-primary-tint)' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 4, paddingTop: 4 }}>
                            <button
                              onClick={() => { setShowFieldDropdown(null); setCustomMode(rule.field); setCustomValue(isOtherOption ? currentValue : ''); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                width: '100%',
                                padding: '10px 12px',
                                textAlign: 'left',
                                fontSize: 13,
                                fontFamily: 'var(--font-body)',
                                color: 'var(--color-primary)',
                                background: 'var(--color-primary-tint)',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              <Plus size={14} />
                              Other (type custom)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Input
                    key={i}
                    label={fieldLabel}
                    value={attributes[rule.field] || ''}
                    onChange={(e: any) => updateAttribute(rule.field, e.target.value)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Independently Scrollable Photos Sidebar */}
        <div className="product-photos-scroll-panel">
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                Product Photos ({currentImages.length + newImages.length})
              </h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: '0 0 12px', lineHeight: 1.4 }}>
              Drag images to change order. The <strong>first photo (⭐)</strong> is the product cover.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentImages.map((src: string, i: number) => {
                const isCover = i === 0;
                const isDragging = draggedIdx === i;
                const isOver = dragOverIdx === i;

                return (
                  <div
                    key={`existing-${i}-${src}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                    style={{
                      position: 'relative',
                      aspectRatio: '16/9',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: isOver
                        ? '2px solid var(--color-primary)'
                        : isCover
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      opacity: isDragging ? 0.4 : 1,
                      transform: isOver ? 'scale(1.02)' : 'none',
                      transition: 'all var(--transition-fast)',
                      cursor: 'grab',
                      boxShadow: isCover ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <img
                      src={optimizeImageUrl(src, 'detail')}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                    />

                    {/* Drag Handle Icon */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        padding: '4px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      <GripVertical size={13} />
                      {isCover ? (
                        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={11} fill="#fbbf24" /> Cover
                        </span>
                      ) : (
                        <span>#{i + 1}</span>
                      )}
                    </div>

                    {/* Quick Action Overlay (Make Cover, Move Up/Down & Remove) */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {/* Touch Move Up / Down Buttons for Mobile */}
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(i, 'up')}
                          title="Move Photo Up"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(0, 0, 0, 0.65)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ChevronUp size={14} />
                        </button>
                      )}
                      {i < currentImages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(i, 'down')}
                          title="Move Photo Down"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(0, 0, 0, 0.65)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ChevronDown size={14} />
                        </button>
                      )}
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(i)}
                          title="Set as Cover Photo"
                          style={{
                            padding: '3px 7px',
                            height: 26,
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(0, 0, 0, 0.65)',
                            backdropFilter: 'blur(4px)',
                            color: '#fbbf24',
                            border: '1px solid rgba(251, 191, 36, 0.4)',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Star size={11} />
                          <span>Cover</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(i)}
                        title="Remove Photo"
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(239, 68, 68, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {newImagePreviews.map((src, i) => (
                <div
                  key={`new-${i}`}
                  style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '2px solid var(--color-primary)',
                  }}
                >
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      padding: 4,
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={12} />
                  </button>
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    New Upload
                  </span>
                </div>
              ))}

              <label
                style={{
                  aspectRatio: '16/9',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--color-border)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)',
                }}
              >
                <Upload size={20} style={{ color: 'var(--color-text-muted)', marginBottom: 4 }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                  Add Photos
                </span>
                <input type="file" accept="image/*" multiple onChange={handleNewImages} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Product" size="sm">
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16, fontFamily: 'var(--font-body)' }}>
          Are you sure you want to delete <strong>{listing.title}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" icon={Trash2} loading={deleteListing.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <Modal open={syndicateModal} onClose={() => setSyndicateModal(false)} title="Post to Telegram" size="sm">
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16, fontFamily: 'var(--font-body)' }}>
          Post <strong>{listing.title}</strong> to your Telegram channel?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setSyndicateModal(false)}>Cancel</Button>
          <Button variant="primary" icon={Send} loading={syndicating} onClick={handlePost}>Post Now</Button>
        </div>
      </Modal>
    </div>
  );
}
