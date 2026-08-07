import { useState, useEffect } from 'react';
import { get, post, del } from '../lib/api';
import { Button, DataTable, StatusBadge, Modal, Input, PageHeader, LoadingSpinner } from '../components/ui';
import { Send, Settings, RefreshCw, ExternalLink, RotateCcw, Trash2, Webhook } from 'lucide-react';

export default function Syndication() {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(null);
  const [setupModal, setSetupModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookInfo, setWebhookInfo] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [configRes, logsRes] = await Promise.all([
        get('/api/syndication/config'),
        get('/api/syndication/logs', { params: { limit: 50 } }),
      ]);
        const configs = configRes.data?.data || configRes.data || [];
        setConfig(Array.isArray(configs) ? configs.find((c: any) => c.platform === 'TELEGRAM') || configs[0] : configs);
      const logsRaw = logsRes.data?.logs || logsRes.data?.data || logsRes.data || [];
      setLogs(Array.isArray(logsRaw) ? logsRaw : []);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWebhookInfo = async () => {
    try {
      const res = await get('/api/syndication/telegram/webhook-info');
          setWebhookInfo(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load webhook info:', err);
    }
  };

  const handleSetupWebhook = async () => {
    setSaving(true);
    try {
      await post('/api/syndication/telegram/setup-webhook', { webhookUrl });
      setSetupModal(false);
      loadWebhookInfo();
    } catch (err) {
      console.error('Webhook setup failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = async (log) => {
    setRetrying(log._id);
    try {
      await post(`/api/syndication/retry/${log._id}`);
      loadAll();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setRetrying(null);
    }
  };

  const handleDeleteMessage = async (log) => {
    try {
      await post(`/api/syndication/delete-message/${log.telegramMessageId}`, { logId: log._id });
      loadAll();
    } catch (err) {
      console.error('Delete message failed:', err);
    }
  };

  const configColumns = [
    {
      header: 'Setting',
      render: (row) => (
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>{row.key || row.setting || '—'}</span>
      ),
    },
    {
      header: 'Value',
      render: (row) => (
        <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{row.value || '—'}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <StatusBadge status={row.isActive ? 'SUCCESS' : 'ARCHIVED'} />
      ),
    },
  ];

  const logColumns = [
    {
      header: 'Product',
      render: (row) => (
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)', margin: 0 }}>{row.listing?.title || row.listingTitle || '—'}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>{row.action || row.type || 'NEW_POST'}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Message ID',
      render: (row) => (
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
          {row.telegramMessageId ? `#${row.telegramMessageId}` : '—'}
        </span>
      ),
    },
    {
      header: 'Time',
      render: (row) => (
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>{new Date(row.createdAt).toLocaleString()}</span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          {row.status === 'FAILED' && (
            <button
              onClick={() => handleRetry(row)}
              disabled={retrying === row._id}
              style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)', opacity: retrying === row._id ? 0.5 : 1 }}
              title="Retry"
            >
              <RotateCcw size={15} style={retrying === row._id ? { animation: 'spin 1s linear infinite' } : {}} />
            </button>
          )}
          {row.telegramMessageId && (
            <button
              onClick={() => handleDeleteMessage(row)}
              style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)' }}
              title="Delete from Telegram"
            >
              <Trash2 size={15} />
            </button>
          )}
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
        title="Telegram Syndication"
        subtitle="Configure and monitor Telegram channel posting"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" icon={RefreshCw} onClick={loadAll}>Refresh</Button>
            <Button variant="secondary" icon={Webhook} onClick={() => { setSetupModal(true); loadWebhookInfo(); }}>
              Webhook
            </Button>
          </div>
        }
      />

      <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 4, border: '1px solid var(--color-border)', width: 'fit-content' }}>
        {['config', 'logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              background: activeTab === tab ? 'var(--color-surface)' : 'transparent',
              color: activeTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            {tab === 'config' ? 'Configuration' : `Post Logs (${logs.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'config' ? (
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(34,158,217,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={20} style={{ color: '#229ED9' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>Telegram Bot</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>Send products to your channel automatically</p>
            </div>
          </div>

          {config ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Channel</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)', margin: 0 }}>{config.channelId || config.telegramChannelId || '—'}</p>
                </div>
                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Bot Token</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'monospace', margin: 0 }}>
                    {config.botToken ? `${config.botToken.slice(0, 10)}••••` : '—'}
                  </p>
                </div>
              </div>
              <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Status</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: config.isActive !== false ? 'var(--color-success)' : 'var(--color-text-muted)' }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
                    {config.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 12, fontFamily: 'var(--font-body)' }}>No Telegram configuration found</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Configure via the mobile app or API</p>
            </div>
          )}
        </div>
      ) : (
        <DataTable columns={logColumns} data={logs} emptyMessage="No syndication logs" emptyIcon={Send} pageSize={15} />
      )}

      <Modal open={setupModal} onClose={() => setSetupModal(false)} title="Setup Telegram Webhook" size="md">
        {webhookInfo && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Current Webhook URL</p>
            <p style={{ fontSize: 14, fontFamily: 'monospace', color: 'var(--color-text)', wordBreak: 'break-all', margin: 0 }}>{webhookInfo.url || 'Not set'}</p>
          </div>
        )}
        <Input
          label="Webhook URL"
          placeholder="https://your-domain.com/api/webhook/telegram"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <Button variant="secondary" onClick={() => setSetupModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSetupWebhook} disabled={!webhookUrl}>Set Webhook</Button>
        </div>
      </Modal>
    </div>
  );
}
