import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks';
import { Button, DataTable, Modal, Input, Textarea, PageHeader, EmptyState, LoadingSpinner } from '../components/ui';
import { FolderOpen, Plus, Edit, Trash2, Smartphone, Laptop, Headphones, Watch, Monitor, Tag, X, ChevronDown } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  smartphone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  watch: Watch,
  tablet: Monitor,
};

const FIELD_TYPES = ['string', 'number', 'boolean', 'select'];

export default function Categories() {
  const { data: categories = [], isLoading: loading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [modal, setModal] = useState<any>(null); // null | 'create' | category object
  const [form, setForm] = useState({ name: '', displayName: '', description: '', icon: 'smartphone', schemaRules: [] as any[] });
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [newRuleField, setNewRuleField] = useState('');
  const [newRuleType, setNewRuleType] = useState('string');
  const [newRuleRequired, setNewRuleRequired] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const openCreate = () => {
    setForm({ name: '', displayName: '', description: '', icon: 'smartphone', schemaRules: [] });
    setModal('create');
  };

  const openEdit = (cat: any) => {
    setForm({
      name: cat.name || '',
      displayName: cat.displayName || '',
      description: cat.description || '',
      icon: cat.icon || 'smartphone',
      schemaRules: (cat.schemaRules || []).map((r: any) => ({ ...r })),
    });
    setModal(cat);
  };

  const addRule = () => {
    if (!newRuleField.trim()) return;
    setForm(prev => ({
      ...prev,
      schemaRules: [...prev.schemaRules, { field: newRuleField.trim(), type: newRuleType, required: newRuleRequired }],
    }));
    setNewRuleField('');
    setNewRuleType('string');
    setNewRuleRequired(false);
  };

  const removeRule = (index: number) => {
    setForm(prev => ({
      ...prev,
      schemaRules: prev.schemaRules.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Category name is required'); return; }
    if (!form.displayName.trim()) { alert('Display name is required'); return; }
    try {
      const payload = {
        name: form.name.trim(),
        displayName: form.displayName.trim(),
        description: form.description.trim(),
        icon: form.icon,
        schemaRules: form.schemaRules,
      };
      if (modal === 'create') {
        await createCategory.mutateAsync(payload);
      } else {
        const catId = modal.id || modal._id;
        await updateCategory.mutateAsync({ id: catId, data: payload });
      }
      setModal(null);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const catId = deleteModal.id || deleteModal._id;
      await deleteCategory.mutateAsync(catId);
      setDeleteModal(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const columns = [
    {
      header: 'Category',
      render: (row: any) => {
        const Icon = ICON_MAP[row.icon] || FolderOpen;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)', margin: 0 }}>{row.displayName || row.name}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>{row.name}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Fields',
      render: (row: any) => (
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
          {row.schemaRules?.length || 0} fields
        </span>
      ),
    },
    {
      header: 'Products',
      render: (row: any) => (
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>{row.listingCount || 0}</span>
      ),
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e: any) => e.stopPropagation()}>
          <button
            onClick={() => openEdit(row)}
            style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)' }}
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => setDeleteModal(row)}
            style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} product categories`}
        action={<Button icon={Plus} onClick={openCreate}>Add Category</Button>}
      />

      <DataTable columns={columns} data={categories} emptyMessage="No categories found" emptyIcon={FolderOpen} />

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add Category' : 'Edit Category'}
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="sm\:grid-2" style={{ display: 'grid', gap: 16 }}>
            <Input
              label="Category Name"
              placeholder="e.g. PHONES_TABLETS"
              value={form.name}
              onChange={(e: any) => setForm(p => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="Display Name"
              placeholder="e.g. Phones & Tablets"
              value={form.displayName}
              onChange={(e: any) => setForm(p => ({ ...p, displayName: e.target.value }))}
            />
          </div>
          <Textarea
            label="Description"
            placeholder="Optional description"
            rows={2}
            value={form.description}
            onChange={(e: any) => setForm(p => ({ ...p, description: e.target.value }))}
          />

          {/* Icon Selection */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>Icon</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(ICON_MAP).map(([key, Icon]) => (
                <button
                  key={key}
                  onClick={() => setForm(p => ({ ...p, icon: key }))}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${form.icon === key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: form.icon === key ? 'var(--color-primary-tint)' : 'var(--color-bg)',
                    color: form.icon === key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Schema Rules Editor */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>Category Fields (Schema Rules)</label>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
              Define custom fields for products in this category
            </p>

            {/* Existing Rules */}
            {form.schemaRules.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {form.schemaRules.map((rule: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <Tag size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)', flex: 1 }}>
                      {rule.field}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--color-primary-tint)',
                      color: 'var(--color-primary)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      {rule.type}
                    </span>
                    {rule.required && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'var(--color-danger-tint)',
                        color: 'var(--color-danger)',
                        fontFamily: 'var(--font-body)',
                      }}>
                        Required
                      </span>
                    )}
                    <button
                      onClick={() => removeRule(i)}
                      style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Rule */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label=""
                  placeholder="Field name (e.g. brand, model)"
                  value={newRuleField}
                  onChange={(e: any) => setNewRuleField(e.target.value)}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  style={{
                    height: 44,
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)',
                    fontSize: 13,
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {newRuleType} <ChevronDown size={14} />
                </button>
                {showTypeDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 50,
                    overflow: 'hidden',
                    minWidth: 120,
                  }}>
                    {FIELD_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => { setNewRuleType(t); setShowTypeDropdown(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontSize: 13,
                          fontFamily: 'var(--font-body)',
                          color: newRuleType === t ? 'var(--color-primary)' : 'var(--color-text)',
                          background: newRuleType === t ? 'var(--color-primary-tint)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setNewRuleRequired(!newRuleRequired)}
                style={{
                  height: 44,
                  padding: '0 12px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${newRuleRequired ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  background: newRuleRequired ? 'var(--color-danger-tint)' : 'var(--color-bg)',
                  fontSize: 12,
                  fontFamily: 'var(--font-body)',
                  color: newRuleRequired ? 'var(--color-danger)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {newRuleRequired ? 'Required' : 'Optional'}
              </button>
              <button
                onClick={addRule}
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
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button loading={createCategory.isPending || updateCategory.isPending} onClick={handleSave}>
            {modal === 'create' ? 'Create' : 'Save'}
          </Button>
        </div>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Category" size="sm">
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16, fontFamily: 'var(--font-body)' }}>
          Delete <strong>{deleteModal?.displayName || deleteModal?.name}</strong>? Products in this category will not be deleted.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" icon={Trash2} loading={deleteCategory.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
