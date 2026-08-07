import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';

const NAV_ITEMS = [
  { label: 'Dashboard',  path: '/dashboard',  icon: '▦' },
  { label: 'Profile',    path: '/profile',    icon: '👤' },
];

export default function Sidebar() {
  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-w)', zIndex: 200,
      background: 'rgba(14,14,18,0.95)',
      borderRight: '1px solid var(--panel-border)',
      display: 'flex', flexDirection: 'column',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '0 20px',
        height: 'var(--nav-h)',
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid var(--panel-border)',
      }}>
        <span className="font-display" style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>
          Dev<span style={{ color: 'var(--orange)' }}>Mesh</span>
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', padding: '0 8px', marginBottom: 10 }}>
          Navigation
        </div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 3, marginBottom: 2,
              fontFamily: 'var(--font-mono)', fontSize: 12,
              textDecoration: 'none',
              color:      isActive ? 'var(--orange)' : 'var(--muted)',
              background: isActive ? 'rgba(255,107,43,0.08)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--orange)' : '2px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid var(--panel-border)',
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--muted)', lineHeight: 1.6,
      }}>
        <div style={{ color: 'var(--orange)', marginBottom: 2 }}>DevMesh v0.1</div>
        AI-powered dev workspace
      </div>
    </aside>
  );
}
