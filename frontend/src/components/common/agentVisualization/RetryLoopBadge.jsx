export default function RetryLoopBadge({ count = 0 }) {
  if (count === 0) return null;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--font-mono)', fontSize: 11,
      textTransform: 'uppercase', letterSpacing: 1.5,
      padding: '5px 14px',
      border: '1px solid rgba(245,197,24,0.4)',
      background: 'rgba(245,197,24,0.06)',
      borderRadius: 3, color: 'var(--yellow)',
    }}>
      <span style={{ animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>↻</span>
      Retry cycle: {count}
    </div>
  );
}
