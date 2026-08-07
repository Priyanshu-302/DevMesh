import { useState } from 'react';
import { useWorkspaces } from '../hooks/useWorkspaces';
import WorkspaceCard from '../components/common/workspace/WorkspaceCard';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { SkeletonPage } from '../components/common/Skeleton';

export default function DashboardPage() {
  const { workspaces, loading, error, createWorkspace, removeWorkspace } = useWorkspaces();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name: '', description: '' });
  const [creating, setCreating]   = useState(false);
  const [createErr, setCreateErr] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault(); setCreateErr(null); setCreating(true);
    try {
      await createWorkspace(form);
      setShowModal(false);
      setForm({ name: '', description: '' });
    } catch {
      setCreateErr('Failed to create workspace.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--orange)', marginBottom: 8 }}>
            Dashboard
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.1 }}>
            Your Workspaces
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8 }}>
            Each workspace is an isolated AI dev environment.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} style={{ flexShrink: 0 }}>
          + New Workspace
        </Button>
      </div>

      {/* Hazard stripe */}
      <div className="hazard-stripe" style={{ height: 2, marginBottom: 32, borderRadius: 1 }} />

      {/* Content */}
      {loading && <SkeletonPage rows={3} />}
      {error   && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)' }}>⚠ {error}</p>}

      {!loading && !error && workspaces.length === 0 && (
        <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🔧</div>
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
            No workspaces yet
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
            Create your first workspace to get started.
          </p>
          <Button onClick={() => setShowModal(true)}>+ New Workspace</Button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {workspaces.map(ws => (
          <WorkspaceCard key={ws._id} workspace={ws} onDelete={removeWorkspace} />
        ))}
      </div>

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Workspace">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="dm-label" htmlFor="ws-name">Workspace Name</label>
            <input id="ws-name" required className="dm-input" placeholder="e.g. my-saas-backend" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
          </div>
          <div>
            <label className="dm-label" htmlFor="ws-desc">Description (optional)</label>
            <input id="ws-desc" className="dm-input" placeholder="Brief description…" value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
          </div>
          {createErr && <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--red)' }}>⚠ {createErr}</p>}
          <Button type="submit" disabled={creating} style={{ width: '100%', marginTop: 4 }}>
            {creating ? '⟳ Creating…' : '→ Create Workspace'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
