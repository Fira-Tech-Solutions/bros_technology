import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function ContactSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get('/api/settings').then(({ data }) => {
      setSettings(data.data || data || {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/settings', settings);
      alert('Settings saved!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const fields = [
    { section: 'Contact Information', items: [
      { key: 'shopName', label: 'Shop Name' },
      { key: 'email', label: 'Email' },
      { key: 'whatsappNumber', label: 'WhatsApp' },
      { key: 'callNumber1', label: 'Primary Phone' },
      { key: 'callNumber2', label: 'Secondary Phone' },
      { key: 'telegramHandle', label: 'Telegram Handle' },
    ]},
    { section: 'Business Details', items: [
      { key: 'location', label: 'Location' },
      { key: 'googleMapsUrl', label: 'Google Maps URL' },
      { key: 'businessHours', label: 'Business Hours' },
    ]},
    { section: 'Social Media', items: [
      { key: 'facebookUrl', label: 'Facebook URL' },
      { key: 'instagramUrl', label: 'Instagram URL' },
      { key: 'tiktokUrl', label: 'TikTok URL' },
      { key: 'youtubeUrl', label: 'YouTube URL' },
    ]},
  ];

  if (loading) return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 bg-bg-tertiary rounded-xl animate-shimmer" />)}</div>;

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      <button onClick={() => navigate('/settings')} className="flex items-center gap-2 text-text-muted hover:text-text transition-colors">
        <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Back</span>
      </button>
      <h1 className="text-2xl font-bold text-text">Contact Settings</h1>

      {fields.map((group) => (
        <div key={group.section} className="bg-bg-card border border-border rounded-2xl overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-widest text-text-muted font-semibold">{group.section}</p>
          <div className="px-4 pb-4 space-y-3">
            {group.items.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-text-secondary mb-1 block">{field.label}</label>
                <input value={settings[field.key] || ''} onChange={(e) => update(field.key, e.target.value)} className="w-full bg-input border border-input-border rounded-xl px-4 h-11 text-sm text-text outline-none focus:border-brand" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-full bg-brand text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-dark disabled:opacity-50 transition-all">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Settings</>}
      </button>
    </div>
  );
}
