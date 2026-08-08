import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, put } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Textarea, LoadingSpinner } from '../components/ui';
import { ChevronRight, Sun, Moon, Globe, Store, Phone, Mail, MapPin, ExternalLink, Info, LogOut, Save } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { dark, toggle: toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await get('/api/settings');
        setSettings(res.data?.data || res.data?.settings || res.data || {});
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await put('/api/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'am', label: 'አማርኛ' },
    { code: 'or', label: 'Afaan Oromoo' },
  ];

  const currentLanguage = languages.find(l => l.code === language)?.label || 'English';

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div style={{ maxWidth: 768, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', letterSpacing: -0.5, margin: 0 }}>Settings</h1>

      {/* Profile Card */}
      {user && (
        <div
          onClick={() => navigate('/profile')}
          style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'var(--transition-fast)' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {user.profileImage ? (
              <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
                {(user.firstName || user.name || 'A').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>{user.firstName || user.name || 'Admin'}</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>{user.email || ''}</p>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
        </div>
      )}

      {/* Appearance */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 12px 0' }}>Appearance</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {dark ? <Moon size={18} style={{ color: 'var(--color-primary)' }} /> : <Sun size={18} style={{ color: 'var(--color-primary)' }} />}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>{dark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <button
            onClick={toggleTheme}
            style={{ position: 'relative', width: 44, height: 24, borderRadius: 12, background: dark ? 'var(--color-primary)' : 'var(--color-border)', border: 'none', cursor: 'pointer', transition: 'var(--transition-normal)' }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: dark ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition-normal)',
              }}
            />
          </button>
        </div>
      </div>

      {/* Language */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 12px 0' }}>Language</p>
        <button
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Globe size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>{currentLanguage}</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--color-text-muted)', transition: 'transform 0.2s', transform: showLanguageDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {showLanguageDropdown && (
          <div style={{ marginTop: 12, borderTop: '1px solid var(--color-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setShowLanguageDropdown(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: language === lang.code ? 'var(--color-primary-tint)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: language === lang.code ? 600 : 400, color: language === lang.code ? 'var(--color-primary)' : 'var(--color-text)', fontFamily: 'var(--font-body)' }}>{lang.label}</span>
                {language === lang.code && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Store (Contact & Social Media) */}
      {user?.role === 'SUPER_ADMIN' && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 12px 0' }}>Store</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Phone size={18} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>Contact & Social Media</span>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
            </div>

            {/* Contact Settings */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="sm\:grid-2" style={{ display: 'grid', gap: 12 }}>
                <Input
                  label="Store Name"
                  value={settings.siteName || ''}
                  onChange={(e: any) => updateSetting('siteName', e.target.value)}
                />
                <Input
                  label="WhatsApp"
                  icon={Phone}
                  value={settings.whatsappNumber || ''}
                  onChange={(e: any) => updateSetting('whatsappNumber', e.target.value)}
                />
                <Input
                  label="Call Number 1"
                  icon={Phone}
                  value={settings.callNumber1 || ''}
                  onChange={(e: any) => updateSetting('callNumber1', e.target.value)}
                />
                <Input
                  label="Call Number 2"
                  icon={Phone}
                  value={settings.callNumber2 || ''}
                  onChange={(e: any) => updateSetting('callNumber2', e.target.value)}
                />
                <Input
                  label="Email"
                  icon={Mail}
                  value={settings.contactEmail || ''}
                  onChange={(e: any) => updateSetting('contactEmail', e.target.value)}
                />
                <Input
                  label="Location"
                  icon={MapPin}
                  value={settings.location || ''}
                  onChange={(e: any) => updateSetting('location', e.target.value)}
                />
                <Input
                  label="Telegram"
                  placeholder="@channel"
                  value={settings.telegramHandle || ''}
                  onChange={(e: any) => updateSetting('telegramHandle', e.target.value)}
                />
                <Input
                  label="Admin Telegram"
                  placeholder="@username"
                  value={settings.adminTelegramUsername || ''}
                  onChange={(e: any) => updateSetting('adminTelegramUsername', e.target.value)}
                />
              </div>
              <Input
                label="Business Hours"
                value={settings.businessHours || ''}
                onChange={(e: any) => updateSetting('businessHours', e.target.value)}
              />
              <Input
                label="Google Maps URL"
                icon={MapPin}
                value={settings.shopGoogleMapUrl || ''}
                onChange={(e: any) => updateSetting('shopGoogleMapUrl', e.target.value)}
              />
              <Input
                label="Map Address"
                icon={MapPin}
                value={settings.shopMapAddress || ''}
                onChange={(e: any) => updateSetting('shopMapAddress', e.target.value)}
              />
              <Input
                label="Mini App URL"
                icon={ExternalLink}
                value={settings.miniAppUrl || ''}
                onChange={(e: any) => updateSetting('miniAppUrl', e.target.value)}
              />

              {/* Social Media */}
              <div className="sm\:grid-2" style={{ display: 'grid', gap: 12 }}>
                <Input
                  label="Facebook"
                  placeholder="Page URL"
                  value={settings.facebookUrl || ''}
                  onChange={(e: any) => updateSetting('facebookUrl', e.target.value)}
                />
                <Input
                  label="Instagram"
                  placeholder="@username"
                  value={settings.instagramUrl || ''}
                  onChange={(e: any) => updateSetting('instagramUrl', e.target.value)}
                />
                <Input
                  label="TikTok"
                  placeholder="@username"
                  value={settings.tiktokUrl || ''}
                  onChange={(e: any) => updateSetting('tiktokUrl', e.target.value)}
                />
                <Input
                  label="YouTube"
                  placeholder="@channel"
                  value={settings.youtubeUrl || ''}
                  onChange={(e: any) => updateSetting('youtubeUrl', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button icon={Save} loading={saving} onClick={handleSave}>
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 12px 0' }}>About</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Info size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>Version 1.0.0</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          background: 'rgba(239, 68, 68, 0.06)',
          color: '#ef4444',
          fontSize: 14,
          fontWeight: 500,
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          transition: 'var(--transition-fast)',
        }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
