import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { put } from '../lib/api';
import { Button, Input, PageHeader, LoadingSpinner } from '../components/ui';
import { User, Save, ArrowLeft } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await put('/api/auth/me', form);
      const userData = res.data?.data?.user || res.data?.user || res.data?.data;
      if (userData) updateUser(userData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: 8, borderRadius: 'var(--radius-xl)', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader
          title="Profile"
          subtitle="Manage your account details"
          action={
            <Button icon={Save} loading={saving} onClick={handleSave}>
              {saved ? 'Saved!' : 'Save'}
            </Button>
          }
        />
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={28} style={{ color: 'var(--color-primary)' }} />
            )}
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {user?.firstName || user?.name || 'Admin'}
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input
            label="First Name"
            value={form.firstName}
            onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))}
          />
          <Input
            label="Last Name"
            value={form.lastName}
            onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))}
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
        />
      </div>
    </div>
  );
}
