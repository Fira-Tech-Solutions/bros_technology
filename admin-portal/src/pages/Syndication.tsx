import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSyndicationConfig, useSyndicationLogs, useWebhookInfo, useSaveSyndicationConfig, useRetrySyndication, useDeleteSyndicationMessage, useEditSyndicationMessage } from '../hooks';
import { Button, StatusBadge, Modal, Input, PageHeader, LoadingSpinner } from '../components/ui';
import { Send, Settings, RefreshCw, Trash2, Save, Eye, EyeOff, Power, MessageCircle, ChevronRight, Clock, CircleCheck, CircleX, Image as ImageIcon, Bot, Hash, X } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  PENDING: { label: 'Pending', color: '#F59E0B', bg: '#F59E0B18', Icon: Clock },
  SUCCESS: { label: 'Success', color: '#22C55E', bg: '#22C55E18', Icon: CircleCheck },
  FAILED: { label: 'Failed', color: '#EF4444', bg: '#EF444418', Icon: CircleX },
};

const ACTION_MAP: Record<string, { label: string; color: string; bg: string }> = {
  NEW_POST: { label: 'New Post', color: '#3b82f6', bg: '#3b82f618' },
  EDITED: { label: 'Edited', color: '#a855f7', bg: '#a855f718' },
  DELETED: { label: 'Deleted', color: '#ef4444', bg: '#ef444418' },
};

