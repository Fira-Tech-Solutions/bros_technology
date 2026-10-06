import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCategories, useCreateListing } from '../hooks';
import { Button, Input, Textarea, Select } from '../components/ui';
import { ArrowLeft, Upload, X, Check, ChevronDown, Smartphone, Laptop, Headphones, Watch, Monitor, Tag, Plus, AlertTriangle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (key: string) =>
    setErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const updateForm = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    clearError(key);
  };

  const selectCategory = (cat: any) => {
    setSelectedCategory(cat);
    updateForm('categoryId', cat.id || cat._id);
    setAttributes({});
    setShowCategoryDropdown(false);
    setCategorySearch('');
  };

  const updateAttribute = (key: string, value: any) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
    clearError(key);
    clearError(`attr.${key}`);
  };

  const isPresent = (value: any) => value !== undefined && value !== null && value !== '';

  const validateStep1 = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!String(form.title ?? '').trim()) errs.title = 'Product title is required';
    if (!isPresent(form.price)) {
      errs.price = 'Price is required';
    } else if (Number.isNaN(Number(form.price)) || Number(form.price) <= 0) {
      errs.price = 'Price must be a number greater than 0';
    }
    if (!form.categoryId) errs.categoryId = 'Please select a category';
    if (!isPresent(form.stockQuantity)) {
      errs.stockQuantity = 'Stock quantity is required';
    } else if (!Number.isInteger(Number(form.stockQuantity)) || Number(form.stockQuantity) < 1) {
      errs.stockQuantity = 'Stock quantity must be a whole number of 1 or more';
    }
    const originalPrice = attributes.originalPrice;
    if (isPresent(originalPrice) && (Number.isNaN(Number(originalPrice)) || Number(originalPrice) <= 0)) {
      errs.originalPrice = 'Original price must be a number greater than 0';
    }
    return errs;
  };

  const validateStep2 = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    for (const rule of schemaRules) {
      const label = FIELD_LABELS[rule.field] || rule.field;
      const value = attributes[rule.field];
      const present = isPresent(value);
      if (rule.required && !present) {
        errs[`attr.${rule.field}`] = `${label} is required`;
        continue;
      }
      if (present && rule.type === 'number' && Number.isNaN(Number(value))) {
        errs[`attr.${rule.field}`] = `${label} must be a valid number`;
      }
    }
    return errs;
  };

  const stepOfKey = (key: string) => (key.startsWith('attr.') ? 2 : 1);

  const focusFirstError = (errs: Record<string, string>) => {
    const first = Object.keys(errs)[0];
    if (first) setStep(stepOfKey(first));
  };

  const goNext = () => {
    const errs = step === 1 ? validateStep1() : validateStep2();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(step + 1);
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

  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve) => {
      if (!file.type.startsWith('image/')) return resolve(file);
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          const ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg');
          const name = file.name.replace(/\.[^.]+$/, '') + '.' + ext;
          resolve(new File([blob], name, { type: blob.type || `image/${ext}` }));
        }, 'image/webp', 0.8);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });

  const MAX_IMAGES = 6;

  const handleImageSelect = async (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    const remaining = MAX_IMAGES - form.images.length;
    if (remaining <= 0) return;
    const capped = files.slice(0, remaining);
    const compressed = await Promise.all(capped.map(compressImage));
    const newPreviews = compressed.map(f => URL.createObjectURL(f));
    updateForm('images', [...form.images, ...compressed]);
    updateForm('imagePreviews', [...form.imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    updateForm('images', form.images.filter((_: any, i: number) => i !== index));
    updateForm('imagePreviews', form.imagePreviews.filter((_: any, i: number) => i !== index));
  };

  const handleSubmit = async (addAnother = false) => {
    setError(null);
    const allErrs = { ...validateStep1(), ...validateStep2() };
    if (Object.keys(allErrs).length > 0) {
      setErrors(allErrs);
      focusFirstError(allErrs);
      return;
    }
    setErrors({});
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

      if (addAnother) {
        // Reset form for next product but keep category
        setForm({
          title: '',
          description: '',
          price: '',
          categoryId: form.categoryId,
          stockQuantity: '1',
          images: [],
          imagePreviews: [],
        });
        setAttributes({});
        setErrors({});
        setStep(1);
      } else {
        navigate('/properties');
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.details && Array.isArray(data.details)) {
        const fieldErrs: Record<string, string> = {};
        for (const d of data.details) {
          if (!d?.field) continue;
          const label = FIELD_LABELS[d.field] || d.field;
          fieldErrs[`attr.${d.field}`] = d.message || `${label} is required`;
        }
        if (Object.keys(fieldErrs).length > 0) {
          setErrors(prev => ({ ...prev, ...fieldErrs }));
          focusFirstError(fieldErrs);
        }
        const msgs = data.details.map((d: any) => d.message).join(', ');
        setError(msgs || data.error || 'Validation failed');
      } else {
        setError(data?.error || err.message || 'Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    !categorySearch || (c.displayName || c.name || '').toLowerCase().includes(categorySearch.toLowerCase())
  );

  const schemaRules = selectedCategory?.schemaRules || [];
  const steps = ['Basic Info', 'Details', 'Images'];
  const fieldErrorStyle = { marginTop: 4, fontSize: 13, color: 'var(--color-danger)', fontFamily: 'var(--font-body)' };

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

      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', marginBottom: 20, borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fecaca', animation: 'fadeIn 0.2s ease-out' }}>
          <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#991b1b', fontFamily: 'var(--font-body)', margin: 0 }}>Validation Error</p>
            <p style={{ fontSize: 13, color: '#b91c1c', fontFamily: 'var(--font-body)', margin: '4px 0 0 0' }}>{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', padding: 2, flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="card-padding" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease-out' }}>
          <Input label="Product Title" required placeholder="e.g. iPhone 15 Pro Max 256GB" value={form.title} error={errors.title} onChange={(e: any) => updateForm('title', e.target.value)} />
          <Textarea label="Description" placeholder="Describe the product condition, features, etc." rows={4} value={form.description} onChange={(e: any) => updateForm('description', e.target.value)} />
          <div className="form-grid-2">
            <Input label="Price (ETB)" required type="number" placeholder="0" value={form.price} error={errors.price} onChange={(e: any) => updateForm('price', e.target.value)} />
            <Input
              label="Original Price (ETB) - for Discount Ad"
              type="number"
              placeholder="e.g. 50000"
              value={attributes.originalPrice || ''}
              error={errors.originalPrice}
              onChange={(e: any) => updateAttribute('originalPrice', e.target.value)}
            />
          </div>
          <div className="form-grid-2">
            <Input label="Stock Quantity" required type="number" placeholder="1" value={form.stockQuantity} error={errors.stockQuantity} onChange={(e: any) => updateForm('stockQuantity', e.target.value)} />
            <Select
              label="Marketing Priority & Ranking"
              value={attributes.priority || 'NORMAL'}
              onChange={(e: any) => updateAttribute('priority', e.target.value)}
            >
              <option value="NORMAL">Standard Listing</option>
              <option value="TOP_PRIORITY">⭐ Top Priority / Top Choice (Cyan Glow)</option>
              <option value="BEST_SELLER">🏆 Best Seller (Gold Dimlight Glow)</option>
              <option value="HOT_DEAL">🔥 Hot Deal / Special Promo (Red Aura)</option>
              <option value="FEATURED">✨ Featured Product</option>
            </Select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
              Category<span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${errors.categoryId ? 'var(--color-danger)' : 'var(--color-border)'}`,
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
            {errors.categoryId && (
              <p style={fieldErrorStyle}>{errors.categoryId}</p>
            )}
          </div>
      )}

      {step === 2 && (
        <div className="card-padding" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease-out' }}>
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
                const attrError = errors[`attr.${rule.field}`];

                if (rule.type === 'boolean') {
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: `1px solid ${attrError ? 'var(--color-danger)' : 'var(--color-border)'}` }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
                          {fieldLabel}
                          {rule.required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
                        </span>
                        <button
                          onClick={() => updateAttribute(rule.field, !attributes[rule.field])}
                          style={{
                            width: 44,
                            height: 24,
                            borderRadius: 12,
                            background: attributes[rule.field] ? 'var(--color-primary)' : 'var(--color-border)',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background var(--transition-fast)',
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: '#fff',
                              position: 'absolute',
                              top: 3,
                              left: attributes[rule.field] ? 23 : 3,
                              transition: 'left var(--transition-fast)',
                              boxShadow: 'var(--shadow-sm)',
                            }}
                          />
                        </button>
                      </div>
                      {attrError && <p style={fieldErrorStyle}>{attrError}</p>}
                    </div>
                  );
                }

                if (options.length > 0) {
                  const currentValue = attributes[rule.field] || '';
                  const isCustom = customMode === rule.field;
                  const isOtherOption = currentValue && !options.includes(currentValue);

                  if (isCustom) {
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
                            {fieldLabel}
                            {rule.required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
                          </label>
                          <button
                            onClick={() => { setCustomMode(null); }}
                            style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                          >
                            Back to options
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Input
                            placeholder={`Type custom ${fieldLabel.toLowerCase()}...`}
                            value={customValue}
                            error={attrError}
                            onChange={(e: any) => setCustomValue(e.target.value)}
                            style={{ flex: 1 }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (customValue.trim()) {
                                updateAttribute(rule.field, customValue.trim());
                              }
                              setCustomMode(null);
                            }}
                          >
                            Set
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={i} style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
                        {fieldLabel}
                        {rule.required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
                      </label>
                      <button
                        onClick={() => setShowFieldDropdown(showFieldDropdown === rule.field ? null : rule.field)}
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 14px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${attrError ? 'var(--color-danger)' : 'var(--color-border)'}`,
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
                        <span>{currentValue || `Select ${fieldLabel.toLowerCase()}`}</span>
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
                      {attrError && <p style={fieldErrorStyle}>{attrError}</p>}
                    </div>
                  );
                }

                return (
                  <Input
                    key={i}
                    label={fieldLabel}
                    required={rule.required}
                    error={attrError}
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
        <div className="card-padding" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', animation: 'fadeIn 0.2s ease-out' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12, fontFamily: 'var(--font-body)' }}>Product Photos</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
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
            {form.images.length < MAX_IMAGES && (
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
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: 12 }}>Upload up to {MAX_IMAGES} photos. First photo will be the cover.</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, gap: 12, flexWrap: 'wrap' }}>
        <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : navigate('/properties')}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        {step < 3 ? (
          <Button onClick={goNext}>Next Step</Button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button
              variant="secondary"
              loading={submitting}
              onClick={() => handleSubmit(true)}
            >
              Create & Add Another
            </Button>
            <Button
              icon={Check}
              loading={submitting}
              onClick={() => handleSubmit(false)}
            >
              Create Product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
