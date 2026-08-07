export default function Loader({ size = 32, label = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 40 }}>
      <div style={{
        width: size, height: size,
        border: `2px solid var(--panel-border)`,
        borderTop: `2px solid var(--orange)`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {label && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 2 }}>
          {label}
        </span>
      )}
    </div>
  );
}
