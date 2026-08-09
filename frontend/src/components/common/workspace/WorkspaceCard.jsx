import { useNavigate } from 'react-router-dom';
import StatusBadge from '../StatusBadge';
import { timeAgo } from '../../../utils/formatDate';

export default function WorkspaceCard({ workspace, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      className="glass-panel"
      style={{
        padding: 22, cursor: 'pointer',
        borderTop: '2px solid var(--panel-border)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderTopColor = 'var(--orange)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,43,0.1)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderTopColor = 'var(--panel-border)';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.transform = '';
      }}
      onClick={() => navigate(`/workspace/${workspace._id}`)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 className="font-display" style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {workspace.name}
        </h3>
        <StatusBadge status={workspace.ingestionStatus === 'completed' ? 'active' : 'idle'} />
      </div>

      {workspace.description && (
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>
          {workspace.description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
          {timeAgo(workspace.updatedAt)}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(workspace._id); }}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
            background: 'none', border: 'none', cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: 1,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--red)'}
          onMouseLeave={e => e.target.style.color = 'var(--muted)'}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
