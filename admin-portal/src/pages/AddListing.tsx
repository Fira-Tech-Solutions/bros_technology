import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCategories, useCreateListing } from '../hooks';
import { Button, Input, Select, Textarea, PageHeader, LoadingSpinner } from '../components/ui';
import { ArrowLeft, Upload, X, Check, ChevronDown, Smartphone, Laptop, Headphones, Watch, Monitor, Tag, Plus } from 'lucide-react';
import { PRODUCT_OPTIONS, FIELD_LABELS } from '../config/productOptions';

const ICON_MAP: Record<string, any> = {
  smartphone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  watch: Watch,
  tablet: Monitor,
};

export default function AddListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const { data: categories = [] } = useCategories();
  const createListing = useCreateListing();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [form, setForm] = useState<Record<string, any>>({
    title: '', description: '', price: '', categoryId: '', stockQuantity: '1',
    images: [], imagePreviews: [],
  });
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [showFieldDropdown, setShowFieldDropdown] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState('');

  const updateForm = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const selectCategory = (cat: any) => {
    setSelectedCategory(cat);
    updateForm('categoryId', cat.id || cat._id);
    setAttributes({});
    setShowCategoryDropdown(false);
    setCategorySearch('');
  };

  const updateAttribute = (key: string, value: any) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  };

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

  const handleImageSelect = (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    const newPreviews = files.map(f => URL.createObjectURL(f));
    updateForm('images', [...form.images, ...files]);
    updateForm('imagePreviews', [...form.imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    updateForm('images', form.images.filter((_: any, i: number) => i !== index));
    updateForm('imagePreviews', form.imagePreviews.filter((_: any, i: number) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description || '');
      fd.append('price', form.price);
      fd.append('categoryId', form.categoryId);
      fd.append('agentId', user?.id || '');
      fd.append('status', 'AVAILABLE');
      fd.append('attributes', JSON.stringify(attributes));
      fd.append('stockQuantity', form.stockQuantity || '1');
      form.images.forEach((img: any) => fd.append('images', img));
      await createListing.mutateAsync(fd);
      navigate('/properties');
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const filteredCategories = categories.filter(c =>
    !categorySearch || (c.displayName || c.name || '').toLowerCase().includes(categorySearch.toLowerCase())
  );

  const schemaRules = selectedCategory?.schemaRules || [];
  const steps = ['Basic Info', 'Details', 'Images'];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/properties')}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-text)', lineHeight: 1.2 }}>Add New Product</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: 2 }}>Step {step} of 3 — {steps[step - 1]}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i + 1 <= step ? 'var(--color-primary)' : 'var(--color-border)', transition: 'background 0.3s ease' }} />
        ))}
      </div>

      {step === 1 && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', padding: 28, display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease-out' }}>
          <Input label="Product Title" placeholder="e.g. iPhone 15 Pro Max 256GB" value={form.title} onChange={(e: any) => updateForm('title', e.target.value)} />
          <Textarea label="Description" placeholder="Describe the product condition, features, etc." rows={4} value={form.description} onChange={(e: any) => updateForm('description', e.target.value)} />
          <Input label="Price (ETB)" type="number" placeholder="0" value={form.price} onChange={(e: any) => updateForm('price', e.target.value)} />
          <Input label="Stock Quantity" type="number" placeholder="1" value={form.stockQuantity} onChange={(e: any) => updateForm('stockQuantity', e.target.value)} />

          {/* Category Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Category</label>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  fontSize: 14,
                  fontFamily: 'var(--font-body)',
                  color: selectedCategory ? 'var(--color-text)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                {selectedCategory ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {(() => { const Icon = ICON_MAP[selectedCategory.icon] || Tag; return <Icon size={16} style={{ color: 'var(--color-primary)' }} />; })()}
                    <span>{selectedCategory.displayName || selectedCategory.name}</span>
                  </div>
                ) : 'Select category'}
                <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>
              {showCategoryDropdown && (
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
                  maxHeight: 280,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <div style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      style={{
                        width: '100%',
                        height: 36,
                        padding: '0 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                        fontSize: 13,
                        fontFamily: 'var(--font-body)',
                        color: 'var(--color-text)',
                        outline: 'none',
                        boxSizing: 'border-box' as const,
                      }}
                    />
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: 220 }}>
                    {filteredCategories.map((c: any) => {
                      const Icon = ICON_MAP[c.icon] || Tag;
                      return (
                        <button
                          key={c.id || c._id}
                          onClick={() => selectCategory(c)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            width: '100%',
                            padding: '10px 12px',
                            border: 'none',
                            background: selectedCategory?.id === c.id ? 'var(--color-primary-tint)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <Icon size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)', margin: 0 }}>{c.displayName || c.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>{c.listingCount || 0} products</p>
                          </div>
                          {selectedCategory?.id === c.id && <Check size={14} style={{ color: 'var(--color-primary)' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', padding: 28, display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Tag size={16} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {selectedCategory?.displayName || selectedCategory?.name || 'Category'} Details
            </h3>
          </div>

          {schemaRules.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textAlign: 'center', padding: 24 }}>
              No additional fields for this category
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {schemaRules.map((rule: any, i: number) => {
                const fieldLabel = FIELD_LABELS[rule.field] || rule.field;
                const options = getFieldOptions(rule.field, selectedCategory);

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
      )}

      {step === 3 && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', padding: 28, animation: 'fadeIn 0.2s ease-out' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12, fontFamily: 'var(--font-body)' }}>Product Photos</label>
          <div className="sm\:grid-3" style={{ display: 'grid', gap: 12 }}>
            {form.imagePreviews.map((src: string, i: number) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {i === 0 && (
                  <span style={{ position: 'absolute', top: 6, left: 6, padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary)', color: '#fff', fontSize: 11, fontWeight: 600 }}>
                    Cover
                  </span>
                )}
                <button
                  onClick={() => removeImage(i)}
                  style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 6, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label
              style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-md)',
                border: '2px dashed var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)',
                gap: 6,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
            >
              <Upload size={24} style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Add Photo</span>
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} />
            </label>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: 12 }}>Upload up to 10 photos. First photo will be the cover.</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
        <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : navigate('/properties')}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}>Next Step</Button>
        ) : (
          <Button icon={Check} loading={submitting} onClick={handleSubmit} disabled={!form.title || !form.price || !form.categoryId}>
            Create Product
          </Button>
        )}
      </div>
    </div>
  );
}