const FILTER_OPTIONS = [
  { key: null, label: 'All' },
  { key: 'SUCCESS', label: 'Successful' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'FAILED', label: 'Failed' },
];

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Syndication() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'settings' | 'posts'>(isAdmin ? 'settings' : 'posts');
  const { data: config, isLoading: configLoading } = useSyndicationConfig();
  const { data: logs = [], isLoading: logsLoading } = useSyndicationLogs();
  const { data: webhookInfo } = useWebhookInfo();
  const saveConfig = useSaveSyndicationConfig();
  const retryMutation = useRetrySyndication();
  const deleteMsg = useDeleteSyndicationMessage();
  const editMsg = useEditSyndicationMessage();
  const [filter, setFilter] = useState<string | null>(null);
  const [configModal, setConfigModal] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [detailModal, setDetailModal] = useState<any>(null);
  const [editCaption, setEditCaption] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (config) {
      setBotToken(config.botToken || '');
      setChannelId(config.channelId || config.telegramChannelId || '');
      setIsActive(config.isActive !== false);
    }
  }, [config]);

  const handleSaveConfig = async () => {
    if (!botToken.trim()) { alert('Bot token is required'); return; }
    if (!channelId.trim()) { alert('Channel ID is required'); return; }
    try {
      await saveConfig.mutateAsync({
        platform: 'TELEGRAM',
        botToken: botToken.trim(),
        channelId: channelId.trim(),
        isActive,
      });
      setConfigModal(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      // Just refetch the webhook info
      await queryClient.invalidateQueries({ queryKey: ['webhookInfo'] });
      const info = webhookInfo;
      if (info?.botInfo) {
        alert(`Connected! Bot: @${info.botInfo.username || info.botInfo.first_name}`);
      } else {
        alert('Connection test completed');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!filter) return logs;
    return logs.filter(l => l.status === filter);
  }, [logs, filter]);

  const handleRetry = async (log: any) => {
    try {
      await retryMutation.mutateAsync(log.id || log._id);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Retry failed');
    }
  };

  const handleDeleteMessage = async (log: any) => {
    const msgId = log.telegramMessageId || log.messageId;
    if (!msgId) { alert('No message ID found for this post'); return; }
    if (!confirm('Delete this post from Telegram?')) return;
    try {
      await deleteMsg.mutateAsync({ msgId, logId: log.id || log._id });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleSaveEdit = async () => {
    if (!detailModal?.messageId) return;
    try {
      await editMsg.mutateAsync({ messageId: detailModal.messageId, caption: editCaption });
      setDetailModal(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  const openDetail = (log: any) => {
    setDetailModal(log);
    setEditCaption(log.listing?.title || '');
  };

  if (configLoading || logsLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title="Syndication"
        subtitle="Configure and monitor Telegram channel posting"
      />

      {/* Tabs */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 4, border: '1px solid var(--color-border)', width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              background: activeTab === 'settings' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'settings' ? '#fff' : 'var(--color-text-muted)',
              border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)',
            }}
          >
            <Settings size={14} /> Settings
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              background: activeTab === 'posts' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'posts' ? '#fff' : 'var(--color-text-muted)',
              border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)',
            }}
          >
            <MessageCircle size={14} /> Posts ({logs.length})
          </button>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
          {/* Bot Info Card */}
          {webhookInfo?.botInfo && (
            <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg)' }}>
                <Bot size={28} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>{webhookInfo?.botInfo?.first_name || 'Bot'}</p>
                <p style={{ fontSize: 13, color: 'var(--color-primary)', fontFamily: 'var(--font-body)', margin: 0 }}>@{webhookInfo?.botInfo?.username || '—'}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0, marginTop: 4 }}>
                  ID: {webhookInfo?.botInfo?.id} · {webhookInfo?.botInfo?.can_join_groups ? 'Can join groups' : 'Private'}
                </p>
              </div>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            </div>
          )}

          {/* Channel Info Card */}
          {webhookInfo?.channelInfo && (
            <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg)' }}>
                <Send size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>{webhookInfo?.channelInfo?.title || 'Channel'}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
                  {webhookInfo?.channelInfo?.type || 'channel'}{webhookInfo?.channelInfo?.memberCount ? ` · ${webhookInfo.channelInfo.memberCount} members` : ''}
                </p>
                {webhookInfo?.channelInfo?.username && (
                  <p style={{ fontSize: 12, color: 'var(--color-primary)', fontFamily: 'var(--font-body)', margin: 0 }}>@{webhookInfo.channelInfo.username}</p>
                )}
              </div>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            </div>
          )}

          {/* Configuration Button */}
          <button
            onClick={() => setConfigModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, width: '100%',
              padding: 16, borderRadius: 'var(--radius-lg)',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              cursor: 'pointer', textAlign: 'left', transition: 'var(--transition-fast)',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(24,120,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Settings size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', margin: 0 }}>Configuration</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>Bot token, channel, status</p>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTER_OPTIONS.map(f => (
              <button
                key={f.label}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
                  background: filter === f.key ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: filter === f.key ? '#fff' : 'var(--color-text-muted)',
                  border: `1px solid ${filter === f.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  cursor: 'pointer', transition: 'var(--transition-fast)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Posts List */}
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <MessageCircle size={40} style={{ color: 'var(--color-border)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>No posts found</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>
                {filter ? `No ${filter.toLowerCase()} posts` : 'Posts will appear here after syndication'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredLogs.map((log, i) => {
                const status = STATUS_MAP[log.status] || STATUS_MAP.PENDING;
                const action = ACTION_MAP[log.action] || ACTION_MAP.NEW_POST;
                const StatusIcon = status.Icon;
                return (
                  <div
                    key={log.id || log._id || i}
                    onClick={() => openDetail(log)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: 14, borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      cursor: 'pointer', transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  >
                    {/* Thumbnail */}
                    <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {log.listing?.images?.[0] ? (
                        <img src={log.listing.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={20} style={{ color: 'var(--color-text-muted)' }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-body)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.listing?.title || log.listingTitle || 'Unknown listing'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0, marginTop: 2 }}>
                        {log.listing?.city || ''}{log.listing?.city && log.listing?.neighborhood ? ', ' : ''}{log.listing?.neighborhood || ''}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)', color: status.color, background: status.bg }}>
                          <StatusIcon size={12} /> {status.label}
                        </span>
                        {log.action && action && (
                          <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)', color: action.color, background: action.bg }}>
                            {action.label}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                          {formatDate(log.runAt || log.createdAt)}
                        </span>
                      </div>
                      {log.errorMessage && (
                        <p style={{ fontSize: 11, color: 'var(--color-danger)', fontFamily: 'var(--font-body)', margin: 0, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.errorMessage}
                        </p>
                      )}
                    </div>

                    <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Configuration Modal */}
      <Modal open={configModal} onClose={() => setConfigModal(false)} title="Configuration" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Bot Token</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <Key size={16} />
              </div>
              <input
                type={showToken ? 'text' : 'password'}
                placeholder="123456:ABC-DEF..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                style={{
                  width: '100%', height: 48, padding: '0 44px 0 42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  fontSize: 14, fontFamily: 'monospace', color: 'var(--color-text)',
                  outline: 'none', boxSizing: 'border-box' as const,
                }}
              />
              <button
                onClick={() => setShowToken(!showToken)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Channel / Group ID</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <Hash size={16} />
              </div>
              <input
                type="text"
                placeholder="-1001234567890"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                style={{
                  width: '100%', height: 48, padding: '0 14px 0 42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  fontSize: 14, fontFamily: 'monospace', color: 'var(--color-text)',
                  outline: 'none', boxSizing: 'border-box' as const,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Power size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>Active</span>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              style={{
                position: 'relative', width: 44, height: 24, borderRadius: 12,
                background: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                border: 'none', cursor: 'pointer', transition: 'var(--transition-normal)',
              }}
            >
              <span style={{
                position: 'absolute', top: 2, left: isActive ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition-normal)',
              }} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              style={{
                flex: 1, height: 48, borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                color: 'var(--color-text)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: testing ? 0.6 : 1,
              }}
            >
              {testing ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
              Test
            </button>
            <button
              onClick={handleSaveConfig}
              disabled={saveConfig.isPending}
              style={{
                flex: 2, height: 48, borderRadius: 'var(--radius-md)',
                border: 'none', background: 'var(--color-primary)',
                fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: saveConfig.isPending ? 0.6 : 1,
              }}
            >
              {saveConfig.isPending ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              Save Config
            </button>
          </div>
        </div>
      </Modal>

      {/* Post Detail Modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Post Details" size="md">
        {detailModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Listing Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {detailModal.listing?.images?.[0] ? (
                  <img src={detailModal.listing.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={24} style={{ color: 'var(--color-text-muted)' }} />
                )}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-body)', margin: 0 }}>
                  {detailModal.listing?.title || 'Unknown listing'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0, marginTop: 2 }}>
                  {detailModal.listing?.city || ''}{detailModal.listing?.city && detailModal.listing?.neighborhood ? ', ' : ''}{detailModal.listing?.neighborhood || ''}
                </p>
                {detailModal.listing?.price && (
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-body)', margin: 0, marginTop: 4 }}>
                    {detailModal.listing.price.toLocaleString()} ETB
                  </p>
                )}
              </div>
            </div>

            {/* Status + Action Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(() => {
                const s = STATUS_MAP[detailModal.status] || STATUS_MAP.PENDING;
                const Si = s.Icon;
                return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', color: s.color, background: s.bg }}>
                    <Si size={14} /> {s.label}
                  </span>
                );
              })()}
              {detailModal.action && ACTION_MAP[detailModal.action] && (
                <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', color: ACTION_MAP[detailModal.action].color, background: ACTION_MAP[detailModal.action].bg }}>
                  {ACTION_MAP[detailModal.action].label}
                </span>
              )}
            </div>

            {/* Metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <DetailRow label="Posted" value={formatDate(detailModal.runAt || detailModal.createdAt)} />
              {detailModal.messageId && <DetailRow label="Message ID" value={`#${detailModal.messageId}`} />}
              {detailModal.channelInfo && <DetailRow label="Channel" value={detailModal.channelInfo} />}
              {detailModal.platform && <DetailRow label="Platform" value={detailModal.platform} />}
              {detailModal.errorMessage && <DetailRow label="Error" value={detailModal.errorMessage} danger />}
            </div>

            {/* Caption Editor */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Telegram Caption</label>
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                rows={5}
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  fontSize: 14, fontFamily: 'var(--font-body)',
                  color: 'var(--color-text)', outline: 'none',
                  resize: 'vertical', lineHeight: 1.5, minHeight: 100,
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {detailModal.status === 'SUCCESS' && detailModal.messageId && (
                <>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      flex: 1, height: 46, borderRadius: 'var(--radius-md)',
                      border: 'none', background: 'var(--color-primary)',
                      fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
                      color: '#fff', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Save size={14} /> Save & Update
                  </button>
                  <button
                    onClick={() => { handleDeleteMessage(detailModal); setDetailModal(null); }}
                    disabled={deleteMsg.isPending}
                    style={{
                      width: 46, height: 46, borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.15)',
                      color: '#ef4444', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: deleteMsg.isPending ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
              {detailModal.status === 'FAILED' && (
                <button
                  onClick={() => { setDetailModal(null); handleRetry(detailModal); }}
                  style={{
                    width: '100%', height: 46, borderRadius: 'var(--radius-md)',
                    border: 'none', background: 'var(--color-primary)',
                    fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
                    color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <RefreshCw size={14} /> Retry Syndication
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: danger ? 'var(--color-danger)' : 'var(--color-text)', fontFamily: 'var(--font-body)', textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

function Key({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}
