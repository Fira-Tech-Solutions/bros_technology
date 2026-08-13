import { useState } from 'react';
import { useAgentCodes, useAgents, useGenerateAgentCode, useRevokeAgentCode, useRemoveAgent } from '../hooks';
import { Button, DataTable, Modal, Input, PageHeader, EmptyState, LoadingSpinner } from '../components/ui';
import { Users, Plus, Trash2, Copy, Check, Shield, UserX, RefreshCw } from 'lucide-react';

export default function Agents() {
  const [activeTab, setActiveTab] = useState('codes');
  const { data: codes = [], isLoading: codesLoading } = useAgentCodes();
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const generateCode = useGenerateAgentCode();
  const revokeCode = useRevokeAgentCode();
  const removeAgent = useRemoveAgent();
  const [generateModal, setGenerateModal] = useState(false);
  const [codeName, setCodeName] = useState('');
  const [codeRole, setCodeRole] = useState('agent');
  const [codeUses, setCodeUses] = useState('1');
  const [copiedCode, setCopiedCode] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const loading = codesLoading || agentsLoading;

  const handleGenerate = async () => {
    try {
      await generateCode.mutateAsync({
        name: codeName,
        role: codeRole,
        maxUses: parseInt(codeUses),
      });
      setGenerateModal(false);
      setCodeName('');
      setCodeRole('agent');
      setCodeUses('1');
    } catch (err) {
      console.error('Generate failed:', err);
    }
  };

  const handleRevoke = async () => {
    if (!deleteModal) return;
    try {
      const id = deleteModal.id || deleteModal._id;
      if (deleteModal._isAgent) {
        await removeAgent.mutateAsync(id);
      } else {
        await revokeCode.mutateAsync(id);
      }
      setDeleteModal(null);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeColumns = [
    {
      header: 'Code',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <code style={{ padding: '4px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-tint)', color: 'var(--color-primary)', fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>
            {row.code}
          </code>
          <button
            onClick={() => copyCode(row.code)}
            style={{ padding: 4, borderRadius: 4, color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)' }}
          >
            {copiedCode === row.code ? <Check size={13} style={{ color: 'var(--color-success)' }} /> : <Copy size={13} />}
          </button>
        </div>
      ),
    },
    { header: 'Name', render: (row) => <span style={{ fontSize: 14, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>{row.name || '—'}</span> },
    { header: 'Role', render: (row) => <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>{row.role || 'agent'}</span> },
    {
      header: 'Uses',
      render: (row) => (
        <span style={{ fontSize: 14, color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
          {row.uses || 0} / {row.maxUses || '∞'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => {
        const isActive = row.isActive !== false && (!row.maxUses || (row.uses || 0) < row.maxUses);
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: isActive ? 'var(--color-success)' : 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--color-success)' : 'var(--color-text-muted)' }} />
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setDeleteModal(row)}
            style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)' }}
            title="Revoke"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const agentColumns = [
    {
      header: 'Agent',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={16} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-body)', margin: 0 }}>{row.firstName || row.name || 'Agent'}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Role', render: (row) => <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>{row.role || 'agent'}</span> },
    {
      header: 'Registered',
      render: (row) => (
        <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setDeleteModal({ ...row, _isAgent: true }); }}
            style={{ padding: 6, borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)' }}
            title="Remove"
          >
            <UserX size={15} />
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
        title="Agents"
        subtitle={`${agents.length} registered agents`}
        action={<Button icon={Plus} onClick={() => setGenerateModal(true)}>Generate Code</Button>}
      />

      <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 4, border: '1px solid var(--color-border)', width: 'fit-content' }}>
        {['codes', 'registered'].map(tab => (
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
            {tab === 'codes' ? `Invitation Codes (${codes.length})` : `Registered (${agents.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'codes' ? (
        <DataTable columns={codeColumns} data={codes} emptyMessage="No codes generated" emptyIcon={Shield} />
      ) : (
        <DataTable columns={agentColumns} data={agents} emptyMessage="No agents registered" emptyIcon={Users} />
      )}

      <Modal open={generateModal} onClose={() => setGenerateModal(false)} title="Generate Invitation Code" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Code Name"
            placeholder="e.g. Agent Smith"
            value={codeName}
            onChange={(e) => setCodeName(e.target.value)}
          />
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Role</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['agent', 'super_admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setCodeRole(r)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${codeRole === r ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: codeRole === r ? 'var(--color-primary-tint)' : 'transparent',
                    color: codeRole === r ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {r === 'agent' ? 'Agent' : 'Super Admin'}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Max Uses"
            type="number"
            placeholder="1"
            value={codeUses}
            onChange={(e) => setCodeUses(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <Button variant="secondary" onClick={() => setGenerateModal(false)}>Cancel</Button>
          <Button loading={generateCode.isPending} onClick={handleGenerate} disabled={!codeName}>Generate</Button>
        </div>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={deleteModal?._isAgent ? 'Remove Agent' : 'Revoke Code'} size="sm">
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16, fontFamily: 'var(--font-body)' }}>
          {deleteModal?._isAgent
            ? `Remove agent ${deleteModal.firstName || deleteModal.email}? They will lose access.`
            : `Revoke code ${deleteModal?.code}? It can no longer be used.`
          }
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" icon={Trash2} loading={deleteModal?._isAgent ? removeAgent.isPending : revokeCode.isPending} onClick={handleRevoke}>Confirm</Button>
        </div>
      </Modal>
    </div>
  );
}
