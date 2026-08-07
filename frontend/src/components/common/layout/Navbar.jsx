import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { SocketContext } from '../../../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { connected }    = useContext(SocketContext);

  return (
    <nav
      className="glass-panel"
      style={{
        position: 'fixed', top: 0, left: 'var(--sidebar-w)', right: 0,
        height: 'var(--nav-h)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px',
        borderRadius: 0,
        borderTop: 'none', borderRight: 'none',
        borderBottom: '1px solid var(--panel-border)',
        borderLeft: '1px solid var(--panel-border)',
      }}
    >
      {/* Left: breadcrumb placeholder */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
        devmesh / workspace
      </div>

      {/* Right: socket status + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* WS indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: connected ? 'var(--green)' : 'var(--red)',
            animation: connected ? 'pulse 2s ease infinite' : 'none',
          }} />
          {connected ? 'live' : 'offline'}
        </div>

        {/* User */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--orange)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff',
            }}>
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--steel)' }}>
              {user.name || user.email}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase',
            letterSpacing: 1, color: 'var(--muted)', background: 'none', border: 'none',
            cursor: 'pointer', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--orange)'}
          onMouseLeave={e => e.target.style.color = 'var(--muted)'}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
